$(function () {
  $('#servers-list').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    if (params.selected != '') {
      $('#Ip').val(params.selected);
      $('#Ip').next('label').addClass('stay');
    }
  });
  $('#Ip').keyup(function () {
    var curVal = $(this).val();
    if ($('#servers-list').find('option[value="' + curVal + '"]').length > 0) {
      $('#servers-list').val(curVal).trigger('chosen:updated');
    } else {
      $('#servers-list').val('').trigger('chosen:updated');
    }
  });

  $('#Migrate').change(function () {
    $('.dns__ip-servers').toggleClass('dns__ip-servers--visible').slideToggle(function (e) {
      if (!($(this).hasClass('dns__ip-servers--visible'))) {
        $(this).find(errorSelector).remove();
        /*$(this).find('#Ip').val('').next('label').removeClass('stay');
        $('#servers-list').val('').trigger("chosen:updated");*/
      }
    });
  });

  $('#CreateDNSDomainBtn').click(function (e) {
    e.preventDefault();
    e.stopPropagation();

    reachCounterGoal('tryingadddns', 'try');

    if ($('#DomainName').val() == '') {
      errorMessageAdd($('#DomainName'), resources.Required);
    } else {
      var createDNSObj = {};
      createDNSObj.DomainName = $('#DomainName').val();
      createDNSObj.Migrate = $('#Migrate').prop('checked');

      if (!createDNSObj.Migrate) {
        if ($('#Ip').valid()) {
          createDNSObj.Ip = $('#Ip').val();
        } else {
          errorMessageAdd($('#Ip'), $('#Ip').attr('data-val-regex'));
        }

        if (createDNSObj.Ip == '') {
          errorMessageAdd($('#Ip'), resources.Required);
        }
      }

      if ($('#CreateDNSDomainForm').find(errorSelector).length < 1) {
        reachCounterGoal('creatingdns', 'submit');
        sendAjaxRequest('#CreateDNSDomainForm', $('#CreateDNSDomainForm').attr('action'), createDNSObj);
      }
    }
  });
});