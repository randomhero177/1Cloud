var errorClass = 'field-validation-error',
  errorSelector = '.' + errorClass,
  errorSummaryClass = 'error-summary alert alert-danger',
  errorSummarySelector = '.error-summary';

var errorElem = $('<span/>', {
  'class': errorClass,
  'text': resources.Required
});

if ([].indexOf) {

  var findInArr = function (array, value) {
    return array.indexOf(value);
  }

} else {
  var findInArr = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value) return i;
    }
    return -1;
  }
}
var removeFromArray = function (array, value) {
  let index = findInArr(array, value);
  if (index > -1) {
    array.splice(index, 1);
  }
}

$(function () {
  // SET ALL AJAX-BASED REQUESTS TRANSFER PROJECT ID VALUE
  $.ajaxSetup({
    headers: {
      'X-PID': user.projectId
    }
  });

  // RESET ALL PASSWORD FIELDS AFTER PAGE LOADED
  setTimeout(function () {
    $('input[type="password"]').each(function () {
      $(this).val('');
    });
  }, 1000);
  

  // SET CHOSEN COMBOBOX DROP UP, IF IT'S PLACED NEAR BOTTOM OF CONTENT
  $(document).bind('chosen:ready', function (e, params) {
    var offsetMax = $('.wrapper').offset().top + $('.wrapper').innerHeight(),
      chosenTarget = $(params.chosen.form_field).parent();

    if ((offsetMax - chosenTarget.offset().top) < 240) {  // 240 - default height of chosen dropdown
      chosenTarget.find('.chosen-container').addClass('chosen-up');
    }
  });

  $('#Subject').on('input', function () {
    var phrase = $('#Subject').val();
    $.get('/help/search', { phrase: phrase }, function (data) {
      $("#help_result").html(data);
    });
  });

  // SET ACTIVE MENU ELEMENT
  function setActiveMenuElem() {
    var curCleanLocation = window.location.pathname.split('?')[0];

    $('#sidebar_new a').each(function () {
      var urlSubstr = $(this).attr('href').split('?')[0];

      if (curCleanLocation === urlSubstr || curCleanLocation.indexOf(urlSubstr + '/') > -1) {
        $(this).parent().addClass('active');
      }
    });
  }
  setActiveMenuElem();
  
  $('.payment-rare-button').click(function (e) {
    e.preventDefault();
    $('.rare').animate({
      "height": "toggle"
    }, 200);
    $('.payment-rare-button').toggleClass('hidden');
  });
  $('.billing-rare-button a').click(function (e) {
    e.preventDefault();
    $('.rare').animate({
      "height": "toggle"
    }, 200);
    $('.billing-rare-button').toggleClass('hidden');
  });
  $('.support-rare-button').click(function () {
    $('.rare').animate({
      "height": "toggle"
    }, 200);
    $('.support-rare-button').toggleClass('hidden');
  });
  $('.invoices-rare-button').click(function () {
    $('.rare-invoice').animate({
      "height": "toggle"
    }, 1);
    $('.invoices-rare-button').toggleClass('hidden');
  });
  $('.acts-rare-button').click(function () {
    $('.rare-acts').animate({
      "height": "toggle"
    }, 1);
    $('.acts-rare-button').toggleClass('hidden');
  });

  $('section.billing-detalization a.detal_minus').click(function () {
    CollapseBillingDetalization($(this));
  });

  
  $('#main .faq-question').click(function () {
    var _contenctObj = $(this).next();

    if (_contenctObj.css('display') == 'none') {
      _contenctObj.slideDown();
    } else {
      _contenctObj.slideUp();
    }
  });

  // JQUERY UI TABS INITIALIZATION ( structure: .tabs-custom > (ul.tabs-buttons + (div1 + div2 ...))

  $(".tabs-custom").tabs({
    active: ($(this).find('.tabs-buttons li.active').index() == -1) ? 0 : $(this).find('.tabs-buttons li.active').index()
  });

  if ($('.print-custom').length > 0) {
    removeHeaderForPrintPage();
  }
  function setActiveTabOnLoad(key) {
    if (key.indexOf('tab-') > -1) {
      var linkedTab = $('a[href="' + key.replace('tab-', '') + '"]');
      if (linkedTab && linkedTab.hasClass('ui-tabs-anchor')) {
        linkedTab.click();
      };
    }
  }
  if (window.location.hash !== "") {
    setActiveTabOnLoad(window.location.hash);
  };


  /* =============== DIFFERENT DECORATIONS =============== */
  $('.numberToThousands').each(function () {
    var price = $(this).text();
    if (typeof Number(price) === 'number') {
      $(this).html(numberWithThousands(price));
    }
  });

  /* ============== ADD FILE UPLOAD LISTENER ============= */
  $('input[type="file"][id!="swift-files"]').on('click', function () {
    listenFile(this);
  });
});

