import Storage from 'backbone.storage';

var SnapshotItemStorage = Storage.extend({
    
    getSubHeaderItems(model) {
      return {
        mainItem: {
          name: t('subheader.surveys.priority'),
          link: `/#survey/${model.attributes.survey_id}/snapshot/${model.attributes.snapshot_economic_id}`
        }
      };
    }
  });
  
  export default new SnapshotItemStorage();