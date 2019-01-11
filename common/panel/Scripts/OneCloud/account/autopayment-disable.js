$(function () {
  var autopaymentDisableBtn = $('#autopayment-disable-btn');

  if (autopaymentDisableBtn.length > 0) {
    autopaymentDisableBtn.click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      let confirm = new ConfirmPopup({
        text: resources.Account_Usersettings_Autopayment_Disable_Confirm,
        cbProceed: autoPaymentUnsubscribe
      });
    });
  }

  function autoPaymentUnsubscribe() {
    sendSimpleAjaxPostRequest(autopaymentDisableBtn.attr('data-href'), {}, function () {
      location.reload();
    }, function () {
      $('#autopayment-disable-block').addClass('loading loading--full');
        }, function (data) {
      $('#autopayment-disable-block').removeClass('loading loading--full');
            handleAjaxErrors(data, '#autopayment-disable-block');
    });
  }
});