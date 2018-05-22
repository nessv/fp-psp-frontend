import Bn from 'backbone';
import env from '../../../../env';

export default Bn.Model.extend({
  urlRoot: `${env.API}/snapshots/priority`,
  id: 'snapshotIndicatorId',

  validate(attrs = {}) {
    const errors = [];
    if(!attrs.is_attainment){
      if (attrs.action === '') {
        errors.push(t('survey.priority.messages.mising-field', {field: t('survey.priority.add.action')}));
      }

      if (attrs.estimated_date === null) {
        errors.push(t('survey.priority.messages.mising-field', {field: t('survey.priority.add.estimated-date')}));
      }

    }

    if (attrs.reason === '') {
      attrs.is_attainment ?
        errors.push(t('survey.priority.messages.mising-field', {field: t('survey.priority.add.comments')})) :
            errors.push(t('survey.priority.messages.mising-field', {field: t('survey.priority.add.reason')}))
    }



    return errors.length > 0 ? errors : undefined;
  }
});
