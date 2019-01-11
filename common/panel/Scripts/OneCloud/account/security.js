'use strict';

var securityTabUrl = window.location.origin + window.location.pathname + '#tab-security';

/******** CHANGE PASSWORD *********/
(function initChangePass(formSelector) {
  var form = document.querySelector(formSelector);

  if (form) {
    form.addEventListener('submit', performChangePass);
  }

  function performChangePass(e) {
    e.preventDefault();
    var curPassElem = document.querySelector('[name="CurrentPassword"]'),
      newPassElem = document.querySelector('[name="NewPassword"]'),
      confPassElem = document.querySelector('[name="ConfirmPassword"]');

    if (curPassElem.value === '' || newPassElem.value === '' || confPassElem.value === '') {
      return;
    }

    var confirm = new ConfirmPopup({
      text: resources.Account_Forced_Logout_Warning,
      cbProceed: function () {
        sendAjaxRequest(formSelector, form.action, getPassObj(), changePassSuccess);
      }
    });

    function getPassObj() {
      return {
        CurrentPassword: curPassElem.value,
        NewPassword: newPassElem.value,
        ConfirmPassword: confPassElem.value
      }
    }
    function changePassSuccess(data) {
      var notice = new PanelNotice(resources.Completed_Successful_Text, 'success');
      setTimeout(function () {
        location.href = securityTabUrl;
        location.reload();
      }, 1000); // 1 second
    }
  }
})('#change-password-form');


/**** Add second factor through application ****/

(function () {
  var application = {
    config: {
      linkId: 'app-auth-link',
      blockId: 'app-auth-block',
      formId: 'app-auth-form',
      imageBlock: 'app-2fa-image-block',
      imageModalPanel: 'app-auth-panel',
      subbmitBtnId: 'app-2fa-btn',
      codeInput: $('#app-auth-form').find('[name="VerificationCode"]')
    },
    action: {
      showBlock: function () {
        $('#' + application.config.linkId).click(function (e) {
          var action = $(this).data('action');
          $('#' + application.config.blockId).modal('show');
          $('#' + application.config.imageBlock).addClass('loading loading--full');
          sendAjaxRequest('#' + application.config.imageModalPanel, action, {}, function (data) {
            application.action.generateApp2FaKey(data);
          });
        })
      },
      generateApp2FaKey: function (data) {
        var image = $('<img />', {
          'src': 'data:' + data.ImageType + ';base64,' + data.ImageAsBase64,
          'width': '200px'
        });
        $('#' + application.config.imageBlock).find('img').remove();
        $('#' + application.config.imageBlock).removeClass('loading loading--full').append(image);
        $('#' + application.config.subbmitBtnId).prop('disabled', false);
      },
      enableApp2Fa: function () {
        var c = application.config;
        $('#' + c.formId).submit(function (e) {
          e.preventDefault();
          sendAjaxRequest('#' + c.formId, $('#' + c.formId).attr('action'), { VerificationCode: c.codeInput.val() }, function () {
            location.href = securityTabUrl;
            location.reload();
          })
        })
      },
      disableApp2Fa: function () {
        $('#disable-2fa').click(function (e) {
          e.preventDefault();
          var action = $(this).data('action');
          let confirm = new ConfirmPopup({
            text: resources.Account_Confirm_Disable_2FA,
            cbProceed: function () {
              $('#connected-2fa').addClass('loading loading--full');
              sendAjaxRequest('#connected-2fa', action, {}, function () {
                location.href = securityTabUrl;
                location.reload();
              });
            }
          });
        });
      },
      init: function () {
        application.action.showBlock();
        application.action.enableApp2Fa();
        application.action.disableApp2Fa();
      }
    }
  };
  application.action.init();
})();

$('.js-call-phone-request').click(function () {
  $('#phone-request-modal').modal('show');

  //define if user want to add 2factor or edit phone number
  if (typeof $(this).data('factor') === 'undefined') {
    $('#second-factor-block, #current-phone').addClass('hidden');
    $('#phone-request-block, #phone-request-number').removeClass('hidden');
    $('#phone-request-modal').data('add-2fa', false);
  } else {
    if ($(this).data('phone')) {
      $('#second-factor-block, #current-phone, #phone-saved').removeClass('hidden');
      $('#phone-request-block, #phone-request-number, #send-code-txt').addClass('hidden');
    };
    $('#phone-request-modal').data('add-2fa', true);
  };
});
$('.edit-control').click(function (e) {
  e.preventDefault();
})