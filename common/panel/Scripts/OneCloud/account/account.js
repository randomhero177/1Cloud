$(function () {

  initCompanyData('#company-ru-form');
  initCompanyData('#company-kz-form');
});

function initCompanyData(formSelector) {
  var companyDataForm = $(formSelector);
  var docDeliveryModeSelect = companyDataForm.find('[name="DocDeliveryMode"]');
  var invoiceGenerationSelect = companyDataForm.find('.invoice-generation-type');
  var invoiceAmountInput = companyDataForm.find('[name="AutoInvoiceAmount"]');

  var companyInnField = companyDataForm.find('[name="INN"]');
  var isCompanyRu = companyDataForm.find('[name="INN"]').length > 0;
  
  if (invoiceGenerationSelect.length > 0) {
    checkDecimal(invoiceAmountInput, ',');
    toggleAmountFieldVisibility();
  }

  companyDataForm.find('.account-select').each(function () {
    $(this).chosen({ disable_search_threshold: 10, width: '100%' });
  });

  if (docDeliveryModeSelect.length > 0) {
    toggleDocDeliveryVisibility();

    docDeliveryModeSelect.change(function () {
      toggleDocDeliveryVisibility();
    });
  }
    
  invoiceGenerationSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    companyDataForm.find(invoiceGenerationSelect.data('for')).val(params.selected);
    toggleAmountFieldVisibility();
  });

  if (isCompanyRu) {
    companyInnField.on('input', function () {
      if (companyInnField.valid()) {
        initSuggestion(companyInnField, performPasteCompanyData);
      }
    });
  }

  companyDataForm.submit(function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (companyDataForm.valid()) {
      sendAjaxRequest(formSelector, companyDataForm.attr('action'), getCompanyPostObj(), function () {
        let notice = new PanelNotice(resources.Shared_Changes_Saved, 'success');
      }, function () {
        let notice = new PanelNotice(resources.Shared_Incorrect_Data, 'danger');
      });
    }
  });

  /*
 * Shows or hides docDeliveryProvider block. Shows only, when deliveryMode "Electronic document management" is chosen
 */

  function toggleDocDeliveryVisibility() {
    var deliveryModeId = docDeliveryModeSelect.val();
    var providerBlock = companyDataForm.find('.doc-delivery-provider');
    var providerSelect = companyDataForm.find('[name="DocDeliveryProvider"]');

    if (deliveryModeId == 3) {
      providerBlock.removeClass('hidden');
      if (providerSelect.val() == '') {
        providerSelect.val('1').trigger('chosen:updated');
      }
    } else {
      providerBlock.addClass('hidden');
    }
  }

  function toggleAmountFieldVisibility() {
    // '3' Equals to "Disable autoinvoice"
    invoiceAmountInput.parent()[(invoiceGenerationSelect.val() == '3') ? 'addClass' : 'removeClass']('hidden');
  }

  function initSuggestion(input, cbPaste) {
    var parent = input.closest('.suggestions');
    var pasteData = cbPaste || function (data) {
      console.log(data);
    };
    var suggestTimeout = false;

    if (typeof suggestTimeout === 'boolean') {
      parent.addClass('loading');
      suggestTimeout = setTimeout(function () {
        sendAjaxGetRequest(input.data('suggestions-url').replace('defaultValue', input.val()), function (data) {
          showSuggestionBlock(data);
          parent.removeClass('loading');
          suggestTimeout = false;
        }, function (data) {
          parent.removeClass('loading');
          suggestTimeout = false;
        });
      }, 500);
    }

    function showSuggestionBlock(data) {
      if (data.length > 0) {
        var block = $('<div />', {
          class: 'suggestions__block'
        });
        var close = $('<span />', {
          class: 'suggestions__close',
          html: '&times;',
          click: removeSuggestionBlock
        });
        var list = $('<ul />', {
          class: 'suggestions__list'
        });

        data.forEach(function (el, i) {
          var item = $('<li />', {
            text: el.CompanyName,
            click: function () {
              pasteData(data[i]);
              removeSuggestionBlock();
            }
          });

          list.append(item);
        });

        block.append(close);
        block.append(list);
        parent.append(block);
        input.on('input', removeSuggestionBlock);
      }
    }

    function removeSuggestionBlock() {
      var block = parent.find('.suggestions__block');
      if (block) {
        block.remove();
      }
      input.off('input', removeSuggestionBlock);
    }
  }
    
  function performPasteCompanyData(companyData) {
    for (var item in companyData) {
      var field = companyDataForm.find('[name="' + item + '"]');

      if (companyData[item] && field.length > 0) {
        field.val(companyData[item]);
      }
    }

    companyDataForm.valid();
  }

  function getCompanyPostObj() {
    var obj = {
      CompanyName: companyDataForm.find('[name="CompanyName"]').val(),
      Bank: companyDataForm.find('[name="Bank"]').val(),
      BIK: companyDataForm.find('[name="BIK"]').val(),
      CheckingAccount: companyDataForm.find('[name="CheckingAccount"]').val(),
      SignatoryName: companyDataForm.find('[name="SignatoryName"]').val(),
      SignatoryJob: companyDataForm.find('[name="SignatoryJob"]').val(),
      LegalAddress: companyDataForm.find('[name="LegalAddress"]').val(),
      ActualAddress: companyDataForm.find('[name="ActualAddress"]').val(),
      FinanceEmail: companyDataForm.find('[name="FinanceEmail"]').val(),
      DocDeliveryPeriod: companyDataForm.find('[name="DocDeliveryPeriod"]').val(),
      AutoInvoiceGenerationTypeId: companyDataForm.find('input[name="AutoInvoiceGenerationTypeId"]').val(),
      AutoInvoiceAmount: companyDataForm.find('[name="AutoInvoiceAmount"]').val()
    }

    if (isCompanyRu) {
      obj.INN = companyDataForm.find('[name="INN"]').val();
      obj.KPP = companyDataForm.find('[name="KPP"]').val();
      obj.OGRN = companyDataForm.find('[name="OGRN"]').val();
      obj.OKPO = companyDataForm.find('[name="OKPO"]').val();
      obj.CorrespondentAccount = companyDataForm.find('[name="CorrespondentAccount"]').val();
    } else {
      obj.BIN = companyDataForm.find('[name="BIN"]').val();
      obj.KBe = companyDataForm.find('[name="Kbe"]').val();
    }

    if (companyDataForm.find('[name="DocDeliveryMode"]').length > 0) {
      obj['DocDeliveryMode'] = companyDataForm.find('[name="DocDeliveryMode"]').val();
      obj['DocDeliveryProvider'] = companyDataForm.find('[name="DocDeliveryProvider"]').val();
    }
    if (companyDataForm.find('.company-data__choose-vat').length) {
      obj['PreferInvoiceWithVat'] = companyDataForm.find('[name="PreferInvoiceWithVat"]:checked').val();
    } else {
      obj['PreferInvoiceWithVat'] = companyDataForm.find('[name="PreferInvoiceWithVat"]').val();
    }

    return obj;
  }
};
