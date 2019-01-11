var addSshKeyBlockId = '#ssh-addkey-form',
  addSshKeyBlock = $(addSshKeyBlockId);

$(function () {
  $('.ssh__item-title').click(function (e) {
    showSshKeyText(e, $(this).parent());
  });
  $('.ssh__item-delete').click(function (e) {
    deleteSshKey(e, $(this).parent());
  });

  if (addSshKeyBlock.length > 0) {
    $('#add-sshkey-toggle').click(function (e) {
      e.preventDefault();
      addSshKeyBlock.toggleClass('hidden');
    });

    if ($('#create-server-form').length > 0) {
      initSshForm(showNewSshKeyOnServerOrder);
    } else {
      initSshForm(showNewSshKeyOnSettings);
    }
  }
});

function initSshForm(cb) {
  var keyElem = addSshKeyBlock.find('[name="PublicKey"]');
  var titleElem = addSshKeyBlock.find('[name="Title"]');

  keyElem.on('input', function () {
    setSshKeyCommentAsTitle($(this).val());
  });

  addSshKeyBlock.on('click', '#add-sshkey-btn', function (e) {
    e.preventDefault();
    var isFailed = false;
    var sshObj = getSshKeyPostObject();

    if (sshObj.Title === '') {
      errorMessageAdd(titleElem, resources.Shared_Required);
      isFailed = isFailed || true;
    }

    if (isForbiddenSshSymbols(sshObj.PublicKey)) {
      errorMessageAdd(keyElem, resources.HtmlTokensNotAllowed);
      isFailed = isFailed || true;
    }

    if (!isFailed) {
      sendAjaxRequest(addSshKeyBlockId, addSshKeyBlock.attr('data-href'), sshObj, cb, null);
    }
  });
}

function isForbiddenSshSymbols(string) {
  var regStr = /[<>&]/;
  return regStr.test(string);
}

function setSshKeyCommentAsTitle(key) {
  var keyElem = addSshKeyBlock.find('[name="PublicKey"]');
  var titleElem = addSshKeyBlock.find('[name="Title"]');
  var title = titleElem.val();

  if (isForbiddenSshSymbols(keyElem.val())) {
    errorMessageAdd(keyElem, resources.HtmlTokensNotAllowed);
    return;
  }
  
  var comment = '';
  var keySplitted = key.split(' ');
  var keySplittedNewLineArr = key.split('\n');
  var keyAlgo = keySplitted[0];

  switch (keyAlgo) {
    case 'ssh-rsa':
    case 'ssh-dss':
    case 'ecdsa-sha2-nistp256':
    case 'ssh-ed25519':
      comment = keySplitted.slice(2).join(' ');
      break;
    default:
      if (keySplittedNewLineArr[0] !== '---- BEGIN SSH2 PUBLIC KEY ----') {
        errorMessageAdd(keyElem, resources.Ssh_Wrong_Key_Format);
        return;
      }
      comment = getCommentNotOpenSsh(keySplittedNewLineArr);
  }

  if (comment !== '' && title === '') {
    titleElem.val(comment);
    errorMessageRemove(titleElem);
  }

  function getCommentNotOpenSsh(keyArr) {
    for (var i = 0; i < keyArr.length; i++) {
      if (keyArr[i].indexOf('Comment: ') > -1) {
        return keyArr[i].replace('Comment: ', '');
      }
    }

    return '';
  }
}

function showSshKeyText(event, sshKeyItemObj) {
  event.stopPropagation();
  var pubKey = sshKeyItemObj.find('.ssh__item-publickey').text();
  $('.ssh__item-title').removeClass('ssh__item-title--active');
  sshKeyItemObj.find('.ssh__item-title').addClass('ssh__item-title--active');
  $('#ssh-publickey-textarea').addClass('ssh__publickey--active').attr('data-shown-id', sshKeyItemObj.attr('data-ssh-id'));
  $('#ssh-publickey-textarea').val(pubKey);
}

