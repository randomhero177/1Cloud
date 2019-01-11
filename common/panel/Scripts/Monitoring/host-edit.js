
var EditHost = {
  config: {
    formClass: '.monitoring__form',
    formId: '#monitoring-form',
    formBtnId: '#submit-form',
    selectCommandId: '#check-command-select',
    commandBlockId: '#check-command',
    commandParentBlockId: '#check-command-container',
    checkboxClass: 'location-checkbox',
    setAllPoints: 'checkbox-set-all',
    hostOrIpElem: $('#HostIpOrDomain'),
    forceCheckBtn: '.js-force-check',
    stateIcon: '.monitoring__icon-state',
    switchItem: '.monitoring__item-connection-inp'
  },
  view: {
    initSelect: function () {
      initSelect(EditHost.config.formId + ' .chosen-select')
    },
    submitForm: function () {
      var c = EditHost.config,
        btn = $(c.formBtnId),
        form = $(c.formId);
      form.submit(function (e) {
        e.preventDefault();
        EditHost.model.getObj()
        sendAjaxRequest(c.formId, form.attr('action'), EditHost.model.getObj(), function () {
          var form = $(c.formId);
          form.addClass('loading loading--full');
          setTimeout(function () {
            form.removeClass('loading loading--full');
          }, 3000)
        }, showErrorsWithObjName);
        
      })
    },
    forceCheck: function (el) {
      var block = $('#main');
      block.addClass('loading loading--full');
      sendAjaxRequest('#monitoring-edit-tabs', el.attr('href'), { hostId: el.data('id')}, function (data) {
        setStatus(data, $('#host-status'));
        setDate(data, $('#last-check-row'));
        setTimeout(function () {
          block.removeClass('loading loading--full');
          var showNotice = new PanelNotice('Состояние хоста обновлено', 'success');
        }, 2000);
      }, function (data) {
        let showNotice = new PanelNotice('Ошибка в ходе выполнения запроса');
        block.removeClass('loading loading--full');
      });
    },
    enableHost: function (elem) {
      var c = EditHost.config,
        input = elem.siblings(c.switchItem),
        block = $('#main');
      block.addClass('loading loading--full');
      sendAjaxRequest(c.formId, input.data('url'), { IsEnabled: input.is(':checked') }, function (data) {
        setTimeout(function () {
          block.removeClass('loading loading--full');
          let enabledText = (input.is(':checked')) ? 'подключен к услуге Мониторинг' : 'отключен от услуги Мониторинг',
            showNotice = new PanelNotice('Хост ' + input.data('name') + ' ' + enabledText, 'success');
        }, 3000);
      }, function () {
        block.removeClass('loading loading--full');
        let showNotice = new PanelNotice('Ошибка', 'danger');
      });
    },
    init: function () {
      var c = EditHost.config;
      EditHost.view.initSelect();
      toggleAllCheckbox('location-points', EditHost.config.checkboxClass, EditHost.config.setAllPoints);
      EditHost.view.submitForm();
    }
  },
  model: {
    getObj: function () {
      var c = EditHost.config,
        obj = {},
        extraOptions = $(c.commandBlockId).find('input.monitoring__extra-inp'),
        locations = $('#location-points .' + c.checkboxClass),
        command = $(c.selectCommandId),
        form = $(c.formId);
      obj.Locations = [];
      obj.EnableNotifications = form.find('[name="EnableNotifications"]').is(':checked');
      obj.CheckCommandName = command.find('option:selected').val();
      obj.CheckCommand = {};
      obj.CheckTimeout = form.find('[name="CheckTimeout"]').val();
      obj.CheckInterval = form.find('[name="CheckInterval"]').val();
      locations.each(function (i) {
        var curLocation = {};
        if ($(this).is(':checked')) {
          curLocation['IsSelected'] = true;
          curLocation['Location'] = $(this).siblings('.model-location').val();
          obj.Locations.push(curLocation);
        }
      });

      extraOptions.each(function (i, el) {
        obj.CheckCommand[$(this).attr('name')] = ($(this).attr('type') === 'checkbox') ? $(this).is(':checked') : $(this).val();
      });
      return obj
    }
  },
  init: function () {
    EditHost.view.init();
    initItemSwitch($(EditHost.config.switchItem), 'connected', function () {
      EditHost.view.enableHost($(this));
    }, '', '');

    $('#force-check-btn').click(function (e) {
      e.preventDefault();
      EditHost.view.forceCheck($(this));
    });
    
    if (!isHostEnabled) {
      $(EditHost.config.forceCheckBtn).addClass('hidden');
    };
  }
}

var hostC = EditHost.config,
  hostOptions = new DrawOptions(actionsJson, commandViewsUrlJson, hostC.selectCommandId, hostC.commandBlockId, hostC.formId);
EditHost.init();
