/*
 * variables companyId,  calc, prevOrder are defined in Edit view
 */

var config = {
  userBlockComp: '#unoc-user-access',
  userBtnSaveComp: '#unoc-company-users-btn',
  userHasEmail: 'unoc__users-email-attached',
  userActionRow: '.unoc__users-useraccess',
  userAddModalTriggerId: '#add-unoc-user',
  userAddModalSubmitId: '#unoc-add-user-modal-btn',
  userItemSelector: '.unoc__users-item',
  userItemAccessSelector: '.unoc__users-connected',
  userTableId: '#unoc-users-table',
  userAddModalId: '#unoc-add-user-modal',
  userAddModalFormId: '#unoc-add-user-modal-form',
  sentEmailText: resources.Unoc_SendFileViaEmail,
  noEmailText: resources.ErrorDecreaseUsers
}
$(function () {
  $(config.userItemSelector).each(function () {
    initItemSwitch($(this).find(config.userItemAccessSelector), 'connected', setUserConnectionStatus);
  });

  checkEmail($('.unoc__users-sendemail'));

  $(config.userBtnSaveComp).click(function (e) {
    e.preventDefault();
    sendAjaxRequest(config.userBlockComp, $(config.userBlockComp).data('action'), getUsersObj(), function () {
      location.reload();
    }, showErrorsCompanySave, 'PUT');
  });
});

/*
 * Switches plugin control to appropriate state. If state is "off" and user row is a new instance, then this user is to be removed from DOM
 */
function setUserConnectionStatus() {
  var item = $(this).closest(config.userItemSelector),
    isPresented = item.data('presented');

  if (this[0].classList.contains('checked')) {
    this[0].previousSibling.dataset.connected = true;
  } else {
    this[0].previousSibling.dataset.connected = false;
    if (isPresented !== 1) {
      item.remove();
    }
  }

  checkSaveUsersBtnDisabled();
}

/*
 * Adds user row for new user
 * @obj form - jQuery object of modal form for adding new user info
 */
function addUserRow(form) {
  var tpl = document.getElementById('template-unoc-add-user'),
    tplContainer = 'content' in tpl ? tpl.content : tpl,
    newItem = tplContainer.querySelector(config.userItemSelector).cloneNode(true);

  var firstname = form.find('#unoc-modal-userfirstname').val(),
    email = form.find('#unoc-modal-useremail').val();

  newItem.querySelector('.unoc__table-userfirstname').textContent = firstname;
  newItem.querySelector('.unoc__table-useremail').textContent = email;

  $(config.userTableId).append($(newItem));
  $(newItem).find('.unoc-user-delete').click(function (e) {
    e.preventDefault();
    $(this).closest(config.userItemSelector).remove();
  });
  initItemSwitch($(newItem).find(config.userItemAccessSelector), 'connected', setUserConnectionStatus);

  $(config.userAddModalId).modal('hide');
  $(config.userAddModalFormId)[0].reset();
}

/*
 * Checks if there are changes in users, and depending on this ables/disables Save button
 */
function checkSaveUsersBtnDisabled() {
  var isChanges = false;
  var checkedInp = $('.unoc__users-connected[data-connected="true"][data-init="false"]'),
    uncheckedInp = $('.unoc__users-connected[data-connected="false"][data-init="true"]');

  if (checkedInp.length > 0 || uncheckedInp.length > 0) {
    isChanges = true;
  }

  $(config.userBtnSaveComp).prop('disabled', !isChanges);
}


/*
 * Prepares users object to send
 */
function getUsersObj() {
  var postObj = {};

  postObj.AddToCompanyIds = [];
  postObj.RemoveFromCompanyIds = [];

  var companys = document.querySelectorAll('input.unoc__users-connected');
  for (var i = 0; i < companys.length; i++) {
    if (companys[i].dataset.connected == 'true' && companys[i].dataset.init == 'false') {
      var x = postObj.AddToCompanyIds.push(companys[i].dataset.company);
    } else if (companys[i].dataset.connected == 'false' && companys[i].dataset.init == 'true') {
      var x = postObj.RemoveFromCompanyIds.push(companys[i].dataset.company);
    };
  };
  return postObj;
}

/*
 * Shows custom errors for users list
 * @obj data - server answer for change users request
 */


function showErrorsCompanySave(data) {
  var keyArr = Object.keys(data),
    indexOfElWithErr = [],
    errBlock = $('#display-error');
  /*
      * Search through model state. Getting index and key of error
  */
  for (var i = 0; i < keyArr.length; i++) {
    var keyForError = keyArr[i].split('[');
    var nameOfError = keyForError[1].split(']');
    var x = indexOfElWithErr.push(nameOfError[0]);
  }
  /*
      * Get checked elem, to highlight the one with errors
  */
  var checkedEl = $('.unoc__users-item').find('input[data-init="false"]:checked');
  var errorMessage = '',
    errArr;
  for (var i = 0; i < indexOfElWithErr.length; i++) {
    checkedEl.eq(indexOfElWithErr[i]).parent().parent().parent().addClass('unoc__users-item--error');
    errArr = data[keyForError[0] + '[' + indexOfElWithErr[i] + ']'];
  };

  errorMessage += getErrorsFromCompanyData(errArr);
  if (errorMessage) {
    errBlock.find('.unoc__users-msg--error').remove();
    var msgErr = $('<div />', {
      class: 'unoc__users-msg--error alert alert-danger',
      html: errorMessage
    }),
      errClose = $('<span />', {
        class: 'glyphicon glyphicon-remove error-summary-close'
      }).click(function () {
        errBlock.html('');
        $('.unoc__users-item--error').removeClass('unoc__users-item--error');
      });
    msgErr.append(errClose);
    errBlock.append(msgErr);
  }
}

/*
 * Returns an error string message from array of all mistakes for net item
 * @array arrErr - array of errors
 */
function getErrorsFromCompanyData(arrErr) {
  var result = '';
  if (arrErr && arrErr.length) {
    arrErr.forEach(function (el, i, arr) {
      result += el;
      if (i !== arr.length - 1) {
        result += '<br/>';
      }
    });
  }
  return result;
}

function checkEmail(elem) {
  for (var i = 0; i < elem.length; i++) {
    if (!$(elem[i]).data('action') == '') {
      $(elem[i]).addClass(config.userHasEmail).attr('title', config.sentEmailText);
      $(elem[i]).click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        let thisvar = $(this);

        let confirm = new ConfirmPopup({
          text: resources.Unoc_ConfirmEmailSend,
          cbProceed: function () {
            sendEmail(thisvar);
          }
        });
      })
    } else {
      noEmailMsg(elem[i]);
    }
  }
}

function sendEmail(elem) {
  sendAjaxRequest('#unoc-user-access', $(elem).data('action'), getFormData(elem), function () {
    $(elem).addClass('unoc__users-email-attached--sent');
  }, null)
};

function getFormData(elem) {
  var obj = {};
  obj.companyId = $(elem).parents(config.userActionRow).data('company');
  obj.userId = $(elem).parents(config.userActionRow).data('id');
  return obj
};

function noEmailMsg(elem) {
  $(elem).addClass('unoc__users-email-no');
  var noEmailEl = $('<span />', {
    'text': config.noEmailText,
    'class': 'unoc__users-email-no-txt'
  })
  $(elem).append(noEmailEl);
};