
// The file is used on CreateMetric and CreateHost
var CreateHost = {
  config: {
    formId: '#monitoring-form',
    selectCommandId: '#check-command-select',
    commandBlockId: '#check-command',
    commandParentBlockId: '#check-command-container',
    checkboxClass: 'location-checkbox',
    setAllPoints: 'checkbox-set-all',
    hostOrIpElem: $('#HostIpOrDomain')
  },
  view: {
    submitForm: function () {
      var c = CreateHost.config,
        form = $(c.formId),
        extraOptions = $(c.commandBlockId).find('input.monitoring__extra-inp'),
        locations = $('.' + c.checkboxClass),
        obj = {};
      obj.Locations = [];
      obj.CheckCommand = {};
      obj.HostIpOrDomain = form.find('[name="HostIpOrDomain"]').val();
      obj.EnableNotifications = form.find('[name="EnableNotifications"]').is(':checked');
      obj.CheckCommandName = form.find('[name="CheckCommandName"]').val();
      obj.CheckTimeout = form.find('[name="CheckTimeout"]').val();
      obj.CheckInterval = form.find('[name="CheckInterval"]').val();
      
      locations.each(function (i) {
        var curLocation = {};
        if ($(this).is(':checked')) {
          curLocation['IsSelected'] = true;
          curLocation['Location'] = $(this).siblings('.model-location').val();
          obj.Locations.push(curLocation);
        };
      });

      extraOptions.each(function (i, el) {
        obj.CheckCommand[$(this).attr('name')] = ($(this).attr('type') === 'checkbox') ? $(this).is(':checked') : $(this).val();
      });

      reachCounterGoal('monitoringcreated', 'submit');
      sendAjaxRequest(CreateHost.config.formId, form.attr('action'), obj, null, showErrorsWithObjName)
    },
    drawAutofillOptions: function (value) {
      var block = $('#monitoring-autofill');
      block.empty();
      block.addClass('hidden');
      if (value.length > 0) {
        block.removeClass('hidden');
        autofillArr.forEach(function (el) {
          if (el.indexOf(value) !== -1) {
            var option = $('<div/>', {
              'class': 'monitoring__autofill-item',
              'text': el
            }).click(function () {
              CreateHost.config.hostOrIpElem.val(el);
            });
            block.append(option);
          }
        });
      };
      $('#container').click(function () {
        block.addClass('hidden')
      })
    },
    init: function () {
      initSelect(CreateHost.config.formId + ' .chosen-select');
      
      toggleAllCheckbox('location-points', CreateHost.config.checkboxClass, CreateHost.config.setAllPoints);
      CreateHost.config.hostOrIpElem.keyup(function () {
        CreateHost.view.drawAutofillOptions($(this).val());
      });
      $(CreateHost.config.formId).submit(function (e) {
        e.preventDefault();

        if ($(CreateHost.config.formId).valid()) {
          CreateHost.view.submitForm();
        }
      })
    }
  }
}

CreateHost.view.init();
var hostC = CreateHost.config,
metricOptions = new DrawOptions(actionsJson, commandViewsUrlJson, hostC.selectCommandId, hostC.commandBlockId, hostC.formId);