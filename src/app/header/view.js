import Mn from 'backbone.marionette';
import _toLower from 'lodash/toLower';
import _startCase from 'lodash/startCase';
import $ from 'jquery';
import Template from './template.hbs';
import session from '../../common/session';

export default Mn.View.extend({
  template: Template,

  events: {
    'click #menuItem': 'highlight'
  },

  highlight(e) {
    $(e.target)
      .parent()
      .siblings('.active')
      .removeClass('active');
    $(e.target)
      .parent()
      .addClass('active');
  },
  initialize(options) {
    this.app = options.app;

  },
  onRender() {

    if (session.userHasRole('ROLE_ROOT') || session.userHasRole('ROLE_HUB_ADMIN')) {
      this.$el.find('#menu-manage').show()
    }
  },

  // FIXME Temporary function.
  // The full profile user name should
  // be retrieved from the server and not parsed from username.
  getUserProfileName() {
    const { username } = this.app.getSession().get('user');
    if (!username) {
      return 'Anonymous';
    }
    if (username.indexOf('_') > 0) {
      return _startCase(_toLower(username.split('_').join(' ')));
    }
    return _startCase(username);
  },
  serializeData() {
    return {
      mainItem: this.model.get('mainItem'),
      navigationItems: this.model.get('navigationItems'),
      username: this.getUserProfileName()
    };
  }
});
