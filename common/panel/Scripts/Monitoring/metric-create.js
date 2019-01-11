
// The file is used on CreateMetric and CreateMetric
var CreateMetric = {
  config: {
    formId: '#create-metric-form',
    selectCommandId: '#metric-command-select',
    commandBlockId: '#metric-command',
    createMetricBtn: '#create-metric-btn',
    modalBlock: '#create-block-modal',
    createMetricForm: '#create-metric-form'
  },
  item: {
    submitForm: function () {

      var form = $(CreateMetric.config.formId),
        obj = {},
        extraOptions = form.find('.monitoring__extra-inp');
      obj.hostId = $('#monitoring-edit-tabs').data('hostid');
      obj.CheckCommandName = form.find('[name="CheckCommandName"]').val();
      obj.Name = form.find('[name="Name"]').val();
      obj.CheckTimeout = form.find('[name="CheckTimeout"]').val();
      obj.CheckInterval = form.find('[name="CheckInterval"]').val();
      obj.EnableNotifications = form.find('[name="EnableNotifications"]').is(':checked');
      obj.CheckCommand = {};
      extraOptions.each(function (i, el) {
        obj.CheckCommand[$(this).attr('name')] = ($(this).attr('type') === 'checkbox') ? $(this).is(':checked') : $(this).val();
      });

      
      sendAjaxRequest(CreateMetric.config.formId, form.attr('action'), obj, function () {
        $(CreateMetric.config.modalBlock).modal('hide');
      }, showErrorsWithObjName)
    },
    smtpListener: function () {
      var c = CreateMetric.config,
        block = $(c.formId),
      select = block.find(c.selectCommandId),
      smtpSelect = block.find('#check-command-smtp');
      if (smtpSelect.length > 0) {
        toggleBlock();
        smtpSelect.off('change');
        smtpSelect.on('change', function () {
          toggleBlock();
        })
      };

      function toggleBlock() {
        var selectedVal = smtpSelect.val(),
          dependentBlock = $('.js-smtp-selectable');
        dependentBlock[(selectedVal == '1') ? 'addClass' : 'removeClass']('hidden');
      }
    }
  },
  view: {
    init: function () {
      initSelect(CreateMetric.config.formId + ' .chosen-select');
      $(CreateMetric.config.createMetricBtn).click(function (e) {
        e.preventDefault();
        $(CreateMetric.config.modalBlock).modal('show');
      });
      $(CreateMetric.config.createMetricForm).submit(function (e) {
        e.preventDefault();
        CreateMetric.item.submitForm();
      })
    }
  }
}
CreateMetric.view.init();
var metricC = CreateMetric.config,
  metricOptions = new DrawOptions(metricActionsJson, metricCommandViewsUrlJson, metricC.selectCommandId, metricC.commandBlockId, metricC.formId, CreateMetric.item.smtpListener);