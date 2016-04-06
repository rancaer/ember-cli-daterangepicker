import Ember from 'ember';
import moment from 'moment';

export default Ember.Component.extend({
  classNames: ['form-group'],
  attributeBindings: ['start', 'end', 'serverFormat'],
  start: undefined,
  end: undefined,
  timePicker: false,
  timePickerIncrement: 30,
  format: 'MMM D, YYYY',
  serverFormat: 'YYYY-MM-DD',
  rangeText: Ember.computed(function () {
    let format = this.get('format');
    let serverFormat = this.get('serverFormat');
    let start = this.get('start');
    let end = this.get('end');
    let timezone = this.get('timezone');
    if (!Ember.isEmpty(start) && !Ember.isEmpty(end)) {
      start = moment(start, serverFormat);
      end = moment(end, serverFormat);
      return start.format(format) + this.get('separator') + end.format(format);
    }
    return '';
  }),
  opens: null,
  drops: null,
  separator: ' - ',
  singleDatePicker: false,
  placeholder: null,
  buttonClasses: ['btn'],
  applyClass: null,
  cancelClass: null,
  autoUpdateInput: false,
  autoApply: false,
  ranges: {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  },
  removeDropdownOnDestroy: false,
  cancelLabel: 'Cancel',
  applyAction: null,
  cancelAction: null,

  //Init the dropdown when the component is added to the DOM
  didInsertElement: function() {
    var self = this;

    let momentStartDate = moment(this.get('start'), this.get('serverFormat'));
    let momentEndDate = moment(this.get('end'), this.get('serverFormat'));
    let startDate = momentStartDate.isValid() ? momentStartDate : undefined;
    let endDate = momentEndDate.isValid() ? momentEndDate : undefined;


    let timezone = this.get('timezone');
    if (timezone && startDate && endDate) {
      startDate.tz(timezone);
      endDate.tz(timezone);
    }



    this.$('.daterangepicker-input').daterangepicker({
      locale: {
        cancelLabel: this.get('cancelLabel')
      },
      format: this.get('format'),
      startDate: startDate,
      endDate: endDate,
      autoUpdateInput: this.get('autoUpdateInput'),
      autoApply: this.get('autoApply'),
      timePicker: this.get('timePicker'),
      timePickerIncrement: this.get('timePickerIncrement'),
      ranges: this.get('ranges'),
      buttonClasses: this.get('buttonClasses'),
      applyClass: this.get('applyClass'),
      cancelClass: this.get('cancelClass'),
      separator: this.get('separator'),
      singleDatePicker: this.get('singleDatePicker'),
      drops: this.get('drops'),
      opens: this.get('opens')
    });

    this.$('.daterangepicker-input').on('show.daterangepicker', function(ev, picker) {
      let format = self.get('format');
      let startDate = moment(self.get('start'), format);
      let endDate = moment(self.get('end'), format);

      picker.setStartDate(startDate.format(format));
      picker.setEndDate(endDate.format(format));
    });

    this.$('.daterangepicker-input').on('apply.daterangepicker', function(ev, picker) {

      let start = picker.startDate;
      let end = picker.endDate;

      if (timezone) {
        start.tz(timezone);
        end.tz(timezone);
      }

      start = start.format(self.get('serverFormat'));
      end = end.format(self.get('serverFormat'));
      var applyAction = self.get('applyAction');

      if (applyAction) {
        Ember.assert(
          'applyAction for date-range-picker must be a function',
          typeof applyAction === 'function'
        );
        applyAction(start, end);
      } else {
        self.setProperties({start, end});
      }
    });

    this.$('.daterangepicker-input').on('cancel.daterangepicker', function() {
      var cancelAction = self.get('cancelAction');

      if (cancelAction) {
        Ember.assert(
          'cancelAction for date-range-picker must be a function',
          typeof cancelAction === 'function'
        );
        cancelAction();
      } else {
        self.set('start', self.get('start'));
        self.set('end', self.get('end'));
      }
    });


  },

  //Remove the hidden dropdown when this component is destroyed
  willDestroy: function () {
    if (this.get('removeDropdownOnDestroy')) {
      Ember.$('.daterangepicker').remove();
    }
  }
});
