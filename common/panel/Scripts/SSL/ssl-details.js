$(function () {
  /*-------------- STATE IN PROGRESS --------------*/

  $('#revalidate-btn').click(function () {
    var btn = $(this);

    if (!btn.hasClass('btn-inprogress') && !btn.hasClass('btn-succeded')) {
      if ($('#revalidate').attr('data-revalidate-date')) {
        errorMessageAdd(btn, textRevalidateNext.replace('TIME', $('#revalidate').attr('data-revalidate-date')));
      } else {
        textSendCur = btn.text();
        btn.addClass('btn-inprogress').text(resources.Sending);

        sendAjaxRequest('#revalidate-block', urlRevalidate, {}, function () {
          btn.removeClass('btn-inprogress').addClass('btn-succeded').text(resources.Sent);
        }, function () {
          btn.removeClass('btn-inprogress').text(textSendCur);
        });
      }
    }
  });

  /*-------------- STATE NEED MONEY --------------*/
  $('#ssl-resume').click(function (e) {
    e.preventDefault();

    sendAjaxRequest('#inprogress-money', urlResume, {}, function () {
      location.reload();
    });
  });

  $('#ssl-cancel').click(function (e) {
    e.preventDefault();

    sendAjaxRequest('#inprogress-money', urlDelete, {}, function () {
      location.href = urlList;
    });
  });

  /*-------------- STATE ACTIVE --------------*/
  $('#ssl__cancel-toggle').click(function (e) {
    e.preventDefault();
    $(this).parent().find('#cancel-ssl-order').slideToggle();
  });

  $('#cancel-ssl-btn').click(function (e) {
    e.preventDefault();
    if ($('#cancel-ssl-confirm').prop('checked')) {
      sendAjaxRequest('#cancel-ssl-order', urlCancel, {});
    } else {
      errorMessageAdd($('#cancel-ssl-label'), resources.ConfirmRequired);
    }
  });

  var prolongPeriodSelect = $('#prolong-ssl-period');

  if (prolongPeriodSelect) {
    prolongPeriodSelect.chosen({ disable_search_threshold: 10, width: '260px' });
    $('#prolong-ssl-btn').click(function (e) {
      e.preventDefault();
      sendAjaxRequest('#prolong-ssl-order', urlProlong, { period: prolongPeriodSelect.val() });
    });
  }

  $('.ssl__switchButton').switchButton({
    width: 50,
    height: 25,
    button_width: 25,
    checked: sslProlong,
    on_label: resources.TurnOn,
    off_label: resources.TurnOff,
    labels_placement: "right",
    clear_after: null
  });

  $('.ssl__switchButton').change(function (e) {
    sendAjaxRequest('#ssl-auto-prolong', urlAutoProlong, { enabled: e.target.checked }, null, null, 'PUT');
  });

  /*-------------- STATE ACTIVE SAN --------------*/
  var extraSanFormId = '#addExtraSandomains';

  if ($(extraSanFormId).length !== 0) {
    SanUpdateDomainsCount(modelCert);
  }

  $('.ssl__san-append-domain').click(function () {
    SanAddDomainInput(modelCert);
    SanUpdateDomainsCount(modelCert);
    SanUpdateExtraPrice(modelCert);
  });

  // Forbid submitting form via Enter key press
  $(extraSanFormId).on('keydown', function (e) {
    if (e.keyCode === 13) {
      return false;
    }
  });

  // Sending request
  $('#extraSanOrderBtn').click(function (e) {
    e.preventDefault();
    if ($(extraSanFormId + ' ' + errorSelector).length < 1) {
      sendAjaxRequest(extraSanFormId, $(extraSanFormId).attr('action'), GetExtraSanPostObj(modelCert));
    }
  });


  function SanAddDomainInput(model) {
    var orderedSanDomains = model.SanNames,
      newSanDomains = $('#SanDomainsList .ssl__san-domain'),
      allSanDomainsCount = orderedSanDomains.length + newSanDomains.length;
    if (allSanDomainsCount >= model.Detail.Product.SanMaximum) {
      errorMessageAdd($('#SanDomainsList'), textNoMoreDomainsAllowed);
    } else {
      var isIncorrectInputs = false;
      newSanDomains.each(function () {
        if ($(this).val() === '') {
          isIncorrectInputs = true;
          $(this).addClass('ssl__san-domain--empty');
        };
      });

      if ($('#SanDomainsList').find(errorSelector).length != 0) {
        isIncorrectInputs = true;
      }

      if (isIncorrectInputs) {
        if ($('#SanDomainsList').find(errorSelector).length == 0) {
          errorMessageAdd($('#SanDomainsList .ssl__san-domain--empty'), textFillDomainBeforeCreateAnother);
        }
      } else {
        newSanDomains.removeClass('ssl__san-domain--empty');

        var extraDomainItemRemove = $('<span/>', {
          class: 'ssl__san-domain-remove form-control-feedback glyphicon glyphicon-remove',
          click: function () {
            $(this).parent().remove();
            SanUpdateDomainsCount(model);
            SanUpdateExtraPrice(model);
          }
        }),
          extraDomainInput = $('<input/>', {
            'id': 'SanDomains_' + newSanDomains.length,
            'name': 'SanDomains_' + newSanDomains.length,
            class: 'ssl__san-domain form-control',
            'placeholder': 'domain',
            value: '',
            focusout: function (e) {
              SanExtraDomainChange($(this), model);
            },
            keydown: function (e) {
              if (e.keyCode === 13) {
                SanExtraDomainChange($(this), model);
              }
            }
          });

        $('#SanDomainsList').append($('<div/>', {
          class: 'form-group has-feedback',
          'html': extraDomainInput
        }).append(extraDomainItemRemove));

        extraDomainInput.focus();
      }
    }
  }
  function SanExtraDomainChange(input, model) {
    var inputCloseElem = input.parent().find('.ssl__san-domain-remove');
    errorMessageRemove(input);
    errorMessageRemove(input.parent());

    if (inputCloseElem.is(':active')) {
      inputCloseElem.click();
    } else {
      if (input.val() == '') {
        errorMessageAdd(input, resources.Required);
      } else {
        if (!SanCheckDomainsUnique(input, model)) {
          SanDomainsUniqueError();
        } else if (!regexpDomain.test(input.val())) {
          errorMessageAdd(input, textIncorrectDomain);
        } else {
          SanUpdateExtraPrice(model);
          SanUpdateDomainsCount(model);
        }
      }
    }
  }
  function SanCheckDomainsUnique(input, model) {
    var uniqueDomainCount = 0;
    var existedDomains = model.SanNames.slice(0);
    existedDomains.push(model.Detail.Domain);

    // First, compare input value with other inputs' values in San extra block
    $('#SanDomainsList input').each(function () {
      if ($(this).val() == input.val()) {
        uniqueDomainCount++;
      }
    });

    // Second, compare input value with the domains, already ordered
    existedDomains.forEach(function (elem, index, arr) {
      if (elem == input.val()) {
        uniqueDomainCount++;
      }
    });

    return !(uniqueDomainCount > 1);
  }
  function SanDomainsUniqueError() {
    errorElem.clone().text(textSanDomainRepeat).appendTo($('#SanDomainsList'));
    $('#SanDomainsList').click(function () {
      $('#SanDomainsList .field-validation-error:last-child').remove();
    });
  }
  function SanUpdateDomainsCount(model) {
    var dMax = Number(model.Detail.Product.SanMaximum),
      dMaxElem = $('#SanMaximum'),
      dFree = (model.Detail.Product.SanIncluded == null) ? 0 : Number(model.Detail.Product.SanIncluded),
      dFreeElem = $('#SanIncluded'),
      dCurrentAmount = model.SanNames.length + $('#SanDomainsList .ssl__san-domain').length;

    dMaxElem.text(dMax - dCurrentAmount);
    if (dFree - dCurrentAmount > 0) {
      dFreeElem.text(dFree - dCurrentAmount);
    } else {
      dFreeElem.text(0);
    }

  }
  function SanUpdateExtraPrice(model) {
    var existedSanDomainsCount = model.SanNames.length,
      newSanDomainsCount = $('#SanDomainsList .ssl__san-domain').length,
      newSanDomainsOrderBlock = $(".ssl__san-extra-prices"),
      newSanDomainsPrice = newSanDomainsOrderBlock.find("#SanExtraSum");

    if (newSanDomainsCount > 0) {
      newSanDomainsPrice.text(SanCalculateExtraPrice(newSanDomainsCount, model));
      newSanDomainsOrderBlock.removeClass("hidden");
    } else {
      newSanDomainsPrice.text("");
      newSanDomainsOrderBlock.addClass("hidden");
    }
  }
  function SanCalculateExtraPrice(newDomainsCount, model) {
    var dFreeCount = model.Detail.Product.SanIncluded,
      dCurSanDomainsCount = $('.ssl__params-san-item').length,
      period = model.Detail.Period;

    if (dCurSanDomainsCount >= dFreeCount) {
      return newDomainsCount * FindSanPrice(model, period);
    } else {
      if (newDomainsCount - dFreeCount > 0) {
        return (newDomainsCount + dCurSanDomainsCount - dFreeCount) * FindSanPrice(model, period);
      }
    }
    return 0;
  }
  function FindSanPrice(model, period) {
    var result = 0;
    var sanPrices = model.Detail.Product.SanPrices;
    for (var i = 0; i < sanPrices.length; i++) {
      if (Number(sanPrices[i]['Period']) == period) {
        result = Number(sanPrices[i]['Price']);
        return result;
      }
    }
    return result;
  }
  function GetExtraSanPostObj(model) {
    var postObj = {};
    postObj.SanDomains = [];

    $('#SanDomainsList .ssl__san-domain').each(function () {
      postObj.SanDomains.push($(this).val());
    });

    return postObj;
  }
});