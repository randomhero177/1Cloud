
/* =============== TEXT VARIABLES =============== */
var arrowTopText = 'Наверх',
  cmdShowText = 'развернуть',
  cmdHideText = 'свернуть',
  testimonialsShowText = 'показать весь отзыв',
  testimonialsHideText = 'свернуть отзыв',
  carouselArrowPrev = '<i class="oc-arrows__left oc-icon-arrow"></i>',
  carouselArrowNext = '<i class="oc-arrows__right oc-icon-arrow"></i>',
  errorMsgEmptyField = textRequired,
  errorClass = 'error__message',
  errorSummaryClass = 'error__summary',
  errorElem = $('<span/>', {
    'class': errorClass,
    'text': errorMsgEmptyField
  });

/* =============== ADD CLASS ACTIVE TO LINK PARENTS, WHERE PATHNAME MATCHES =============== */
setActiveMenuItems();

function setActiveMenuItems() {
  var curPage = (location.search.indexOf('Level') > -1) ? 'Level=' + $('#Level').val() : location.pathname.slice(1, -1),
    isTickets = location.toString().indexOf('tickets') > -1,
    hasLevelParameter = curPage.indexOf('Level') > -1,
    corePage = checkCorePage(),
    link;
  if (isTickets && !hasLevelParameter && location.search.length >= 0) {
    link = $('.sidebar-menu a.accordion-toggle[href*="tickets"]');
  } else if (corePage) {
    link = $('.sidebar-menu a[href="/' + corePage + '/"]');
    checkNested(link);
  } else {
    $('.sidebar-menu a[href*="' + curPage + '"]').each(function () {
      checkNested($(this));
    });
  }

  if (typeof link !== 'undefined') {
    link.removeAttr('href');
    link.parent().addClass('active');
  }

  function checkCorePage() {
    var corePages = ['tasks', 'ssl', 'monitoring', 'notifications'];

    for (var i = 0; i < corePages.length; i++) {
      if (location.pathname === '/' + corePages[i] || location.pathname === '/' + corePages[i] + '/') {
        return corePages[i];
      }
    }

    return false;
  }

  function checkNested(link) {
    var linkParent = link.parent();
    link.removeAttr('href');
    linkParent.addClass('active');
    if (link.hasClass('accordion-toggle')) {
      link.addClass('menu-open');
    }
    if (linkParent.parent().prev('a').length > 0) {
      checkNested(linkParent.parent().prev('a'));
    }
  }
}

/*
 * findInArr - Function to check if element is in specified array
 */
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
function errorMessageAdd(errObj, errMsg) {
  var errObjParent = errObj.parent(),
    errorNew = errorElem.clone();
  errObjParent.addClass('error');
  errorNew.html(errMsg).appendTo(errObjParent);

  if (!errObj.closest('form').hasClass('form--column')) {
    errorMessagePlace(errorNew);
  }

  errObj.on('click mousedown change', function () {
    errorMessageRemove(errObj);
  });
  if (errObj.siblings('.btn').length > 0) {
    errObj.siblings('.btn').bind('click',
      function () {
        errorMessageRemove(errObj);
      });
  }
}
function errorMessageRemove(errObj) {
  var errObjParent = errObj.parent();
  errObjParent.removeClass('error');
  errObjParent.find('.' + errorClass).remove();
}
function errorMessagePlace(obj) {
  var objHeight = obj.outerHeight() + 7; // 7 - height of decoration (sqrt(10*10 + 10*10)/2)
  obj.css({
    'top': -objHeight,
    'bottom': 'auto'
  });
}

function addRequestVerificationToken(blockId, data) {
  data.__RequestVerificationToken = $(blockId).find('input[name=__RequestVerificationToken]').val();
  return data;
};

