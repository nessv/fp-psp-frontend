import Mn from 'backbone.marionette';
import Bb from 'backbone';
import c3 from 'c3';
import $ from 'jquery';
import moment from 'moment';
import Template from './template.hbs';



export default Mn.View.extend({
  template: Template,

  initialize() {
    if (this.model) {
      this.organization = this.model.attributes;
      setTimeout(() => {
      if(!$.isEmptyObject(this.organization.dashboard.snapshotTaken.byMonth)){
          $('.no-data').hide();
          this.chart();
        }
      }, 0);
    }
  },

  onRender() {
    this.months = ["","January", "February", "March", "April", "May", "June","July",
     "August","September","October","November","December"]
  },

  getTakenData(idx){
    let data = {};
    let o = this.organization.dashboard.snapshotTaken.byMonth;
    let key = Object.keys(o)[idx];
    if (moment(key).format('MM') === moment().format('MM')) {
      data.key = 'Today'
    }else{
      data.key = moment(key).locale('en').format('MMMM');
    }
    let value = o[key]
    data.value = value;
    return data;

  },

  chart(){
    c3.generate({
        bindto: '#bar-snapshots-taken',
        data: {
           x: 'x',
          columns: [
            ['x', this.getTakenData(0).key,this.getTakenData(1).key, this.getTakenData(2).key],
            ['data1', this.getTakenData(0).value, this.getTakenData(1).value, this.getTakenData(2).value],
          ],
          names: {
            data1: 'Snapshots Taken',
          },
          colors:{
                data1: '#60b4ef',
              },

          type: 'bar',
          labels: true,
          empty: {
            label: {
              text: "No Data"
            }
          }
        },
        axis: {
            x: {
                type: 'category'
            },
            y: {
               show: false
             }
        },
        bar: {
         width: {
             ratio: 0.6
            }
         },
        size: {
            height: 200
          },
        legend: {
            show: false
          }
    });
  },

  serializeData() {
    if (!this.model) {
      this.model = new Bb.Model();
    }
    return {
      organization: this.model.attributes
    };

  }
});
