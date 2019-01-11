var selects = {};
selects.Company = $('#ssl-select-company');
selects.Type = $('#ssl-select-type');
selects.Options = $('#ssl-select-options');

var yText = {};
yText.ru = { 'year': 'год', 'years': 'года' };
yText.en = { 'year': 'year', 'years': 'years' };

var sslTable = $("#ssl-table");
var sslGotCsr = $('#got-csr');
var sslFormId = '#ssl-order-form';
var sslOrderBtn = $('.ssl__order-btn');

var isValidCsr = false;
var dcvBlock = $('#ssl-dcv-block'),
  dcvSelect = dcvBlock.find('#DcvMethod'),
  dcvApproveBlockId = 'ssl-approver-block';

var confirmOvBlock = $('#ssl-confirm-ov'),
  confirmOvInput = $('#ssl-confirm-ov-input');

// REISSUE PAGE
var isOrderPage = typeof sslProductList !== 'undefined';
var isReissuePage = typeof modelCert !== 'undefined';

var objSSL = {};
objSSL.Model = function () {
  this.VendorList = [];
  this.Chosen = {};

  this.Order = Object.create(null);
  this.Order.CsrCode;
  this.Order.ProductId;
  this.Order.Period;
  this.Order.AdminFirstname;
  this.Order.AdminLastname;
  this.Order.Phone;
  this.Order.OrgPostalcode;
  this.Order.OrgAddressline;
  this.Order.SanDomains = [];

  this.GetCurrentSSL = function (model) {
    this.Order.CsrCode = $('#CsrCode').val();
    this.Order.ProductId = (isOrderPage) ? Number($('#sslName').attr('data-ssl-order-id')) : modelCert.Detail.Product.Id;
    this.Order.Period = Number($('#sslName').attr('data-ssl-order-period'));
    this.Order.AdminFirstname = $('#AdminFirstname').val();
    this.Order.AdminLastname = $('#AdminLastname').val();
    this.Order.Phone = $('#Phone').val();
    this.Order.DcvMethod = dcvSelect.val();

    this.Order.OrgPostalcode = $('#OrgPostalcode').val();
    this.Order.OrgAddressline = $('#OrgAddressline').val();

    if (model.Chosen.SanPrices.length != 0 && $('#SanExtraDomainsList').find(errorSelector).length == 0) {
      model.Order.SanDomains = [];
      $('#SanExtraDomainsList .ssl__san-domain').each(function () {
        if ($(this).val() != '') {
          if (!viewSSL.SanCheckDomainsUnique($(this))) {
            model.Order.SanDomains.push({ "Domain": $(this).val() });
          } else {
            if ($('#SanExtraDomainsList .field-validation-error').length < 1) {
              viewSSL.SanDomainsUniqueError();
            }
          }
        }
      });
    }
  }

  /*
   * Function returns price for certificate for SAN domains during a corresponding period
   * @object model - current chosen SSL-certificate model
   * @number period - period for SSL-certificate
   */
  this.FindSanPrice = function (model, period) {
    var result = 0;
    for (var i = 0; i < model.Chosen.SanPrices.length; i++) {
      if (Number(model.Chosen.SanPrices[i]['Period']) == period) {
        result = Number(model.Chosen.SanPrices[i]['Price']);
        return result;
      }
    }
    return result;
  }

  this.PreparePostCsrObject = function () {
    var Csr = {};
    Csr.Domain = $('#Csr_Domain').val();
    Csr.Organization = $('#Csr_Organization').val();
    Csr.Country = $('#Csr_Country').val();
    Csr.State = $('#Csr_State').val();
    Csr.City = $('#Csr_City').val();
    Csr.Department = $('#Csr_Department').val();
    //Csr.Email = $('#Csr_Email').val();

    return Csr;
  }

  this.GetPostObject = function (model) {
    var isCsrGenerated = sslGotCsr.prop('checked');

    postObj = {};
    postObj.ProductId = model.Order.ProductId;
    postObj.Period = model.Order.Period;
    postObj.AdminFirstname = model.Order.AdminFirstname;
    postObj.AdminLastname = model.Order.AdminLastname;
    postObj.Phone = model.Order.Phone;

    postObj.DcvMethod = model.Order.DcvMethod;
    if (postObj.DcvMethod == 1) {
      postObj.ApproverEmail = $('#ApproverEmail').val();
    }

    if (isCsrGenerated) {
      postObj.CsrCode = $('#CsrCode').val();
    } else {
      postObj.Csr = this.PreparePostCsrObject();
      postObj.IsWildCard = model.Chosen.IsWildCard;
    }

    if (model.Chosen.IsOrganizationValidation) {
      postObj.OrgPostalcode = model.Order.OrgPostalcode;
      postObj.OrgAddressline = model.Order.OrgAddressline;
    }

    if (model.Chosen.IsSan) {
      postObj.SanDomains = model.Order.SanDomains;
    }

    return postObj;
  }
}
objSSL.View = function (model) {
  var sslView = this;
  this.constructor = function () {
    if (isOrderPage) { 
      this.GenerateSslTable(model);

      this.GenerateSelectCompany(model);
      this.GenerateSelectType();
      this.GenerateSelectOptions();

      $('.ssl__bonus-text, .ssl__switch, .ssl__price').hide();

      $('#ssl').quickWizard({
        'element': 'section',
        'breadCrumbElement': 'h2',
        'clickableBreadCrumbs': true
      });
    }

    if (isReissuePage) {
      var expiredDate = new Date(Number(modelCert.Detail.ExpireDate.replace('/Date(', '').replace(')/', '')));
      model.Chosen = modelCert.Detail.Product;
      model.Order.Period = modelCert.Detail.Period;

      $('#CsrCode').text('');
      $('#sslName').text(modelCert.Detail.Product.Name);
      $('#sslExpired').text(expiredDate.toLocaleDateString());
      dcvSelect.val('0');
      sslView.SwitchToOrderForm(null, model);
    }
  };

  this.GenerateSslTable = function (model) {
    for (var i = 0; i < sslProductList.length; i++) {

      // -------------  GENERATE SSL-ITEM ROW WITH CORRESPONDING DATA ATTRIBUTES
      var row = $('<div/>', {
        class: 'ssl__table-row ssl__item',
        'data-ssl-index': i
      });

      row.attr('data-ssl-company', sslProductList[i].Vendor);
      if (findInArr(model.VendorList, sslProductList[i].Vendor) < 0) {
        model.VendorList.push(sslProductList[i].Vendor);
      }

      if (sslProductList[i].IsOrganizationValidation) {
        row.attr('data-ssl-type', 'org');
      } else {
        row.attr('data-ssl-type', 'domain');
      }
      if (sslProductList[i].IsEv) { row.attr('data-ssl-type', 'ev') }

      if (sslProductList[i].IsWildCard) { row.attr('data-ssl-options', 'wild'); }
      if (sslProductList[i].IsSan) { row.attr('data-ssl-options', 'san') }

      // -------------  FILL ROW WITH INFO, SHOWN TO USER
      var sslItemName = sslProductList[i].Name;
      if (sslProductList[i].SanPrices.length > 0 && sslProductList[i].SanIncluded != null) {
        sslItemName += ' <small>(' + textIncluded + ':&nbsp;' + sslProductList[i].SanIncluded + ')</small>'
      }
      row.append($('<div/>', { html: sslItemName }));

      row.append($('<div/>', { html: String(sslProductList[i].Prices[0].Price).replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 ") }));

      var sslItemLink = $('<a/>', {
        class: 'btn btn-primary ssl__table-btn',
        'href': '#',
        'data-ssl-ProductId': sslProductList[i].Id,
        'text': textOrder,
        click: function (e) {
          e.preventDefault();
          sslView.SwitchToOrderForm($(this), model);
          reachCounterGoal('choosessl');
        }
      });
      row.append($('<div/>', { html: sslItemLink }));

      sslTable.append(row);
    }
  }

  this.GenerateSelectCompany = function (model) {
    var opts = '';
    for (var i = 0; i < model.VendorList.length; i++) {
      opts += '<option value="' + model.VendorList[i] + '">' + model.VendorList[i].charAt(0).toUpperCase() + model.VendorList[i].slice(1).replace('_', ' ') + '</option>';
    }
    selects.Company.append(opts).chosen({ disable_search_threshold: 10 }).change(function (e, params) { sslView.FilterChanged() });
  }
  this.GenerateSelectType = function () {
    selects.Type.chosen({ disable_search_threshold: 10 }).change(function (e, params) { viewSSL.FilterChanged() });
  }
  this.GenerateSelectOptions = function () {
    selects.Options.chosen({ disable_search_threshold: 10 }).change(function (e, params) { viewSSL.FilterChanged() });
  }

  this.FilterChanged = function () {
    var valC = selects.Company.val(),
      valT = selects.Type.val(),
      valO = selects.Options.val();

    for (var i = 0; i < sslProductList.length; i++) {
      var item = $('.ssl__item[data-ssl-index="' + i + '"]');

      if (viewSSL.FilterCheck(item, 'company', valC) && viewSSL.FilterCheck(item, 'type', valT) && viewSSL.FilterCheck(item, 'options', valO)) {
        item.show();
      } else {
        item.hide();
      }
    }
    if (sslTable.find('.ssl__item:visible').length < 1) {
      $('#ssl-no-results').removeClass('hidden');
    } else {
      $('#ssl-no-results').addClass('hidden');
    }
  }
  this.FilterCheck = function (obj, attr, val) {
    return (obj.attr('data-ssl-' + attr) == val || val == '');
  }

  this.SwitchToOrderForm = function (btnObj, model) {
    if (isOrderPage) {
      var itemChosen = btnObj.closest('.ssl__item'),
        itemChosenIndex = Number(itemChosen.attr('data-ssl-index')),
        itemChosenID = Number(btnObj.attr('data-ssl-ProductId'));

      model.Chosen = sslProductList[itemChosenIndex];

      $('#sslName').text(model.Chosen.Name).attr('data-ssl-order-id', model.Chosen.Id);
      this.GenerateYearsSwitch(model);

      $('.ssl__item').removeClass('ssl__item--active');
      itemChosen.addClass('ssl__item--active');

      if (itemChosen.attr('data-ssl-type') !== 'domain') {
        $('.ssl__org').removeClass('hidden');
      } else {
        $('.ssl__org').addClass('hidden');
      }
    }

    

    if (model.Chosen.IsOrganizationValidation) {
      confirmOvBlock.removeClass('hidden');
    } else {
      confirmOvBlock.addClass('hidden');
    }

    model.GetCurrentSSL(model);

    this.SetDcvVariants(model);
    this.ShowDcvBlock();
    this.CheckDcvVisibility();
    this.SanShowDomainsBlock(model);

    if ($('#CsrCode').val() != '' && sslGotCsr.prop('checked')) {
      sendSimpleAjaxPostRequest(urlSslDecode, { "CsrCode": $('#CsrCode').val() }, this.ShowDecodedCsr, this.DecodeCsrProgress);
    }

    if (isOrderPage) {
      $('.wizard-steps .current').next().removeClass('disabled').click();
    }
  }
  this.GenerateYearsSwitch = function (model) {
    var priceArr = model.Chosen.Prices;

    if (priceArr.length < 2) {
      $('.ssl__switch').hide();
      $('#sslName').attr('data-ssl-order-period', priceArr[0].Period);

      if ($('#only-one-year').length < 1) {
        $('.ssl__price').append($('<span id="only-one-year" class="ssl__only-year"/>'));
      }
      if (+priceArr[0].Period < 12) {
        $('#only-one-year').text(' (' + textTestPeriod + priceArr[0].Period + ')');
      } else {
        $('#only-one-year').text(' (' + textOneYear + ')');
      }
    } else {
      $('.ssl__price #only-one-year').remove();
      $('.ssl__switch input, .ssl__switch label').remove();

      for (var i = priceArr.length - 1; i >= 0; i--) {
        var yPeriod = Number(priceArr[i].Period) / 12,
          yPrice = Number(priceArr[i].Price),
          yTitle = (yPeriod > 1) ? yText[lang].years : yText[lang].year;

        var switchLabel = $('<label/>', {
          class: 'switch__label',
          'for': 'price-per-' + yPeriod + yText.en.year,
          'text': yPeriod + ' ' + yTitle
        });
        var switchInput = $('<input/>', {
          'type': 'radio',
          'name': 'price-per-input',
          class: 'switch__input',
          'id': 'price-per-' + yPeriod + yText.en.year,
          'value': Number(priceArr[i].Period),
          'data-price': Number(priceArr[i].Price),
          change: function () { viewSSL.UpdateSSLPrice(modelSSL); }
        });

        if (priceArr.length == 2) {
          $('.ssl__switch').addClass('only-two');
        } else {
          $('.ssl__switch').removeClass('only-two');
        }

        if (i == 0) { switchInput.prop('checked', true) }
        $('.ssl__switch').prepend(switchInput, switchLabel);
      }
      $('.ssl__switch').show();
    }
    viewSSL.UpdateSSLPrice(modelSSL);
  }
  this.UpdateSSLPrice = function (model) {
    var period = ($('.ssl__switch:visible').length > 0) ? Number($('.ssl__switch .switch__input:checked').val()) : model.Chosen.Prices[0].Period,
      price = ($('.ssl__switch:visible').length > 0) ? Number($('.ssl__switch .switch__input:checked').attr('data-price')) : model.Chosen.Prices[0].Price,
      priceExtra = 0;

    if (model.Chosen.SanPrices.length > 0) {
      var extraDomainsCount = $('#SanExtraDomainsList .ssl__san-domain').length - model.Chosen.SanIncluded,
        extraDomainCost = modelSSL.FindSanPrice(model, period);

      if (extraDomainsCount > 0) {
        priceExtra = extraDomainCost * extraDomainsCount;
      }
    }
    price += priceExtra;

    $('#sslName').attr('data-ssl-order-period', period);
    $('#ssl-total-sum').text(price.toString().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 "));
    $('.ssl__price').show();

    viewSSL.ShowBonusBlock(modelSSL);
    model.GetCurrentSSL(modelSSL);
  }

  // Get node of test.ru from www.test.ru notation
  function GetRootDomain(domain) {
    try {
      var re = /([a-zA-Z0-9-]{1,30}\.[a-zA-Z0-9-]{2,10})$/;
      return domain.match(re)[0];
    }
    catch (err) {
      console.log("An error has occurred" + err.message)
      return domain;
    }
  }

  this.ShowBonusBlock = function (model) {
    var priceArr = model.Chosen.Prices,
      defaultPeriod = Number($('.ssl__switch .switch__input:first-child').val()),
      chosenPeriod = Number($('.ssl__switch .switch__input:checked').val()),
      chosenYear = chosenPeriod / 12,

      chosenPrice = Number($('.ssl__switch .switch__input:checked').attr('data-price')),
      originalPrice = Number($('.ssl__switch .switch__input:first-child').attr('data-price')),
      originalSum = originalPrice * chosenYear;

    if (model.Chosen.IsSan && model.Chosen.SanPrices.length > 0) {
      var sanDomains = $('#SanExtraDomainsList .ssl__san-domain'),
        sanDomainsForPriceCount = sanDomains.length - model.Chosen.SanIncluded;
      if (sanDomains.length > 0 && sanDomainsForPriceCount > 0) {
        chosenPrice += (model.FindSanPrice(model, chosenPeriod) * sanDomainsForPriceCount);
        originalSum += (model.FindSanPrice(model, defaultPeriod) * sanDomainsForPriceCount * chosenYear);
      }
    }

    if (originalSum > chosenPrice) {
      $('#bonus-percents').text(Math.round(((originalSum / chosenPrice) - 1).toFixed(2) * 100));
      $('#bonus-currency').text(String(originalSum - chosenPrice).replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 "));
      $('.ssl__bonus-pretext').hide();
      $('.ssl__bonus-text').show();
    } else {
      $('.ssl__bonus-text').hide();

      if (priceArr.length < 2) {
        $('.ssl__bonus-pretext').hide();
        $('.ssl__bonus-text').hide();
      } else {
        $('.ssl__bonus-pretext').show();
      }
    }
  }

  this.SslInfoClose = function () {
    $('.ssl__info').slideUp();
    $('.ssl__info-item').hide('slow');
    $('.ssl__readmore').removeClass('ssl__readmore--revealed');
  }

  this.DecodeCsrProgress = function () {
    $('#sslName').addClass('loading');
  }
  this.DecodeCsrError = function () {
    $('#sslName').removeClass('loading');
    $('.ssl__domain, .ssl__send-email').addClass('hidden');

  }
  this.ShowDecodedCsr = function (data) {
    if (data.Csr != undefined) {
      textCsrInvalid = data.Csr;
    } else {
      isValidCsr = true;
      var domain = data.Domain;

      $('#sslName').removeClass('loading');

      $('#sslDomain-text').text(domain);
      $('.ssl__domain').removeClass('hidden');

      sslView.ShowDcvBlock();
      sslView.CheckDcvHttpAvailability();

      if (modelSSL.Chosen.IsWildCard && domain.indexOf('*.') == -1) {
        errorMessageAdd($('#sslDomain'), textWildcard);
      } else {
        errorMessageRemove($('#sslDomain'));
      }
    }
  }
  this.ToggleCsrFieldsVisibility = function () {
    $('#generate-csr-fields, #csr-textarea').toggleClass('hidden');
    $('.ssl__domain, .ssl__send-email').addClass('hidden');
    $('#ssl-order-form .field-validation-error').remove();

    this.CheckDcvVisibility();
  }
  this.ShowConfirmIfCsrFields = function (domainFieldObj) {
    var domain = domainFieldObj.val().replace('*.', '');
    if (domain !== '' && regexpDomain.test(domain)) {
      sslView.ShowDcvBlock();
      sslView.CheckDcvHttpAvailability();
    } else {
      if (!regexpDomain.test(domain)) {
        errorMessageAdd(domainFieldObj, textIncorrectDomain);
      } else {
        errorMessageAdd(domainFieldObj, resources.Required);
      }
      sslView.HideDcvBlock();
    }
  }

  this.CheckDcvVisibility = function () {
    if (sslGotCsr.prop('checked')) {
      $('#CsrCode').change();
    } else {
      if ($('#Csr_Domain').val() !== '') {
        $('#Csr_Domain').change();
      } else {
        sslView.HideDcvBlock();
        $('#' + dcvApproveBlockId).remove();
      }
      $('#Csr_Country').chosen({ disable_search: true, width: '100%' });
    }
  }
  this.SetDcvVariants = function (model) {
    if (model.Chosen.Vendor !== 'comodo') {
      dcvSelect.find('option').each(function () {
        if (!($(this).val() === '0' || $(this).val() == '1')) {
          $(this).prop('disabled', true);
          $(this).text($(this).text() + ' (' + textOnlyForComodo + ')');
        }
      });
      if (!(dcvSelect.val() === '0' || dcvSelect.val() === '1')) {
        dcvSelect.find('option[value="0"]').prop('selected', true);
      }
    } else {
      dcvSelect.find('option').each(function () {
        $(this).prop('disabled', false);
        $(this).text($(this).text().replace(' (' + textOnlyForComodo + ')', ''));
      });
    }
  }
  this.ShowDcvBlock = function () {
    if (dcvBlock.find('.chosen-container').length > 0) {
      dcvSelect.trigger("chosen:updated");
      if (dcvSelect.val() == '1') {
        sslView.GetApproveEmails();
      }
    } else {
      dcvSelect.chosen({
        disable_search: true,
        width: '100%'
      }).change(function (e, params) {
        $(errorSummarySelector).remove();
        if (params.selected === '1') {
          sslView.GetApproveEmails();
        } else {
          $('#' + dcvApproveBlockId).remove();
          sslView.CheckDcvHttpAvailability();
        }
      });
    }
  }
  this.HideDcvBlock = function () {
    dcvSelect.find('option:first').prop('selected', true).trigger('chosen:updated');
    $('#' + dcvApproveBlockId).remove();
  }
  this.GetApproveEmails = function () {
    var domain = (sslGotCsr.prop('checked')) ? $('#sslDomain-text').text() : $('#Csr_Domain').val();
    if (domain !== '') {
      sendAjaxRequest(sslFormId, urlSSLApproveEmails, { "domain": domain }, this.ShowApproveEmailsSelect, this.ShowApproveEmailsError);
    } else {
      console.log('Unfortunately we have not got any domain from you');
    }
  }
  this.ShowApproveEmailsSelect = function (data) {
    $('#' + dcvApproveBlockId).remove();
    var approverFieldset = $('<fieldset/>', { id: dcvApproveBlockId });
    var approverSelect = $('<select />', {
      id: 'ApproverEmail',
      name: 'ApproverEmail'
    });
    approverSelect.append('<option value="">' + textChooseApproverEmail + '</option>');
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        approverSelect.append('<option value=' + data[i] + '>' + data[i] + '</option>');
      }
    }
    approverFieldset.append(approverSelect).insertAfter(dcvBlock);
    approverSelect.chosen({
      disable_search: true,
      width: '100%',
      placeholder_text_single: textChooseApproverEmail
    });
  }
  this.ShowApproveEmailsError = function (data) {
    console.log('error' + data);
  }
  this.CheckDcvHttpAvailability = function () {
    var dcvId = dcvSelect.val();
    $(errorSummarySelector).remove();
    if (dcvId == '3' || dcvId == '4') {
      var domain = (sslGotCsr.prop('checked')) ? $('#sslDomain-text').text() : $('#Csr_Domain').val();
      if (domain !== '') {
        var protocol = (dcvId == '3') ? 'http://' : 'https://';
        sendAjaxRequest('#ssl-dcv-block', urlCheckDomainAvailability, { "Domain": domain, "Protocol": protocol }, this.ShowDcvHttpWarning);
      }
    }
    return false;
  }
  this.ShowDcvHttpWarning = function (data) {
    if (data !== 200) {
      var errMsgBlock = $('<div />', {
        class: errorSummaryClass,
        'html': '<p>' + textDcvAvailabilityWarning + '</p>'
      });
      var errMsgBlockClose = $('<span/>', {
        class: 'glyphicon glyphicon-remove error-summary-close',
        click: function () {
          $(this).closest(errorSummarySelector).remove();
        }
      });
      errMsgBlock.append(errMsgBlockClose);
      dcvBlock.append(errMsgBlock);
    }
  }

  this.CheckCsrValidity = function () {
    if (sslGotCsr.prop('checked')) {
      if ($('#CsrCode').val() === '' || !isValidCsr) {
        errorMessageAdd($('#CsrCode'), textCsrInvalid);
        return;
      }
    } else {
      this.CheckCsrFieldsEmpty('#generate-csr-fields');
    }
  }
  this.CheckCsrFieldsEmpty = function (csrFieldsBlockId) {
    $(csrFieldsBlockId + ' fieldset > input').each(function () {
      if ($(this).val() === '' && !$(this).parent().hasClass('hidden') && !$(this).parent().hasClass('error')) {
        errorMessageAdd($(this), resources.Required);
      }
    });
  }

  this.SanShowDomainsBlock = function (model) {
    if (model.Chosen.IsSan && model.Chosen.SanMaximum !== null) {
      if (isOrderPage) {
        if (model.Chosen.SanIncluded != null) {
          $("#SanIncluded").text(model.Chosen.SanIncluded);
          $('.ssl__san-included').removeClass('hidden');
        } else {
          $('.ssl__san-included').addClass('hidden');
        }
        $('#SanMaximum').text(model.Chosen.SanMaximum);

        viewSSL.UpdateSSLPrice(model);
        viewSSL.SanUpdateDomainsCount(model);
        
        // New check of each SAN domain
        if ($('#SanExtraDomainsList .ssl__san-domain').length > 0) {
          $('#SanExtraDomainsList .ssl__san-domain').each(function () {
            viewSSL.SanExtraDomainChange($(this), model);
          });
        }
      }

      if (isReissuePage) {
        $('#sanReissueMaximum, #sanReissueLeft').text(modelCert.Detail.PaidSanCount);
        viewSSL.SanUpdateReissueDomainsCount();
      }
      
      $('#ProductSanPrices').removeClass('hidden');
      
    } else {
      $('#ProductSanPrices').addClass('hidden');
    }
  }
  this.SanAddDomainInput = function (model) {
    var allSanDomains = $('#SanExtraDomainsList .ssl__san-domain');
    var maximum = (isOrderPage) ? model.Chosen.SanMaximum: modelCert.Detail.PaidSanCount;
    if (allSanDomains.length >= maximum) {
      errorMessageAdd($('#SanExtraDomainsList'), textNoMoreDomainsAllowed);
    } else {
      var isIncorrectInputs = false;
      allSanDomains.each(function () {
        if ($(this).val() === '') {
          isIncorrectInputs = true;
          $(this).addClass('ssl__san-domain--empty');
        };
      });

      if ($('#SanExtraDomainsList').find(errorSelector).length != 0) { isIncorrectInputs = true; }

      if (isIncorrectInputs) {
        if ($('#SanExtraDomainsList').find(errorSelector).length == 0) {
          errorMessageAdd($('#SanExtraDomainsList .ssl__san-domain--empty'), textFillDomainBeforeCreateAnother);
        }
      } else {
        allSanDomains.removeClass('ssl__san-domain--empty');

        var extraDomainItemRemove = $('<span/>', {
          class: 'ssl__san-domain-remove form-control-feedback glyphicon glyphicon-remove',
          click: function () {
            $(this).parent().remove();
            modelSSL.GetCurrentSSL(modelSSL);
            if (isOrderPage) {
              viewSSL.UpdateSSLPrice(modelSSL);
              viewSSL.SanUpdateDomainsCount(model);
            }
            if (isReissuePage) {
              viewSSL.SanUpdateReissueDomainsCount();
            }
          }
        }),
          extraDomainInput = $('<input/>', {
            'id': 'SanDomains_' + allSanDomains.length,
            'name': 'SanDomains_' + allSanDomains.length,
            class: 'ssl__san-domain form-control',
            'placeholder': 'domain',
            value: '',
            focusout: function (e) {
              viewSSL.SanExtraDomainChange($(this), modelSSL);
            }
          });

        $('#SanExtraDomainsList').append($('<div/>', {
          class: 'form-group has-feedback',
          'html': extraDomainInput
        }).append(extraDomainItemRemove));

        extraDomainInput.focus();
      }
    }
  }
  this.SanExtraDomainChange = function (input, model) {
    var inputCloseElem = input.parent().find('.ssl__san-domain-remove'),
      domain = input.val();

    errorMessageRemove(input);
    $('#SanExtraDomainsList > ' + errorSelector).remove();

    if (inputCloseElem.is(':active')) {
      inputCloseElem.click();
    } else {
      if (domain == '') {
        errorMessageAdd(input, resources.Required);
        return;
      } else {
        if (this.SanCheckDomainsUnique(input)) {
          this.SanDomainsUniqueError();
          return;
        }

        /*
         * If San certificate has Wildcard option we should let client to enter domains in Wildcard notation (*.domain.com).
         * Correct check must be based on if (sslInitObj.IsWildCard), but Goget sends us wildcard=false option for these certificates o_O. Thats why hardcode.
         * hardCodeIdArr - Array of certificate's Id, for which we must let clients be happy
         */
        var hardCodeIdArr = [27, 46, 47];
        if (findInArr(hardCodeIdArr, model.Chosen.Id) !== -1) {
          domain = domain.replace('*.', '');
        }

        if (!regexpDomain.test(domain)) {
          errorMessageAdd(input, textIncorrectDomain);
        }
      }
    }
  }
  this.SanCheckDomainsUnique = function (input) {
    var uniqueDomainCount = 0;
    $('#SanExtraDomainsList input').each(function () {
      if ($(this).val() == input.val()) {
        uniqueDomainCount++;
      }
    });
    return (uniqueDomainCount > 1);
  }
  this.SanDomainsUniqueError = function () {
    errorElem.clone().text(textSanDomainRepeat).appendTo($('#SanExtraDomainsList'));
    $('#SanExtraDomainsList').click(function () {
      $('#SanExtraDomainsList .field-validation-error:last-child').remove();
    });
  }
  this.SanUpdateDomainsCount = function (model) {
    var dMax = Number(model.Chosen.SanMaximum),
      dMaxElem = $('#SanMaximum'),
      dFree = (model.Chosen.SanIncluded == null) ? 0 : Number(model.Chosen.SanIncluded),
      dFreeElem = $('#SanIncluded'),
      dCurrentAmount = $('#SanExtraDomainsList .ssl__san-domain').length;

    dMaxElem.text(dMax - dCurrentAmount);
    dFreeElem.text((dFree - dCurrentAmount > 0) ? dFree - dCurrentAmount : 0);
  }
  this.SanUpdateReissueDomainsCount = function () {
    var dMax = modelCert.Detail.PaidSanCount,
      dLeftElem = $('#sanReissueLeft'),
      dCurrentAmount = $('#SanExtraDomainsList .ssl__san-domain').length;
    
    dLeftElem.text((dMax - dCurrentAmount > 0) ? dMax - dCurrentAmount : 0);
  }
}
objSSL.Controller = function (model, view) {

  /*======================== SSL READMORE  =======================*/
  if (isOrderPage) {
    $('.ssl__readmore').click(function (e) {
      e.preventDefault();
      var b = $(this).attr('href');

      if ($(this).hasClass('ssl__readmore--revealed')) {
        viewSSL.SslInfoClose();
      } else {
        if ($('.ssl__info:visible').length < 1) {
          $(b).show();
          $('.ssl__info').slideDown();
        } else {
          $('.ssl__info-item').hide();
          $(b).show();
        }

        $('.ssl__readmore').removeClass('ssl__readmore--revealed');
        $(this).addClass('ssl__readmore--revealed');
      }
    });
    $('.ssl__info-close').click(function () {
      viewSSL.SslInfoClose();
    });
  }

  /*======================== SCROLL FIXED CERT INFO  =======================*/
  /*$(window).scroll(function () {
      if ($('.ssl__cert-info:visible').length > 0) {
          if ($(window).scrollTop() > ($('.ssl__cert-block').offset().top - $('.main-head').outerHeight())) {
              $('.ssl__cert-info').addClass('fixed').css({
                  'width': $('.ssl__cert-block').innerWidth() - 30,
                  'top': $('.main-head').outerHeight() + 15
              });
          } else {
              $('.ssl__cert-info').removeClass('fixed').removeAttr('style');
          }
      }
  });*/

  /*======================== DECODE CSR  =======================*/
  $('#CsrCode').change(function () {
    var CsrCode = $(this).val();
    if (CsrCode != '') {
      view.DecodeCsrProgress();
      sendAjaxRequest(sslFormId, urlSslDecode, { "CsrCode": CsrCode }, view.ShowDecodedCsr, view.DecodeCsrError);
    } else {
      $('.ssl__domain').addClass('hidden');
      view.HideDcvBlock();
    }
  });

  /*======================== GENERATE Csr  =======================*/
  sslGotCsr.change(function () {
    view.ToggleCsrFieldsVisibility();
  });

  $('#Csr_Domain').change(function () {
    view.ShowConfirmIfCsrFields($(this));
  });

  /*======================== ADD SAN DOMAINS  =======================*/
  $('.ssl__san-add-domain').click(function () {
    view.SanAddDomainInput(model);
    
    if (isOrderPage) {
      view.UpdateSSLPrice(model);
      view.SanUpdateDomainsCount(model);
    }
    if (isReissuePage) {
      view.SanUpdateReissueDomainsCount();
    }
  });

  /*======================== ORDER  =======================*/
  $('#ssl-order-form').submit(function (e) {
    e.preventDefault();
    sslOrderBtn.trigger('click');
  });

  sslOrderBtn.click(function (e) {
    e.preventDefault();

    reachCounterGoal('sslyordertry', 'try');

    model.GetCurrentSSL(model);
    view.CheckCsrValidity();

    if (dcvSelect.val() === null || dcvSelect.val() == '0') {
      errorMessageAdd(dcvSelect, resources.Required);
      return false;
    }

    if (model.Chosen.IsOrganizationValidation && !confirmOvInput.prop('checked')) {
      errorMessageAdd(confirmOvInput, resources.Required);
      return false;
    }

    if ($('#ssl-order-form ' + errorSelector).length < 1) {
      var url = (isOrderPage) ? $(sslFormId).attr('action') : $(sslFormId).attr('action').replace('1', modelCert.Detail.Id);

      reachCounterGoal('sslorder', 'submit');

      sendAjaxRequest(sslFormId, url, model.GetPostObject(model));
    }
  });
}

var modelSSL = new objSSL.Model();
var viewSSL = new objSSL.View(modelSSL);
viewSSL.constructor();
var controllerSSL = new objSSL.Controller(modelSSL, viewSSL);
