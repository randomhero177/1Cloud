$(function () {

  /********** MESSENGERS PART **********/
  var alertBlockId = 'user-settings-alert',
    alertsBlock = document.getElementById(alertBlockId),
    alertsTypeSelect = document.getElementById('type-subscription-select'),
    buttonsBlock = $('.messengers__buttons'),
    buttonsSelector = '.messengers__buttons-item',
    infoBlock = $('.messengers__info'),
    disconnectMessengersSelector = '.messengers__disconnect',
    formSettingsId = 'user-setting-form',
    connectWindow;

  var userSettingsModel, infoTelegram, infoSlack, formSettings, userSettingsUrl;
  formSettings = document.getElementById(formSettingsId);

  if (alertsBlock !== null) {

    userSettingsUrl = formSettings.dataset.settingsUrl;
    infoTelegram = infoBlock.find('#connected-telegram');
    infoSlack = infoBlock.find('#connected-slack');

    getAccountManageModel(initAlerts)
  }

  $(disconnectMessengersSelector).click(function (e) {
    e.preventDefault();
    sendAjaxRequest('#' + formSettingsId, $(this).attr('href'), {}, deactivateMessengeInfo);
  });

  function getAccountManageModel(successFunc) {
    succeccCb = (typeof successFunc === 'function') ? successFunc : function (data) { console.log(data); };
    $.get(userSettingsUrl, null, succeccCb);
  }

  function initAlerts(data) {
    userSettingsModel = data;
    initTypeSelect(userSettingsModel.NotificationChannels, true);
    initConnectionButtons();
  }
  function initTypeSelect(channels, isFirst) {
    channels.forEach(function (el) {
      let option = alertsTypeSelect.querySelector('option[value="' + el.Type + '"]');
      option.selected = el.IsSelected;
      option.disabled = !el.IsActive;
    });

    if (typeof isFirst === 'boolean' && isFirst) {
      $(alertsTypeSelect).chosen({ disable_search_threshold: 10, width: '100%' });
    } else {
      $(alertsTypeSelect).trigger('chosen:updated');
    }
  }
  function initConnectionButtons() {
    var frameWidth = 400;
    var frameHeight = 530;

    $(buttonsSelector).each(function () {
      $(this).click(function (e) {
        if (!buttonsBlock.hasClass('loading')) {
          buttonsBlock.addClass('loading loading--full');
          connectWindow = window.open('', 'connectWindow', 'resizable=yes,scrollbars=yes,status=yes,width=' + frameWidth + ',height=' + frameHeight + ',left=' + ((window.innerWidth - frameWidth) / 2) + ',top=' + ((window.innerHeight - frameHeight) / 2));

          sendAjaxRequest('#' + formSettingsId, $(this).data('action'), {}, initConnectionProcess);
        }
      });
    });
  }

  function initConnectionProcess(data) {
    var timeout = false;
    var timeoutMs = 121000; // 121 sec, 2 minutes
    var interval = 2000; // 2 sec, timeout for watching model after connection request

    connectWindow.document.location = data.redirectLink;

    if ($(errorSummarySelector).length > 0) {
      $(errorSummarySelector).remove();
    }
    getAccountManageModel(checkConnectionResponse);
    timeout = setTimeout(closeWindowTooLong, timeoutMs);

    function checkConnectionResponse(response) {
      if (response.IsSlackConnected || response.IsTelegramConnected) {
        activateMessengerInfo(response);
        resetWindowConnection();

        let notice = new PanelNotice(resources.Account_Messengers_Activated, 'success');
        return;
      }

      if (!connectWindow.closed) {
        setTimeout(function () {
          getAccountManageModel(checkConnectionResponse);
        }, interval);
      } else {
        if ($(errorSummarySelector).length === 0) {
          resetWindowConnection(resources.Account_Messengers_Unexpected_Interruption);
        }
      }
    }
    function closeWindowTooLong() {
      if (!connectWindow.closed) {
        resetWindowConnection(resources.Account_Messengers_Timeout);
      }
    }
    function resetWindowConnection(errorMsg) {
      buttonsBlock.removeClass('loading loading--full');
      if (connectWindow !== null) {
        connectWindow.close();
      }
      if (typeof errorMsg !== 'undefined') {
        showSummaryMessage(errorMsg, '#' + alertBlockId);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    }

  }

  function activateMessengerInfo(response) {
    userSettingsModel = response;

    if (userSettingsModel.IsSlackConnected) {
      infoSlack.find('.messengers__channel').text(userSettingsModel.SlackChannel);
      infoSlack.removeClass('hidden');
      infoTelegram.addClass('hidden');
    }
    if (userSettingsModel.IsTelegramConnected) {
      infoTelegram.find('.messengers__channel').text(userSettingsModel.TelegramBotName);
      infoTelegram.removeClass('hidden');
      infoSlack.addClass('hidden');
    }
    buttonsBlock.addClass('hidden');
    infoBlock.removeClass('hidden');
    initTypeSelect(userSettingsModel.NotificationChannels);
  }

  function deactivateMessengeInfo(data) {
    userSettingsModel = data;
    if (!(userSettingsModel.IsSlackConnected || userSettingsModel.IsTelegramConnected)) {
      buttonsBlock.removeClass('hidden');
      infoBlock.addClass('hidden');
      initTypeSelect(userSettingsModel.NotificationChannels);

      let notice = new PanelNotice(resources.Account_Messengers_Deactivated, 'success');
    }
  }

  /********** SUBMIT PART **********/
  $(formSettings).submit(function (e) {
    e.preventDefault();
    e.stopPropagation();
    sendAjaxRequest('#' + formSettingsId, formSettings.action, getSettingsObject(), function () {
      AjaxOnSuccess('user-setting-form', 'succes-change-user-settings');
    });
  });
  function getSettingsObject() {
    var result = {};
    result.FirstName = formSettings.elements.FirstName.value;
    result.LastName = formSettings.elements.LastName.value;
    result.VkProfileLink = formSettings.elements.VkProfileLink.value;
    result.FacebookProfileLink = formSettings.elements.FacebookProfileLink.value;
    result.SelectedNotificationChannel = formSettings.elements.SelectedNotificationChannel.value;

    if (typeof userSettingsModel !== 'undefined' && userSettingsModel.IsAutoPaymentActive) {
      result.IsAutoPaymentActive = userSettingsModel.IsAutoPaymentActive;
      result.AutoPayment = document.querySelector('[name="AutoPayment"]').value;
      result.AutoPaymentLimitMonth = document.querySelector('[name="AutoPaymentLimitMonth"]').value;
    }
    return result;
  }
});