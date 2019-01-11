$(function () {
  var consoleBlockSelector = '#web_console',
    consoleBlock = $(consoleBlockSelector);

  var isReady = function () {
    return 'READY';
  };
  if (stateId == 'Active' && isLocked == 'False') {
    sendAjaxRequest(consoleBlockSelector, consoleBlock.data('console-url'), {}, function (data) {
      if (data == 'powerOff') {
        LoadComplete(false);
        consoleBlock.find('#poweroff-block').removeClass('hidden');
      } else if (data == 'error') {
        LoadComplete(false);
        consoleBlock.find('#conn-err-block').removeClass('hidden');
      }
      else {
        param = data;
        param.width = 792;
        param.height = 300;
        LoadConsole();
      }
    }, function (data) {
      LoadComplete(false);
      consoleBlock.find('#conn-err-block').removeClass('hidden');
    });
  }
  function LoadConsole() {
    var init = function () {
      buildConsoleChrome();
      acquireTicket(param.vmName, param.vmId);
    };
    var giveUp = function () {
      vmware.log("ERROR", "init", "retries exhausted");
      $("body").text("Error reading data from the main vCloud Director UI. Please close this window, verify that your session is still active, and try again.");
    }

    init.runWhen(isReady, 100, 10, giveUp);

    LoadComplete(true);
    consoleBlock.find('#console-block').removeClass('hidden');
  };

  function LoadComplete(success) {
    consoleBlock.find('#event-processing').addClass('hidden');
    consoleBlock.find('.state-inprogress').addClass('hidden');

    if (success) {
      consoleBlock.find('.state-completed').removeClass('hidden');
    }
    else {
      consoleBlock.find('.state-completed').addClass('hidden');
      consoleBlock.find('.state-reject').removeClass('hidden');
    }
  }
});