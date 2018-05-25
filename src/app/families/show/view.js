import Bn from 'backbone';
import Mn from 'backbone.marionette';
import moment from 'moment';
import $ from 'jquery';
import Template from '../template.hbs';
import SnapshotsTemplate from '../show/snapshot/template.hbs';
import UnderConstrucionTemplate from '../../utils/under_construction_template.hbs';
import storage from '../storage';
import TermCondPolView from '../../termcondpol/view';
import TermCondPolModel from '../../termcondpol/model';
import session from "../../../common/session";

export default Mn.View.extend({
  template: Template,
  events: {
    'click #newSurvey': 'newSurvey'
  },
  initialize(options) {
    this.app = options.app;
    this.entity = options.entity;
    this.model = options.model;
  },
  onRender() {
    const headerItems = storage.getSubHeaderItems(this.model);
    this.app.updateSubHeader(headerItems);

    if (this.entity == null) {
      $('#sub-header .navbar-header > .navbar-brand').addClass('subActive');
    } else {
      $(`a.sub-menu-item[href$="${this.entity}"]`)
        .parent()
        .addClass('subActive');
    }

    if (session.userHasRole('ROLE_SURVEY_USER')) {
      this.$el.find('#newSurvey').show();
    }
  },
  onAttach() {
    if (this.app.getSession().userHasRole('ROLE_APP_ADMIN')) {
      this.$el.find('#edit-family').show();
    }
  },
  getTemplate() {
    if (this.entity === 'interventions') {
      // return InterventionsTemplate;
      return UnderConstrucionTemplate;
    }
    if (this.entity === 'snapshots') {
      return SnapshotsTemplate;
    }
    return Template;
  },

  serializeData() {
    return {
      family: this.model.attributes,
      createdAt: this.getCreatedAt(),
      className: this.isPrioritized(),
      formattedPlace: this.getFormattedPlace()
    };
  },
  getCreatedAt() {
    const createdAt = this.model.attributes.snapshot_indicators.created_at;
    if (!createdAt) {
      return null;
    }
    return moment(createdAt).format('YYYY-MM-DD');
  },
  isPrioritized() {
    const isPrioritized = this.model.attributes.snapshot_indicators.indicators_priorities;
    if (!isPrioritized) {
      return null;
    }
    return isPrioritized.length > 0 ? 'hidden' : '';
  },
  getFormattedPlace() {
    if (this.model.get('city') || this.model.get('country')) {
      return `${this.model.get('city') ? this.model.get('city').city : ''} \
        - ${this.model.get('country') ? this.model.get('country').country : ''}`;
    }
    return null;
  },
  getJsonData() {
    let data = {};
    data.firstName = this.model.attributes.snapshot_indicators.family.person.firstName;
    data.lastName = this.model.attributes.snapshot_indicators.family.person.lastName;
    data.identificationNumber = this.model.attributes.snapshot_indicators.family.person.identificationNumber;
    data.identificationType = this.model.attributes.snapshot_indicators.family.person.identificationType;
    data.birthdate = this.model.attributes.snapshot_indicators.family.person.birthdate;
    data.countryOfBirth = this.model.attributes.snapshot_indicators.family.person.countryOfBirth.alfa2Code;
    data.phoneNumber = this.model.attributes.snapshot_indicators.family.person.phoneNumber;
    data.familyId = this.model.attributes.snapshot_indicators.family.familyId;
    data.gender = this.model.attributes.snapshot_indicators.family.person.gender;
    data.email = this.model.attributes.snapshot_indicators.family.person.email;
    data.postCode = this.model.attributes.snapshot_indicators.family.person.postCode;
    return data;
  },
  newSurvey(event) {
    event.preventDefault();
    let self = this;
    this.app.getSession().save({termCond: 0, priv: 0});
    this.app.getSession().save({reAnswer: false, formData: null});
    const model = new TermCondPolModel();
    const app = this.app;
    const language = this.app.getSession().getLocale() === 'es_PY' ? 'ESP' : 'ENG';
    model
      .fetch({
        data: {
          type: 'TC',
          language
        }
      })
      .then(() => {
        this.app.showViewOnRoute(new TermCondPolView({

           app,
           model,
           surveyId: this.model.attributes.snapshot_indicators.survey_id,
           reAnswer: true,
           formData: self.getJsonData()

        }));
      });

    Bn.history.navigate(`/survey/${this.model.attributes.snapshot_indicators.survey_id}/termcondpol/TC/ESP`);
  }
});
