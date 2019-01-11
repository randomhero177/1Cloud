$(function () {
  /******** REFERRAL BANNER *********/
  $('#referral-banner-type').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    showReferralBanner(params.selected);
  });

  $('#referral-banner-block').hide();
  $('#referral-banner-trigger').click(function () {
    $('#referral-banner-block').slideToggle();
    showReferralBanner($('#referral-banner-type').val());
  });
  $('.referral-banner__textarea').click(function () {
    this.select();
  });

  function showReferralBanner(bannerType) {
    $('.referral-banner__textarea').hide();
    $('#banner-' + bannerType).show();
  }

  /******** REFERRAL LINK *********/
  $('#referral-link').click(function () {
    selectText(this.id);
  });

  function selectText(containerid) {
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(containerid));
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(document.getElementById(containerid));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  }

  /******** REFERRAL WITHDRAWAL *********/
  $('#transferForm').submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    let form = $('#transferForm');
    let confirm = new ConfirmPopup({
      text: withdrawalWarning,
      cbProceed: function () {
        sendSimpleAjaxPostRequest(form.attr('action'), {}, withdrawalSuccess, withdrawalProcess);
      }
    });
  });

  function withdrawalProcess() {
    $('#transferForm').addClass('loading loading--full');
  }
  function withdrawalSuccess(data) {
    $('#transferForm').removeClass('loading loading--full');
    if (data.redirectTo) {
      window.location.href = data.redirectTo;
    }
  }

  /******** REFERRAL INVITE *********/
  var inviteFormId = '#InviteReferral',
    inviteEmailId = '#InviteModel_Email',
    invitedMessageId = '#InviteSuccess',
    invitedClienId = '#InvitedClient';

  $(inviteFormId).submit(function (e) {
    e.preventDefault();
    if ($(inviteEmailId).val() == '') {
      errorMessageAdd($(inviteEmailId), resources.Required);
      return false;
    }

    reachCounterGoal('parneradd', 'submit');
    sendAjaxRequest(inviteFormId, $(inviteFormId).attr('action'), { UserEmail: $(inviteEmailId).val() }, invitedSuccess, null);
  });
  function invitedSuccess(data) {
    $(inviteFormId).find('.btn-inprogress').removeClass('btn-inprogress').text(textSendCur);  

    $(invitedClienId).text($(inviteEmailId).val());
    $(invitedMessageId).removeClass('hidden');
    document.querySelector(inviteFormId).reset();

    setTimeout(function () {
      $(invitedMessageId).addClass('hidden');
    }, 4000);
  }

  /******** SOCIAL SHARE *********/
  /*
  ** 
  **
  */

  setTimeout(function () {
    initVkShare();
  }, 1000);

  function initVkShare() {
    var shareVkElem = $('#referral-share-vk');

    if (shareVkElem.length > 0 && typeof socialShareContent !== 'undefined' && typeof VK.Share.button === 'function') {
      socialShareContent.image = socialShareContent.image || shareVkElem.parent().data('default-logo');
      socialShareContent.url = shareVkElem.parent().data('href');
      socialShareContent.noparse = true;

      var btn = VK.Share.button(socialShareContent, {
        type: 'custom',
        text: '<img src="http://vk.com/images/vk32.png" />'
      });

      shareVkElem.html(btn);
    }
  }
});