/*
 * Function to set non-breaking spaces into thousands rank
 */
function numberWithThousands(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;");
}

// PRINT PAGE
function removeHeaderForPrintPage() {
  var main = document.querySelector('#main'),
    header = main.querySelector('.heading');

  if (header) {
    main.removeChild(header);
  }
}
function printThisPage() {
  window.print();
}

function AjaxSuccess(result) {
  if (result.redirectTo) {
    window.location.href = result.redirectTo;
  }
};
function AjaxOnSuccess(idForm, idSuccess) {
  if ($('#' + idForm).find(errorSelector).length < 1) {
    $('#' + idSuccess).removeClass('hidden').slideDown();
    setTimeout(function () {
      $('#' + idSuccess).slideUp();
    }, 4000);

    if (idForm === 'change-password-form') {
      setTimeout(function () {
        location.reload();
      }, 1500);
    }
  }
};
function AjaxOnFailure(data) {
  console.log(data.responseText);
}

function CollapseBillingDetalization(e) {
  var next_tr = $(e).parent().parent().next();
  next_tr.toggleClass('hidden');

  if (next_tr.hasClass('hidden')) {
    $(e).text('+')
  }
  else {
    $(e).text('-')
  }
};


// hide tooltip for "choose our high servers pool"
function HideTooltipOnSlider(e) {
  var id_tooltip = $(e).parent().find('span.tooltip').attr('id');
  var tooltips = $('#' + id_tooltip).tooltip({});
  tooltips.tooltip("close");
}

/*
 * Initiates countdown timer in seconds, and texts its value to concrete element
 * @obj countdownObj - jQuery object, where we will show rest of seconds
 * @number startFrom - start timer number
 * @function cb - callback function, which will fire, when timer down to 0 (optional)
 */
function setCountdownTimer(countdownObj, startFrom, cb) {
  var timer,
    start = startFrom;

  countdownObj.text(start);
  timer = setInterval(function () {
    countdownObj.text(--start);
    if (start <= 0) {
      clearInterval(timer);
      if (typeof cb === 'function') {
        cb();
      }
    }
  }, 1000);
}

function sendAjaxGetRequest(url, cbSuccess, cbFail) {
  $.get(url, cbSuccess).fail(function (data) {
    if (typeof cbFail === 'function') {
      cbFail(data);
    } else {
      if (data.status) {
        alert(data.status + ' - ' + data.statusText);
      }
    }
  });
}

function addRequestVerificationToken(block, data) {
  data.__RequestVerificationToken = $(block).find('input[name=__RequestVerificationToken]').val();
  return data;
};

function sendAjaxRequest(blockId, url, obj, successFunction, errFunction, type) {
  // submitting trigger must have [type="submit"] attribute or class 'btn-send'
  var sendBtn = ($(blockId).find('.btn-send').length > 0) ? $(blockId).find('.btn-send') : $(blockId).find('[type="submit"]'),
    forgery = $(blockId).find('[name="__RequestVerificationToken"]'),
    isSent = false;

  if (sendBtn.length !== 0) {
    if (!sendBtn.hasClass('btn-inprogress')) {
      addProgressStylesToButton(sendBtn);
    } else {
      isSent = true;
      return false;
    }
  }

  if (!isSent) {
    $.ajax({
      type: (typeof type !== 'undefined') ? type : 'POST',
      context: (forgery.length > 0) ? document.body : this,
      url: url,
      data: (forgery.length > 0) ? addRequestVerificationToken(blockId, obj) : JSON.stringify(obj),
      contentType: (forgery.length > 0) ? 'application/x-www-form-urlencoded; charset=UTF-8' : 'application/json',
      dataType: "json",
      success: function (data) {
        removeProgressStylesFromButton(sendBtn);

        if (typeof successFunction === 'function') {
          successFunction(data);
        }

        if (typeof data !== 'undefined' && data.redirectTo) {
          window.location.href = data.redirectTo;
        }
      },
      error: function (data, status) {
        removeProgressStylesFromButton(sendBtn);
        if (data.status === 200 && data.state() === 'rejected') { // case of 302 redirect
          location.href = loginUrl;
          return;
        }
        handleAjaxErrors(data, blockId, errFunction);
      }
    });
  }
}

