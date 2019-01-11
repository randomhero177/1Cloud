var reqFormId = 'phone-request-form',
  reqFormSelector = '#' + reqFormId,
  reqPhoneSelector = '#phone-request-number',
  reqPhoneInput = $(reqPhoneSelector).find('[name="PhoneNumber"]'),
  reqPhoneBtnSelector = '#phone-request-number-btn',
  reqCodeSelector = '#phone-request-code',
  reqCodeInput = $(reqCodeSelector).find('[name="VerificationCode"]'),
  reqCodeBtnSelector = '#phone-request-code-btn',
  reqCodeResendBtnSelector = '#phone-request-code-resend-btn',
  reqTimeoutSelector = '#phone-request-code-resend-time';
secFactorBtnSelector = '#second-factor-req-btn';
secFactorFormSelector = '#second-factor-request-form';

$(function () {

  if (window.location.search === '?second') {
    $('[href="#secondFactor-settings"]').trigger('click');
    $('#phone-saved .btn').trigger('click');
    if (typeof window.history.replaceState === 'function') {
      window.history.replaceState({}, document.title, window.location.href.replace('?second', ''));
    }
  }

  // Phone send
  $(reqPhoneBtnSelector).click(function (e) {
    e.preventDefault();
    $(this).addClass('btn-send');
    
    sendAjaxRequest(reqFormSelector, $(this).data('action'), {
      PhoneNumber: reqPhoneInput.val()
    }, function () {
      $(reqPhoneBtnSelector).removeClass('btn-send');
      setPhoneVerified();
      initCodeValidation();
    }, function () {
      $(reqPhoneBtnSelector).removeClass('btn-send');
    });
    
  });

  // Code resend
  $(reqCodeResendBtnSelector).click(function (e) {
    e.preventDefault();
    $(this).addClass('btn-send');
    sendAjaxRequest(reqFormSelector, $(this).data('action'), {
      PhoneNumber: reqPhoneInput.val()
    }, function () {
      $(reqCodeResendBtnSelector).removeClass('btn-send');
      initCodeValidation();
    }, function () {
      $(reqCodeResendBtnSelector).removeClass('btn-send');
    });
  });

  // Phone approve
  $(reqCodeBtnSelector).click(function (e) {
    e.preventDefault();
    $(this).addClass('btn-inprogress').prop('disabled', true);
    var confirmedPhone = reqPhoneInput.val();
    $.ajax({
      url: $(reqCodeBtnSelector).data('action'),
      type: 'POST',
      data: {
        PhoneNumber: reqPhoneInput.val(),
        VerificationCode: reqCodeInput.val(),
        __RequestVerificationToken: $(reqFormSelector).find('[name="__RequestVerificationToken"]').val()
      },
      success: function (data) {
        $(reqCodeBtnSelector).removeClass('btn-inprogress').prop('disabled', false);
        if (typeof data !== 'undefined' && data.redirectTo) {
          window.location.href = data.redirectTo;
          return;
        };
        $('.text--notConfirmed, #send-code-txt').addClass('hidden');
        if ($('#phone-request-modal').data('add-2fa')) {
          initFinalSecondFactorView(data);
        } else {
          $('#phone-request-modal').modal('hide');
          let notice = new PanelNotice(resources.Shared_SaveSuccess, 'success');
          $('#phone-request-code').addClass('hidden');
        }
        $('.phone-saved-elem').text(confirmedPhone);
      },
      error: function (data) {
        $(reqCodeBtnSelector).removeClass('btn-inprogress').prop('disabled', false);
        handleAjaxErrors(data, reqFormSelector);
      }
    });
    
  });

  $(secFactorBtnSelector).click(function (e) {
    e.preventDefault();
    var sendObj = {
      Enabled: $(secFactorFormSelector).find('[name="SecondFactor"]').prop('checked')
    }
    sendAjaxRequest(secFactorFormSelector, $(this).data('action'), sendObj, function () {
      window.location.href = window.location.origin + window.location.pathname + '#tab-security'
      location.reload();
    });
  });

  $('#edit-phone').click(function (e) {
    e.preventDefault();
    $('#phone-request-block, #phone-request-number').toggleClass('hidden');
    $(this).find('.glyphicon').toggleClass('glyphicon-ban-circle');
  });
});


function setPhoneVerified() {
  $('#phone-saved').addClass('hidden');
  $(reqPhoneSelector).addClass('phone-request__row--confirmed');
  $('#confirm-pnohe-caption').removeClass('hidden');
  $(reqPhoneSelector).find('label').removeClass('hidden');
  $(reqPhoneBtnSelector).addClass('hidden').prop('disabled', true);
  reqPhoneInput.prop('disabled', true);
}

function resetPhoneVerified() {
  $('#phone-saved').removeClass('hidden');
  $(reqPhoneSelector).removeClass('phone-request__row--confirmed');
  $(reqPhoneSelector).find('label').addClass('hidden');
  $(reqPhoneBtnSelector).removeClass('hidden').prop('disabled', false);
  reqPhoneInput.val('');
  reqPhoneInput.prop('disabled', false);
}

function initCodeValidation() {
  reqCodeInput.val('');
  $(reqCodeResendBtnSelector).prop('disabled', true);
  $(reqCodeResendBtnSelector).text(resources.ResendBefore + ' ');
  $(reqCodeResendBtnSelector).append($('<span />', {
    'id': reqTimeoutSelector.replace('#', '')
  }));
  setCountdownTimer($(reqTimeoutSelector), 3 * 60, function () {
    $(reqCodeResendBtnSelector).prop('disabled', false);
    $(reqCodeResendBtnSelector).text(resources.Resend);
  });

  $(reqCodeSelector).removeClass('hidden');
}

function initFinalSecondFactorView(data) {
  resetPhoneVerified();
  $(reqCodeSelector).addClass('hidden');
  $('#phone-saved').removeClass('hidden');
  $('#phone-saved-elem').text(data.PhoneNumber)

  $("#second-factor-block, #current-phone").removeClass("hidden");
  $(secFactorFormSelector).find('[name="SecondFactor"]').prop('checked', data.SecondFactor);

  $("#phone-request-block, #phone-request-number").addClass("hidden");

  let notice = new PanelNotice(resources.Shared_SaveSuccess, 'success');
}