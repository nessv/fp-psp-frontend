import TermCondPolView from './view';
import TermCondPolModel from './model';

const termcondpol = props => {
  const { app } = props;
  const routes = {
    appRoutes: {
        'survey/:id/termcondpol/:type/:applicationId': 'showTermCondPol'
    },
    controller: {

      showTermCondPol(hashSurvey, hashType, hashApplicationId) {
        const model = new TermCondPolModel();
        const surveyId = parseInt(hashSurvey, 10);
        const formData = app.getSession().get('formData');
        const reAnswer = app.getSession().get('reAnswer');
        model
          .fetch({
            data: {
              type: hashType,
              surveyId,
              applicationId: hashApplicationId
            }
          })
          .then(() => {
            app.showViewOnRoute(new TermCondPolView({
               model, app, surveyId, reAnswer, formData
             }));
          });
      }
    }
  };
  return routes;
};

export default termcondpol;