function sendSimpleAjaxPostRequest(url, obj, successFunc, processFunc, errFunction) {
  if (typeof processFunc === 'function') {
    processFunc();
  }

  $.ajax({
    type: "POST",
    contentType: 'application/json',
    url: url,
    data: JSON.stringify(obj),
    dataType: "json",
    success: function (data) {
      if (typeof successFunc === 'function') {
        successFunc(data);
      }
    },
    error: function (data, status) {
      handleAjaxErrors(data, null, errFunction);
      if (typeof errFunction === 'function') {
        errFunction();
      }
    }
  });
}

function addProgressStylesToButton(btn) {
  switch (btn.prop('tagName').toLowerCase()) {
    case 'input':
      textSendCur = btn.val();
      btn.val(resources.Sending);
      break;
    default:
      textSendCur = btn.text();
      btn.text(resources.Sending);
  }
  btn.addClass('btn-inprogress');
}
function removeProgressStylesFromButton(btn) {
  if (btn.length !== 0) {
    switch (btn.prop('tagName').toLowerCase()) {
      case 'input':
        btn.val(textSendCur);
        break;
      default:
        btn.text(textSendCur);
    }
    btn.removeClass('btn-inprogress');
  }
}

function handleAjaxErrors(data, blockId, errorFunction) {
  if (data.status == 500) {
    showServerErrorBootstrapModal();
    return;
  }

  if (data.responseJSON != undefined) {
    var errObj = (typeof data.responseJSON === 'string') ? JSON.parse(data.responseJSON) : data.responseJSON;
    var errorRange = Number(data.status) - 400;

    if (errorRange >= 0 && errorRange < 100 && typeof errObj.ModelState !== 'undefined') {
      var errArray = Object.keys(errObj.ModelState);
      if (errArray.length === 1 && errArray[0] === '') {
        var notice = new PanelNotice(errObj.ModelState[''].toString(), 'danger');
      } else {
        for (var i = 0; i < errArray.length; i++) {
          var block = (blockId !== null) ? $('#main') : $(blockId),
            errElem = (block.find('[name="' + errArray[i] + '"]').length !== 0) ? block.find('[name="' + errArray[i] + '"]') : block.find('[data-name="' + errArray[i] + '"]');

          if (errElem.parent().find('.error__message').length > 0) {
            errorMessageRemove(errElem);
          };
          errorMessageAdd(errElem, errObj.ModelState[errArray[i]].toString().replace(/\n/g, '<br />'));
        }
      }

      if (typeof errorFunction === 'function') {
        errorFunction(errObj.ModelState, blockId);
      }
    } else {
      var errMsg = (errObj.Message) ? errObj.Message : data;

      if ($(errorSummarySelector).length > 0) {
        $(errorSummarySelector + ' p').text(errMsg);
      } else {
        var notice = new PanelNotice(errMsg, 'danger');
      }

      if (typeof errorFunction === 'function') {
        errorFunction(errMsg);
      }
    }
  } else {
    console.log(resources.ErrorMsg_NoDescription + ':' + data);
  }
}

function showSummaryMessage(msg, blockId) {
  var errMsgBlock = $('<div />', {
    class: errorSummaryClass,
    'html': '<p>' + msg + '</p>'
  });
  var errMsgBlockClose = $('<span/>', {
    class: 'glyphicon glyphicon-remove error-summary-close',
    click: function () {
      $(this).closest(errorSummarySelector).remove();
    }
  });
  errMsgBlock.append(errMsgBlockClose);

  $(errorSummarySelector).remove();

  if (blockId !== null && typeof blockId !== 'undefined') {
    $(blockId).prepend(errMsgBlock);
  } else {
    errMsgBlock.insertAfter($('#main > header'));
  }
}

