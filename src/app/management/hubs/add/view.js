import Mn from 'backbone.marionette';
import $ from 'jquery';
import moment from 'moment';
import {history} from 'backbone';
import Template from './template.hbs';
import Model from '../model';
import storage from '../storage';
import utils from '../../../utils';
import FlashesService from '../../../flashes/service';
import TermCondPolModel from '../../termcondpol/model';
import LastTermCondPolModel from '../../../termcondpol/model';

export default Mn.View.extend({
  template: Template,
  events: {
    'click .select-file': 'selectFile',
    'click .select-term-file' : 'selectTermFile',
    'click .select-pol-file' : 'selectPolFile',
    'change #input-image-file': 'previewFile',
    'click #submit': 'handleSubmit',
    'change #input-terms-file': 'handleTermsCondFile',
    'change #input-pol-file': 'handlePolFile'
  },
  initialize(options) {
    this.app = options.app;
    this.model = options.model || new Model();
    this.termCondPolModel = new TermCondPolModel();
    this.getDefaultValues();
  },
  serializeData() {
    return {
      application: this.model.attributes,
      isNew: this.model.get('id') === undefined,
      logoImage: this.model.get('logoUrl') || '/static/images/icon_camara.png',
      formImage: '/static/images/formulario.png',
      termCond: this.termCond,
      pol: this.privacyPolicy
    };
  },
  getDefaultValues() {
    var self = this
    this.getLastTermCondPol('TC', 0).then(result => {
      self.termCond = result;
    });
    this.getLastTermCondPol('PRIV', 0).then(result => {
      self.privacyPolicy = result;
    });
  },
  onRender() {
    let headerItems;
    if(this.app.getSession().userHasRole('ROLE_ROOT')){
      headerItems = storage.getUserSubHeaderItems();
    }else{
      headerItems = storage.getSubHeaderItems();
    }
    this.app.updateSubHeader(headerItems)
    $('a[href$="management/applications"]')
      .parent()
      .addClass('subActive');

  },
  selectFile() {
    this.$el.find('#input-image-file').click();
  },
  selectTermFile() {
    this.$el.find("#input-terms-file").click();
  },
  selectPolFile() {
    this.$el.find("#input-pol-file").click();
  },
  previewFile() {
    var self = this;
    var reader = new FileReader();
    let logoImage = this.$el.find('#image-logo');
    reader.onload = () => {
      self.file = reader.result;
      logoImage.attr('src', self.file);
    };
    reader.readAsText(this.$el.find('#input-image-file').prop('files')[0]);
  },
  handleTermsCondFile() {
    var termCond = this.$el.find('#input-terms-file').prop('files')[0];
    this.readSingleFile(termCond, 'termcond');
  },
  handlePolFile() {
    var pol = this.$el.find('#input-pol-file').prop('files')[0];
    this.readSingleFile(pol, 'pol');
  },
  readSingleFile(uploadedFile, type) {
    var self = this;
    var reader = new FileReader();
    reader.onload = () => {
      if(self.validateInputFile(uploadedFile.name)) {
        self.$el.find(`#${  type  }-file`).attr('src', '/static/images/ok-form.png');

        if (type === 'termcond') {
          self.termCond = reader.result;
        } else {
          self.privacyPolicy = reader.result;
        }
        self.hasErrors = false;
      } else {
        self.$el.find(`#${  type  }-file`).attr('src', '/static/images/cancel-form.png');
        self.hasErrors = true;
        FlashesService.request('add', {
          timeout: 5000,
          type: 'danger',
          title: t('hub.messages.bad-file')
        });
      }
    };
    reader.readAsText(uploadedFile);
  },
  validateInputFile(file) {
    return (file.match(/\.(html)$/i));
  },
  saveTermsCondPol(appId) {
    var self = this;
    this.termCondPolModel.set('version', '0.0.1');
    this.termCondPolModel.set('year', moment().year());
    this.termCondPolModel.set('id_application', appId);

    this.getLastTermCondPol('TC', appId).then(html => {
      self.termCondPolModel.set('type_cod', 'TC');

      if(!html) {
        self.saveAsNewOne('TC');
        return;
      }
      self.termCondPolModel.set('html', self.termCond);
      if(self.termCond !== html) {
        self.termCondPolModel.save({});
      }
    }).then(() => {
      self.termCondPolModel.set('type_cod', 'PRIV');

      this.getLastTermCondPol('PRIV', appId).then(html => {
        if(!html) {
          self.saveAsNewOne('PRIV');
          return;
        }
        self.termCondPolModel.set('html', self.privacyPolicy);
        if(self.termCond !== html) {
          self.termCondPolModel.save({});
        }
      });
    });
  },
  saveAsNewOne(type) {
    if(type === 'TC') {
      this.termCondPolModel.set('html', this.termCond);
    } else  {
      this.termCondPolModel.set('html', this.privacyPolicy);
    }
    this.termCondPolModel.save({});
  },
  getLastTermCondPol(type, applicationId) {
    var model = new LastTermCondPolModel();
    return model.fetch({
      data: {type, applicationId},
    }).then((response) => response.html).catch(response => {
      if(response.status === 400) {
        return false;
      }
    });
  },
  handleSubmit(event) {
    var self = this;
    event.preventDefault();
    const button = utils.getLoadingButton(this.$el.find('#submit'));

    this.$el
      .find('#form')
      .serializeArray()
      .forEach(element => {
        this.model.set(element.name, element.value);
      });
    this.model.set('file', this.file);

    let errors = this.model.validate();
    
    if (errors) {
      errors.forEach(error => {
        FlashesService.request('add', {
          timeout: 3000,
          type: 'danger',
          title: error
        });
      });
      button.reset();
      return;
    }
    if (this.hasErrors) {
      FlashesService.request('add', {
        timeout: 3000,
        type: 'danger',
        title: t('hub.messages.insert-file')
      });
      button.reset();
      return;
    }

    button.loading();
    storage
      .save(this.model)
      .then(data => {
        button.reset();
        history.navigate('management/applications', {trigger: true});
        FlashesService.request('add', {
          timeout: 3000,
          type: 'info',
          title: t('hub.save.success')
        });
        self.saveTermsCondPol(data.attributes.id);
      })
      .catch(response => {
        if (response.status === 400) {
          FlashesService.request('add', {
            timeout: 3000,
            type: 'danger',
            title: t('hub.save.failed')
          });
        }
        button.reset();
      });
  }
});