function getSshKeyPostObject() {
  var postObj = {};
  postObj.Title = addSshKeyBlock.find('[name="Title"]').val();
  postObj.PublicKey = addSshKeyBlock.find('[name="PublicKey"]').val();

  return postObj;
}
function showNewSshKeyOnSettings(newSshKeyObj) {
  $('#ssh').removeClass('hidden');
  $('#ssh-nokeys-text').addClass("hidden");
  addSshKeyBlock.addClass('hidden');
  clearSshAddForm();
  drawNewSshKey(newSshKeyObj);

  var notice = new PanelNotice(resources.Ssh_New_Key_Added + newSshKeyObj.Title, 'success');
}

function clearSshAddForm() {
  addSshKeyBlock.find('[name="Title"]').val('');
  addSshKeyBlock.find('[name="PublicKey"]').val('');
  addSshKeyBlock.find('label').removeClass('stay');
}

function drawNewSshKey(keyObj) {
  var newKeyItem = $('<div/>', {
    class: 'ssh__item clearfix',
    'data-ssh-id': keyObj.Id
  });
  newKeyItem.append($('<span/>', {
    class: 'ssh__item-title',
    'html': keyObj.Title,
    click: function (e) {
      showSshKeyText(e, newKeyItem);
    }
  }))
    .append($('<textarea/>', {
      class: 'ssh__item-publickey hidden',
      'text': keyObj.PublicKey
    }))
    .append($('<span/>', {
      class: 'btn-delete ssh__item-delete',
      'title': resources.Ssh_Delete_Key,
      'data-href': deleteSshUrlDefault.replace("defaultSshId", keyObj.Id),
      click: function (e) {
        deleteSshKey(e, newKeyItem);
      }
    }));

  $('.ssh__list').append(newKeyItem);
}

function deleteSshKey(e, sshKeyItemObj) {
  e.preventDefault();
  e.stopPropagation();

  var confirm = new ConfirmPopup({
    text: resources.Ssh_Delete_Key_Confirm,
    cbProceed: function () {
      sendAjaxRequest('#ssh', sshKeyItemObj.find('.ssh__item-delete').attr('data-href'), {}, deleteSshKeySuccess, null);
    }
  });
}
function deleteSshKeySuccess(deletedSshKeyId) {
  $('.ssh__item[data-ssh-id="' + deletedSshKeyId + '"]').remove();

  var notice = new PanelNotice(resources.Ssh_Delete_Key_Success, 'success');

  if ($('#ssh-publickey-textarea').attr('data-shown-id') == deletedSshKeyId) {
    $('#ssh-publickey-textarea').removeClass('ssh__publickey--active').text('');
  }

  if ($('.ssh__item').length < 1) {
    $('#ssh').addClass('hidden');
    $('#ssh-nokeys-text').removeClass("hidden");
  }
}

// SERVER CREATE PAGE ONLY
function initSshViewServer() {
  // Init ssh multiselect 
  clearSshMultiSelect();

  // Prepare modal Add Ssh Key Block 
  $('#ssh-more-btn').remove();
  addSshKeyBlock.removeClass('hidden');

  // Binding click action to add a Key 
  $('#show-sshkey-modal').click(function (e) {
    e.preventDefault();
    $('#add-ssh-key-modal').modal('show');
  });
}
function clearSshMultiSelect() {
  var sshKeyMiltiSelect = $('#ssh-server-keys');

  sshKeyMiltiSelect.find('option').prop('selected', false);
  if (sshKeyMiltiSelect.next('.chosen-container').length > 0) {
    sshKeyMiltiSelect.trigger('chosen:updated');
  } else {
    sshKeyMiltiSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function () {
      if (sshKeyMiltiSelect.closest(errorSelector).length > 0) {
        sshKeyMiltiSelect.closest(errorSelector).remove();
      }
    });
  }
}
function showNewSshKeyOnServerOrder(newSshKeyObj) {
  // Add new ssh key to corresponding select
  var sshSelect = $('[name="SshKeys"]');
  sshSelect.append($('<option>', {
    'value': newSshKeyObj.Id,
    'text': newSshKeyObj.Title,
    'selected': 'selected'
  }));
  sshSelect.trigger('chosen:updated');

  // Close modal and refresh the form
  $('#add-ssh-key-modal').modal('hide');
  clearSshAddForm();
}