function sendPostRequest(blockId, url, obj, successFunction, errFunction, type) {
  // submitting trigger must have [type="submit"] attribute

  var sendBtn = $(blockId).find('[type=submit]'),
    forgery = $(blockId).find('[name="__RequestVerificationToken"]'),
    isSent = false;

  if (sendBtn.length !== 0) {
    if (!sendBtn.hasClass('loading')) {
      sendBtn.addClass('loading');
    } else {
      isSent = true;
      return false;
    }
  }

  if (!isSent) {
    $.ajax({
      type: (typeof type === 'undefined') ? 'POST' : type,
      context: (forgery.length > 0) ? document.body : this,
      url: url,
      data: (forgery.length > 0) ? addRequestVerificationToken(blockId, obj) : JSON.stringify(obj),
      dataType: "json",
      success: function (data) {
        if (typeof data !== 'undefined' && data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        }

        if (sendBtn.length !== 0) {
          sendBtn.removeClass('loading');
        }

        if (typeof successFunction === 'function') {
          successFunction(data);
        }

      },
      error: function (data, status) {
        if (sendBtn.length !== 0) {
          sendBtn.removeClass('loading');
        }
        handleAjaxErrors(data, blockId, errFunction);
      }
    });
  }
}
function sendSimplePostRequest(url, obj, successFunc, processFunc, errFunction) {
  if (typeof processFunc === 'function') {
    processFunc();
  }

  $.ajax({
    type: "POST",
    url: url,
    data: obj,
    dataType: "json",
    traditional: true,
    success: function (data) {
      successFunc(data);
    },
    error: function (data, status) {
      handleAjaxErrors(data, null, errFunction);
    }
  });
}
function handleAjaxErrors(data, formId, errorFunction) {
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
        showSummaryMessage(errObj.ModelState[''].toString());
      } else {
        for (var i = 0; i < errArray.length; i++) {
          var errElem = (formId === null) ? $('[name="' + errArray[i] + '"]') : $(formId).find('[name="' + errArray[i] + '"]');
          if (errElem.parent().find('.error__message').length > 0) {
            errorMessageRemove(errElem);
          }
          errorMessageAdd(errElem, errObj.ModelState[errArray[i]].toString().replace(/\n/g, '<br />'));
        }
      }

      if (typeof errorFunction === 'function') {
        errorFunction(errObj.ModelState);
      }
    } else {
      showSummaryMessage(errObj.Message);
    }
  } else {

  }

  function showSummaryMessage(msg) {
    var showBlockObj = (formId !== null && typeof formId !== 'undefined') ? $(formId) : $('#content');
    var errMsgBlock = $('<div />', {
      class: errorSummaryClass + ' alert alert-danger',
      'html': msg
    });
    var errMsgBlockClose = $('<span/>', {
      class: 'fa fa-close error__summary-close',
      click: function () {
        $(this).closest('.' + errorSummaryClass).remove();
      }
    });
    errMsgBlock.append(errMsgBlockClose);
    showBlockObj.prepend(errMsgBlock);
  }
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
      'html': '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h3 class="modal-title">' + textServerErrorTitle + '</h3>'
    }),
    modalBody = $('<div />', {
      'class': 'modal-body',
      'html': textServerError
    }),
    modalFooter = $('<div />', {
      'class': 'modal-footer',
      'html': '<button type="button" class="btn btn-default" data-dismiss="modal">OK</button>'
    });

  modalContent.append(modalHeader, modalBody, modalFooter).appendTo(modalDialog);
  modalBlock.append(modalDialog).modal('show');
}

function detectIE() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }
  // other browser
  return false;
}

if (detectIE()) {
  document.getElementById('ie-popup').classList.remove('hidden');
}

if (userRoles.isPlatform && (userRoles.isSupport || userRoles.isSupport2 || userRoles.isAdmin)) {
  checkFailedTask();
}

/*
 * Count and show failed tasks for each feature and draw the sum for it
 * @failedTasks - object deffined in the main Layout
 * @elemConfig - object. @elemConfig object is supposed to have the same structure/keys as @failedTasks object
 */