function errorMessageAdd(errObj, errMsg) {
  if (errObj.siblings(errorSelector).length < 1) {
    var errObjParent = errObj.parent(),
      errorNew = errorElem.clone();

    errObjParent.addClass('error');
    errorNew.html(errMsg).appendTo(errObjParent);

    errObj.bind('click change',
      function () {
        errorMessageRemove(errObj);
      });

    if (errObj.siblings('.btn').length > 0) {
      errObj.siblings('.btn').bind('click',
        function () {
          errorMessageRemove(errObj);
        });
    }
  }
}
function errorMessageRemove(errObj) {
  var errObjParent = errObj.parent();
  errObjParent.removeClass('error').find(errorSelector).remove();
}
function showServerErrorBootstrapModal() {
  var modalBlock = $('<div />', {
    'id': 'modalServerError',
    'class': 'modal onecloud__modal onecloud__modal--error fade'
  }),
    modalDialog = $('<div class="modal-dialog"/>'),
    modalContent = $('<div class="modal-content"/>'),
    modalHeader = $('<div />', {
      'class': 'modal-header',
      'html': '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title">' + resources.ServerErrorTitle + '</h3>'
    }),
    modalBody = $('<div />', {
      'class': 'modal-body',
      'html': resources.ServerError
    }),
    modalFooter = $('<div />', {
      'class': 'modal-footer',
      'html': '<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>'
    });

  modalContent.append(modalHeader, modalBody, modalFooter).appendTo(modalDialog);
  modalBlock.append(modalDialog).modal('show');
}

/*
 * Function initiates check of multiple Task execution.
 * @string checkUrl - url for further post request
 * @number interval - interval of sending post requests
 * @number maxChecks - maximum times to check each task process
 * @number cb - callback function, for task completion. If specified will be fired with parameter task id, if not, further it will be redefined to page reload
 */
function StartTasksStatusCheck(checkUrl, interval, maxChecks, cb) {
  var taskList = [];

  if ($('#server-history .progress').length > 0) {
    $('#server-history .progress').each(function () {
      var taskId = $(this).find('.bar').attr('id').replace('task_', '');
      var checkedTimes = 0;
      var callback = (typeof cb === 'function') ? cb : function () { location.reload(); };

      taskList[taskId] = window.setInterval(function () {
        CheckStatusTaskNew(checkUrl.replace('defaultId', taskId), taskId, callback);

        checkedTimes++;
        if (checkedTimes == maxChecks) {
          clearInterval(taskList[taskId]);
        }
      }, interval);
    });
  }
}

/*
 * Simple function to check end of Task execution.
 * @string url - url for further post request
 * @number id - task id
 * @function cb - callback function, which fires, when task is complete (default - page reload)
 */
function CheckStatusTaskNew(url, id, cb) {
  $('div.bar#task_' + id).addClass('active');

  $.get(url, null, function (data) {
    if (data.ProgressPercent > 0) {
      $('div.bar#task_' + id).css("width", data.ProgressPercent + "%");
    }
    if (data.TaskIsComplited == true) {
      cb(id);
    }
  }, "json");
}

