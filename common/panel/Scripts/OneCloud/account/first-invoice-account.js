$(function () {

  initCompanyData('#create-first-invoice-ru-form');
  initCompanyData('#create-first-invoice-kz-form');

  initAutoInvoice('#invoice-params-form');
});

function initCompanyData(formSelector) {
  var companyDataForm = $(formSelector);

  if (companyDataForm.length > 0) {
    var invoiceGenerationSelect = companyDataForm.find('.invoice-generation-type');
    var companyInnField = companyDataForm.find('[name="INN"]');
    var companyAmountField = companyDataForm.find('[name="AutoInvoiceAmount"]');
    var isCompanyRu = companyDataForm.find('[name="INN"]').length > 0;
    
    invoiceGenerationSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
      companyDataForm.find(invoiceGenerationSelect.data('for')).val(params.selected);
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

      if (companyAmountField.val() === '') {
        errorMessageAdd(companyAmountField, resources.Shared_Required);
        return;
      }

      if (companyDataForm.valid()) {
        sendAjaxRequest(formSelector, companyDataForm.attr('action'), getCompanyPostObj(), function (data) {

          sendAjaxRequest(formSelector, companyDataForm.data('create-invoice-url'), {
            InvoiceAmount: companyAmountField.val()
          }, null, function (data) {
            if (data.InvoiceAmount) {
              errorMessageAdd(companyAmountField, data.InvoiceAmount[0]);
            }
            let notice = new PanelNotice(resources.Shared_Incorrect_Data, 'danger');
          });

        }, function () {
          let notice = new PanelNotice(resources.Shared_Incorrect_Data, 'danger');
        });
      }
    });

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
      LegalAddress: companyDataForm.find('[name="LegalAddress"]').val(),
      ActualAddress: companyDataForm.find('[name="ActualAddress"]').val(),
      FinanceEmail: companyDataForm.find('[name="FinanceEmail"]').val(),
      AutoInvoiceGenerationTypeId: companyDataForm.find('input[name="AutoInvoiceGenerationTypeId"]').val(),
      AutoInvoiceAmount: companyDataForm.find('[name="AutoInvoiceAmount"]').val(),
      PreferInvoiceWithVat: companyDataForm.find('[name="PreferInvoiceWithVat"]').val(),
      DocDeliveryPeriod: companyDataForm.find('[name="DocDeliveryPeriod"]').val()
    }

    if (isCompanyRu) {
      obj.INN = companyDataForm.find('[name="INN"]').val();
      obj.KPP = companyDataForm.find('[name="KPP"]').val();
    } else {
      obj.BIN = companyDataForm.find('[name="BIN"]').val();
      obj.Bank = companyDataForm.find('[name="Bank"]').val();
      obj.BIK = companyDataForm.find('[name="BIK"]').val();
      obj.CheckingAccount = companyDataForm.find('[name="CheckingAccount"]').val();
    }

    if (companyDataForm.find('[name="DocDeliveryMode"]').length > 0) {
      obj['DocDeliveryMode'] = companyDataForm.find('[name="DocDeliveryMode"]').val();
      obj['DocDeliveryProvider'] = companyDataForm.find('[name="DocDeliveryProvider"]').val();
    }

    return obj;
  }

};

function initAutoInvoice(formSelector) {
  var form = $(formSelector);
  var modal = $('#invoiceParamsModal');

  if (form.length > 0) {
    var typeSelect = form.find('[name="GenerationTypeId"]');
    var amountInput = form.find('[name="InvoiceAmount"]');
    var amountParent = amountInput.parent();

    checkDecimal(amountInput, ',')
    toggleAmountFieldVisibility();
    typeSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(toggleAmountFieldVisibility);

    form.submit(function (e) {
      e.preventDefault();

      sendAjaxRequest(formSelector, form.attr('action'), {
        GenerationTypeId: typeSelect.val(),
        InvoiceAmount: amountInput.val()
      }, onSuccessChangeParams);
    });

    function toggleAmountFieldVisibility() {
      // '3' Equals to "Disable autoinvoice"
      amountParent[(typeSelect.val() == '3') ? 'addClass' : 'removeClass']('hidden');
    }

    function onSuccessChangeParams(data) {
      if (modal) {
        modal.modal('hide');
      }
      location.reload();
    }
  }
}