function checkFailedTask() {
  var timeInterval = 30000,
    results = [],
    failedTasksKeys = Object.keys(failedTasks),
    requestCount,
    elemConfig = {
      failedCommonTask: '#common-tasks-item',
      failedMonitoringTask: '#monitoring-tasks-item',
      notSentNotification: '#send-notification-item'
    };
  
  var sendRequests = function () {
    var urlList = Object.keys(failedTasks),
      parentElem = $('[data-counter]');

    parentElem.each(function () {
      var parent = $(this),
        childElem = parent.siblings('.nav').find('[data-failed]');

      childElem.each(function (i, el) {
        var curTask = $(this).data('failed'),
          curUrl = failedTasks[curTask];
        getFailedTask(curUrl, el);
      });
      setTimeout(function () { countResults(parent); }, 3000);
    });
  };
  var getFailedTask = function (url, elem) {
    $.ajax({
      url: url,
      dataType: 'json',
      method: 'GET',
      success: function (counter) {
        drawItemResult(counter, elem);
      }
    });
  };

  function drawItemResult(counter, elem) {
    $(elem).find('.failed-task-counter')[(counter == 0)? 'addClass' : 'removeClass']('hidden').text(counter);
  };

  function countResults(elem) {
    var failedElem = elem.siblings('.nav').find('.failed-task-counter'),
      total = 0;
    
    failedElem.each(function () {
      var curNum = Number($(this).text());
      total += curNum;
    })
    $(elem).find('.failed-task-counter')[(total == 0) ? 'addClass' : 'removeClass']('hidden').text(total);
  };

  sendRequests();
  var jsTimer = window.setInterval(function () {
    sendRequests();
  }, timeInterval);
}

/*
    * Use standart Html template
    * @boolean isToClear - if true pop up block will be hidden after 10s
    * @string text - text to show if important to show different than default text
*/
function successPopup(blockToCloneId, blockToShowId, isToClear, text) {
  var succChild = document.createElement('div'),
    tpl = document.getElementById(blockToCloneId),
    tplContainer = 'content' in tpl ? tpl.content : tpl,
    succEl = tplContainer.querySelector('.success-window').cloneNode(true),
    blockToShow = document.getElementById(blockToShowId);
  succChild.appendChild(succEl);
  blockToShow.insertBefore(succChild, blockToShow.firstChild);

  if (typeof text != 'undefined') {
    document.getElementById('success-text').textContent = text;
  };

  if (typeof isToClear !== 'undefined' && isToClear) {
    setTimeout(function () {
      blockToShow.removeChild(succChild);
    }, 10000);
  };
};

/**
 * Feature for popping alert notices
 * @param {string} message - text to be shown in notice
 * @param {string} type - bootstrap style of alert decoration
 */
var PanelNotice = function (message, type) {

  if (typeof message === 'undefined') {
    throw 'To create notice, you must provide text description';
  }

  var n = this;
  var c = {
    blockClass: 'notices',
    elemClass: 'notices__item',
    elemClassActive: 'notices__item--active',
    elemClassHidden: 'notices__item--hidden',
    elemCloseClass: 'notices__item-close',
    timeout: 10000 // 10 seconds
  }
  this.interval = false;

  this.showNotice = function () {
    var existingBlock = document.querySelector('.' + c.blockClass);
    var isBlockAlreadyCreated = existingBlock !== null;
    var resultBlock = (isBlockAlreadyCreated) ? existingBlock : createBlock();
    var notice = createNotice(resultBlock);

    if (!isBlockAlreadyCreated) {
      document.body.appendChild(resultBlock);
    }

    resultBlock.appendChild(notice);

    setTimeout(function () {
      notice.classList.add(c.elemClassActive);
    }, 200);

    n.interval = setTimeout(function () {
      n.removeNotice(notice, resultBlock);
    }, c.timeout);
  };
  this.removeNotice = function (item, parentBlock) {
    item.classList.add(c.elemClassHidden);
    setTimeout(function () {
      if (item) {
        parentBlock.removeChild(item);
      }
    }, 400);
    clearTimeout(n.interval);
  };

  function createBlock() {
    var block = document.createElement('div');
    block.classList.add(c.blockClass);
    return block;
  }
  function createNotice(parentBlock) {
    var notice = document.createElement('div');
    var close = document.createElement('button');
    var noticeType = (typeof type !== 'undefined') ? type : 'warning';

    notice.className = 'notices__item alert alert-dissmissable';
    notice.classList.add('alert-' + noticeType);
    notice.innerHTML = message;

    close.className = 'notices__item-close close';
    close.innerHTML = '&times;';

    notice.appendChild(close);
    close.addEventListener('click', function () {
      n.removeNotice(notice, parentBlock);
    });

    return notice;
  }

  n.showNotice();
};