/* Validation for upload file */
function validateFile(input) {
  let isValid = true;
  let errorMessage = '';
  let objects = [];

  if (input.files.length > resources.Upload.MaxUploadFiles) {
    input.value = null;
    errorMessageAdd($(input), resources.Upload.MaxUploadFilesErrorText);
    if (input.classList.contains('onecloud-file-input')) {
      document.querySelector('.onecloud-file-text[data-for="' + input.name + '"]').textContent = '';
    }
    return;
  }

  for (let i = 0; i < input.files.length; i++) {
    let file = input.files[i];
    let ext = file.name.match(/\.(.+)$/)[1];
    let fileObj = {
      name: file.name,
      error: ''
    };

    if (resources.Upload.AllowedFileExtensionsForUpload.indexOf(ext) === -1 || file.size > resources.Upload.MaxUploadFileSize) {
      fileObj.error = file.name + ' - ' + resources.Upload.MaxUploadFileSizeErrorText;
      isValid = false;
    }

    objects.push(fileObj);
  }

  if (!isValid) {
    objects.forEach(function (el) {
      if (el.error !== '') {
        errorMessage += (el.error + '<br/>');
      }
    });
    errorMessageAdd($(input), errorMessage);
    input.value = null;
  } else {
    if (input.classList.contains('onecloud-file-input')) {
      var textElem = document.querySelector('.onecloud-file-text[data-for="' + input.name + '"]');
      textElem.textContent = objects.map(function (el) {
        return el.name;
      }).join(', ');
    }
  }
}
function listenFile(input) {
  if (!$(input).val()) {
    //Initial Case when no document has been uploaded
    $("input[type='file']").change(function () {
      validateFile(input)
    });

  } else {
    //Subsequent cases when the exact same document will be uploaded several times
    $(input).val('');
    if ($(input).hasClass('onecloud-file-input')) {
      var textElem = $(input).parent().find('.onecloud-file-text');
      textElem.html(textElem.attr('data-empty-text'));
    }
    $("input[type='file']").unbind('change');
    $("input[type='file']").change(function () {
      validateFile(input);
    });
  }
}

function showErrorsWithPrefix(data, itemSelector, prefix, showErrorFunc) {
  if (typeof prefix === 'undefined' || typeof itemSelector === 'undefined') {
    return;
  }
  var items = document.querySelectorAll(itemSelector);
  var keys = Object.keys(data);

  for (var i = 0; i < items.length; i++) {
    var message = '';
    var errors = keys.filter(function (it, j, arr) {
      return it.indexOf((prefix + '[' + i + ']')) > -1;
    });

    if (errors.length > 0) {
      errors.forEach(function (it, i, arr) {
        message += (data[it].join(', '));
        if (i < arr.length - 1) {
          message += ', ';
        }
      });
    }

    if (message !== '' && typeof showErrorFunc === 'function') {
      showErrorFunc(items[i], message);
    }
  }
}

function checkDecimal(elem, separator) {
  var elemVal = (elem.is('input')) ? elem.val().split(separator) : elem.text().split(separator),
    elemDecimal = elemVal[elemVal.length - 1];
  if (elemDecimal == '00') {
    elem[(elem.is('input')) ? 'val' : 'text'](Number(elemVal[0]));
  };
};

/* =============== MARKETING ================*/

/**
 * 
 * @param {string} goalId - (required) goal indentifier for all counters
 * @param {string} goalType - (optional) event type: 'click'(default), 'try', 'submit'. ONLY FOR GOOGLE ANALYTICS
 */
function reachCounterGoal(goalId, goalType) {
  var yaCounter = (typeof window['yaCounter' + yandexCounterId] !== 'undefined') ? window['yaCounter' + yandexCounterId] : null;
  var googleCounter = (typeof gtag === 'function') ? gtag : null;
  var evtType = goalType || 'click';

  if (goalId) {
    if (yaCounter) {
      yaCounter.reachGoal(goalId);
    }
    if (googleCounter) {
      googleCounter('event', goalId, {
        'event_category': goalType
      });
    }
  }

  return true;
}

function happyNewYear() {
  var $block = $('#happy-new-year');
  var $boxes = $('.notification-ny__box');

  if ($block.length > 0) {
    $boxes.click(function () {
      var $box = $(this);

      $.post($box.data('url'), {}, function (data) {
        var successText = resources.HappyNewYear2019_Success
          .replace('{{DefaultAmount}}', data.Amount)
          .replace('{{DefaultMaxBonus}}', data.MaxBonus);

        var confirm = new ConfirmPopup({
          title: 'Поздравляем, удача на вашей стороне!',
          text: successText,
          proceedText: 'Пополнить баланс',
          isOnlyProceed: true,
          cbProceed: function () {
            location.href = urlToAddMoney; // urlToAddMoney is defined in Layout
          }
        });

        $block.parents('.widget').remove();
      })
        .fail(function (data) {
          var modelState = data.responseJSON.ModelState;
          var errorMessage = (typeof modelState !== 'undefined' && Array.isArray(modelState[""])) ? modelState[""][0] : resources.ServerErrorTitle;
          var notice = new PanelNotice(errorMessage, 'danger');
        });
    });
  };
};
happyNewYear();