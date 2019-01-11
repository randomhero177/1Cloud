$(function () {
  var yText = {};
  yText.ru = { 'year': 'год', 'years': 'года' };
  yText.en = { 'year': 'year', 'years': 'years' };

  var lang = 'ru'; // HACK FOR WEB2 - ALWAYS IN RUSSIAN

  var isValidCsr = false;
  var sslFormId = '#ssl-order-form';
  var sslForm = $(sslFormId);
  var sslGotCsr = $('#got-csr');
  var sslDomainInput = $('#Domain');
  var sslCsrCodeInput = $('#CsrCode')
  var sslBtn = '#ssl-order-btn';
  var sslMobileBtn = '#ssl-order-mobile-btn';

  var dcvBlock = $('#ssl-dcv-block'),
    dcvSelect = dcvBlock.find('#DcvMethod'),
    dcvApproveBlockId = 'ssl-approver-block';

  sslOrderInit(sslInitObj);

  /*
   * Function returns price for certificate for corresponding period
   * @object model - current chosen SSL-certificate model
   * @number period - period for SSL-certificate
   */
  function findSanPrice(product, period) {
    var result = 0;
    for (var i = 0; i < product.SanPrices.length; i++) {
      if (Number(product.SanPrices[i]['Period']) == period) {
        result = Number(product.SanPrices[i]['PriceDetail'].Amount);
        return result;
      }
    }
    return result;
  }
  function getPostObject(product) {
    var isCsrGenerated = sslGotCsr.prop('checked');

    postObj = {};
    postObj.ProductId = Number($('#sslName').attr('data-ssl-order-id'));
    postObj.Period = Number($('#sslName').attr('data-ssl-order-period'));
    postObj.AdminFirstname = $('#AdminFirstname').val();
    postObj.AdminLastname = $('#AdminLastname').val();
    postObj.Phone = $('#Phone').val();
    postObj.Email = $('#Email').val();

    postObj.DcvMethod = $('#DcvMethod').val();
    if (postObj.DcvMethod == 'Email') {
      postObj.ApproverEmail = $('#ApproverEmail').val();
    }

    if (isCsrGenerated) {
      postObj.CsrCode = sslCsrCodeInput.val();
    } else {
      postObj.Csr = preparePostCsrObject();
      postObj.IsWildCard = sslInitObj.IsWildCard;
    }

    if (product.IsOrganizationValidation) {
      postObj.OrgPostalcode = $('#OrgPostalcode').val();
      postObj.OrgAddressline = $('#OrgAddressline').val();
    }

    if (product.IsSan) {
      if (product.SanPrices.length != 0 && $('#SanExtraDomainsList').find(errorElemSelector).length == 0) {
        postObj.SanDomains = [];
        $('#SanExtraDomainsList .ssl__san-domain').each(function () {
          if ($(this).val() != '' && checkSanDomainsUnique($(this))) {
            postObj.SanDomains.push({ "Domain": $(this).val() });
          } else {
            showSanDomainsUniqueError();
          }
        });
      }
    }

    return postObj;
  }
  function generateYearsSwitch(product) {
    var priceArr = product.Prices;

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
          yPrice = Number(priceArr[i].PriceDetail.Amount),
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
          'data-price': Number(priceArr[i].PriceDetail.Amount),
          change: function () {
            if ($(this).prop('checked')) {
              updateSSLPrice(product);
            }
          }
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
      $('#ssl-total-sum').text($('#ssl-total-sum').text().replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, "\$1 "));
    }
  };
  function updateSSLPrice(product) {
    var period = ($('.ssl__switch:visible').length > 0) ? Number($('.ssl__switch .switch__input:checked').val()) : product.Prices[0].Period,
      price = ($('.ssl__switch:visible').length > 0) ? Number($('.ssl__switch .switch__input:checked').attr('data-price')) : product.Prices[0].PriceDetail.Amount,
      priceExtra = 0;

    if (product.IsSan) {
      var extraDomainsCount = $('#SanExtraDomainsList .ssl__san-domain').length - product.SanIncluded,
        extraDomainCost = findSanPrice(product, period);

      if (extraDomainsCount > 0) {
        priceExtra = extraDomainCost * extraDomainsCount;
      }
    }
    price += priceExtra;

    $('#sslName').attr('data-ssl-order-period', period);
    $('#ssl-total-sum').text(price.toLocaleString());
    $('.ssl__price').show();

    showBonusBlock(product);
    updateSSLMobileBlock()
  };
  function updateSSLMobileBlock() {
    $('#period-mobile').text('(' + $('.switch__input:checked + label').text() + ')');
    $('#price-mobile').text($('#ssl-total-sum').text());
  }

  // Get node of test.ru from www.test.ru notation
  function getRootDomain(domain) {
    try {
      var re = /([a-zA-Z0-9-]{1,30}\.[a-zA-Z0-9-]{2,10})$/;
      return domain.match(re)[0];
    }
    catch (err) {
      console.log("An error has occurred" + err.message)
      return domain;
    }
  };

  function showBonusBlock(product) {
    var priceArr = product.Prices,
      defaultPeriod = Number($('.ssl__switch .switch__input:first-child').val()),
      chosenPeriod = Number($('.ssl__switch .switch__input:checked').val()),
      chosenYear = chosenPeriod / 12,

      chosenPrice = Number($('.ssl__switch .switch__input:checked').attr('data-price')),
      originalPrice = Number($('.ssl__switch .switch__input:first-child').attr('data-price')),
      originalSum = originalPrice * chosenYear;

    if (product.IsSan && product.SanPrices.length > 0) {
      var sanDomains = $('#SanExtraDomainsList .ssl__san-domain'),
        sanDomainsForPriceCount = sanDomains.length - product.SanIncluded;
      if (sanDomains.length > 0 && sanDomainsForPriceCount > 0) {
        chosenPrice += (findSanPrice(product, chosenPeriod) * sanDomainsForPriceCount);
        originalSum += (findSanPrice(product, defaultPeriod) * sanDomainsForPriceCount * chosenYear);
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

  function toggleCsrFieldsVisibility() {
    $('#generate-csr-fields, #csr-textarea').toggleClass('hidden');
    $(sslFormId + ' .form-group').removeClass('error');
    $(sslFormId + ' .error__message').remove();

    checkDcvVisibility();
  }
  function changeCsrField(CsrCode) {
    if (CsrCode != '') {
      sendSimplePostRequest(urlSslDecode, addRequestVerificationToken(sslFormId, { "CsrCode": CsrCode }), showDecodedCsr, decodeCsrProgress, decodeCsrError);
    } else {
      $('.ssl__domain').addClass('hidden');
      hideDcvBlock();
    }
  }
  function showConfirmIfCsrFields(domainFieldObj) {
    var domain = domainFieldObj.val().replace('*.', '');
    if (domain !== '' && regexpDomain.test(domain)) {
      showDcvBlock();
    } else {
      if (!regexpDomain.test(domain)) {
        errorMessageAdd($(this), textIncorrectDomain);
      } else {
        errorMessageAdd($(this), textRequired);
      }
      hideDcvBlock();
    }
  }

  function decodeCsrProgress() {
    $('#sslName').parent().addClass('loading loading--full');
  }
  function decodeCsrError() {
    isValidCsr = false;

    $('#sslName').parent().removeClass('loading loading--full');
    $('.ssl__domain, .ssl__send-email').addClass('hidden');

  }
  function showDecodedCsr(data) {
    if (data.Csr != undefined) {
      textCsrInvalid = data.Csr;
    } else {
      isValidCsr = true;
      var domain = data.Domain;

      setTimeout(function () {
        $('#sslName').parent().removeClass('loading loading--full');

        $('#sslDomain-text').text(domain);
        $('#domain-mobile').text(domain);
        $('.ssl__domain').removeClass('hidden');

        showDcvBlock();

        if (sslInitObj.IsWildCard && domain.indexOf('*.') == -1) {
          isValidCsr = false;
          errorMessageAdd(sslCsrCodeInput, textWildcard);
        }

        if (isValidCsr) {
          $('#SendEmail').text('admin@' + getRootDomain(domain));
          $('.ssl__send-email').removeClass('hidden');
        }
      }, 500);
    }
  }

  function showSanDomainsBlock(product) {
    if (product.IsSan) {
      if (product.SanIncluded != null) {
        $("#SanIncluded").text(product.SanIncluded);
        $('.ssl__san-included').removeClass('hidden');
      } else {
        $('.ssl__san-included').addClass('hidden');
      }
      $('#SanMaximum').text(product.SanMaximum);

      updateSSLPrice(product);
      updateSanDomainsCount(product);

      $('#ProductSanPrices').removeClass('hidden');
    } else {
      $('#ProductSanPrices').addClass('hidden');
    }
  }
  function addSanDomainInput(product) {
    var allSanDomains = $('#SanExtraDomainsList .ssl__san-domain');
    if (allSanDomains.length >= product.SanMaximum) {
      errorMessageAdd($('#SanExtraDomainsList'), textNoMoreDomainsAllowed);
    } else {
      var isIncorrectInputs = false;
      allSanDomains.each(function () {
        if ($(this).val() === '') {
          isIncorrectInputs = true;
          $(this).addClass('ssl__san-domain--empty');
        };
      });

      if ($('#SanExtraDomainsList').find(errorElemSelector).length != 0) { isIncorrectInputs = true; }

      if (isIncorrectInputs) {
        if ($('#SanExtraDomainsList').find(errorElemSelector).length == 0) {
          errorMessageAdd($('#SanExtraDomainsList .ssl__san-domain--empty'), textFillDomainBeforeCreateAnother);
        }
      } else {
        allSanDomains.removeClass('ssl__san-domain--empty');

        var extraDomainItemRemove = $('<span/>', {
          class: 'ssl__san-domain-remove form-control-feedback fa fa-remove',
          'title': textDelete,
          click: function () {
            $(this).parent().remove();
            updateSSLPrice(product);
            updateSanDomainsCount(product);
          }
        }),
          extraDomainInput = $('<input/>', {
            'id': 'SanDomains_' + allSanDomains.length,
            'name': 'SanDomains_' + allSanDomains.length,
            class: 'ssl__san-domain form-control input-sm',
            'placeholder': 'domain',
            value: '',
            focusout: function (e) {
              changeSanExtraDomain($(this), product);
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
  function changeSanExtraDomain(input, product) {
    var inputCloseElem = input.parent().find('.ssl__san-domain-remove'),
      domain = input.val();

    errorMessageRemove(input);
    errorMessageRemove(input.parent());

    if (inputCloseElem.is(':active')) {
      inputCloseElem.click();
    } else {
      if (domain == '') {
        errorMessageAdd(input, textRequired);
        return;
      } else {
        if (!checkSanDomainsUnique(input)) {
          showSanDomainsUniqueError();
          return;
        }

        /*
         * If San certificate has Wildcard option we should let client to enter domains in Wildcard notation (*.domain.com).
         * Correct check must be based on if (sslInitObj.IsWildCard), but Goget sends us wildcard=false option for these certificates o_O. Thats why hardcode.
         * hardCodeIdArr - Array of certificate's Id, for which we must let clients be happy
         */
        var hardCodeIdArr = [27, 46, 47];
        if (findInArr(hardCodeIdArr, sslInitObj.Id) !== -1) {
          domain = domain.replace('*.', '');
        }

        if (!regexpDomain.test(domain)) {
          errorMessageAdd(input, textIncorrectDomain);
        }
      }
    }
  }
  function checkSanDomainsUnique(input) {
    var uniqueDomainCount = 0;
    if (sslGotCsr.prop('checked')) {
      if (input.val() == $("#sslDomain-text").text()) { uniqueDomainCount++; }
    } else {
      if (input.val() == $("#Domain").val()) { uniqueDomainCount++; }
    }

    $('#SanExtraDomainsList input').each(function () {
      if ($(this).val() == input.val()) {
        uniqueDomainCount++;
      }
    });
    if (uniqueDomainCount > 1) {
      return false;
    } else {
      return true;
    }
  }
  function showSanDomainsUniqueError() {
    errorElem.clone().text(textSanDomainRepeat).appendTo($('#SanExtraDomainsList'));
    $('#SanExtraDomainsList').click(function () {
      $('#SanExtraDomainsList .error__message:last-child').remove();
    });
  }
  function updateSanDomainsCount(product) {
    var dMax = Number(product.SanMaximum),
      dMaxElem = $('#SanMaximum'),
      dFree = (product.SanIncluded == null) ? 0 : Number(product.SanIncluded),
      dFreeElem = $('#SanIncluded'),
      dCurrentAmount = $('#SanExtraDomainsList .ssl__san-domain').length;

    dMaxElem.text(dMax - dCurrentAmount);
    if (dFree - dCurrentAmount > 0) {
      dFreeElem.text(dFree - dCurrentAmount);
    } else {
      dFreeElem.text(0);
    }

  }
  function sslOrderInit(product) {
    generateYearsSwitch(product);
    showDcvBlock();
    showSanDomainsBlock(product);
    placeInfoBlock();
    updateSSLMobileBlock();
  }

  function checkDcvVisibility() {
    if (sslGotCsr.prop('checked')) {
      sslCsrCodeInput.change();
    } else {
      if (sslDomainInput.val() !== '') {
        sslDomainInput.change();
      } else {
        hideDcvBlock();
        $('#' + dcvApproveBlockId).remove();
        errorMessageAdd((sslGotCsr.prop('checked') ? sslCsrCodeInput : sslDomainInput), 'Некорректное значение поля');
      }
      $('#Country').selectpicker({ 'width': '100%' });
    }
  }
  function setDcvVariants(product) {
    if (product.Vendor !== 'comodo') {
      dcvSelect.find('option').each(function () {
        if (!($(this).val() === '' || $(this).val() == 'Email')) {
          $(this).prop('disabled', true);
          $(this).text($(this).text() + ' (' + textOnlyForComodo + ')');
        }
      });
      if (!(dcvSelect.val() === '' || dcvSelect.val() === 'Email')) {
        dcvSelect.find('option:first').prop('selected', true);
      }
    } else {
      dcvSelect.find('option').each(function () {
        $(this).prop('disabled', false);
        $(this).text($(this).text().replace(' (' + textOnlyForComodo + ')', ''));
      });
    }
  }
  function showDcvBlock() {
    setDcvVariants(sslInitObj);

    if (dcvBlock.find('.dropdown-menu').length > 0) {
      dcvSelect.selectpicker('render');
      if (dcvSelect.val() == "Email") {
        getApproveEmails();
      }
    } else {
      dcvSelect.on('change', function (e, clickedIndex) {
        if ($(this).val() === "Email") {
          getApproveEmails();
        } else {
          $('#' + dcvApproveBlockId).remove();
        }
        checkDcvHttpAvailability();
      }).selectpicker({
        width: '100%'
      });
    }
  }
  function hideDcvBlock() {
    dcvSelect.val('');
    dcvSelect.selectpicker('refresh');
    $('#' + dcvApproveBlockId).remove();
  }
  function getApproveEmails() {
    var domain = (sslGotCsr.prop('checked')) ? $('#sslDomain-text').text() : sslDomainInput.val();

    if (domain === '') {
      errorMessageAdd((sslGotCsr.prop('checked') ? sslCsrCodeInput : sslDomainInput), 'Некорректное значение поля');
      return;
    }

    sendSimplePostRequest(urlSslApproveEmails, addRequestVerificationToken(sslFormId, { "domain": domain }), showApproveEmailsSelect, null, showApproveEmailsError);
  }
  function showApproveEmailsSelect(data) {
    $('#' + dcvApproveBlockId).remove();
    var approverFieldset = $('<div/>', { id: dcvApproveBlockId, class: 'form-group' });
    var approverSelect = $('<select />', {
      id: 'ApproverEmail',
      name: 'ApproverEmail',
      class: 'form-control form-select',
      title: textChooseApproverEmail
    });
    approverSelect.append('<option value="">' + textChooseApproverEmail + '</option>');
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        approverSelect.append('<option value=' + data[i] + '>' + data[i] + '</option>');
      }
    }
    approverFieldset.append(approverSelect).insertAfter(dcvBlock);
    approverSelect.selectpicker({
      width: '100%'
    });
  }
  function showApproveEmailsError(data) {
    console.log('error' + data);
  }

  function checkDcvHttpAvailability() {
    var dcvType = dcvSelect.val();
    var domain = (sslGotCsr.prop('checked')) ? $('#sslDomain-text').text() : sslDomainInput.val();

    $(errorSummarySelector).remove();

    if (domain === '') {
      errorMessageAdd((sslGotCsr.prop('checked') ? sslCsrCodeInput : sslDomainInput), 'Некорректное значение поля');
      return;
    }

    if (dcvType == 'Http' || dcvType == 'Https') {
      var protocol = (dcvType == 'Http') ? 'http://' : 'https://';
      sendPostRequest('#ssl-dcv-block', urlCheckDomainAvailability, { "Domain": domain, "Protocol": protocol }, showDcvHttpWarning);
    }
    return false;
  }
  function showDcvHttpWarning(data) {
    if (data !== 200) {
      var errMsgBlock = $('<div />', {
        class: errorSummaryClass,
        'html': '<p>' + textDcvAvailabilityWarning + '</p>'
      });
      var errMsgBlockClose = $('<span/>', {
        class: 'fa fa-close error__summary-close',
        click: function () {
          $(this).closest(errorSummarySelector).remove();
        }
      });
      errMsgBlock.append(errMsgBlockClose);
      dcvBlock.append(errMsgBlock);
    }
  }

  function placeInfoBlock() {
    if (window.innerWidth > 767) {
      var infoBlock = $('.ssl__cert-info'),
        infoWidth = infoBlock.outerWidth(),
        infoHeight = infoBlock.outerHeight(),
        infoPaddingLeft = infoBlock.css('padding-left'),
        infoOffsetLeft = infoBlock.offset().left,
        formPaddingRight = sslForm.css('padding-right'),
        formBottom = sslForm.outerHeight() + sslForm.offset().top;

      if ($(window).scrollTop() > formBottom - infoHeight - $('.main-header').outerHeight()) {
        infoBlock.css({
          'width': infoWidth,
          'position': 'absolute',
          'top': 'auto',
          'bottom': 0,
          'left': 'auto',
          'right': formPaddingRight,
          'margin-right': '-15px',
          'padding-left': infoPaddingLeft
        });
      } else if ($(window).scrollTop() > sslForm.offset().top) {
        $('.ssl__cert-info').css({
          'position': 'fixed',
          'width': infoWidth,
          'top': $('.main-header').outerHeight() + 15,
          'left': infoOffsetLeft,
          'padding-left': infoPaddingLeft
        });
      }
    }
  }
  /*======================== SCROLL FIXED =======================*/

  $(window).scroll(function () {
    if ($(window).scrollTop() > ($('.ssl__cert-fields').offset().top - $('.main-header').outerHeight())) {
      placeInfoBlock();
    } else {
      $('.ssl__cert-info').removeAttr('style');
    }
    if (window.innerWidth < 768) {
      toggleOcStickyBlock('#ssl-order-mobile', sslFormId);
    }
  });
  $(window).resize(function () {
    placeInfoBlock();
    if (window.innerWidth < 768) {
      toggleOcStickyBlock('#ssl-order-mobile', sslFormId);
    }
  });

  /*======================== DECODE Csr  =======================*/
  sslCsrCodeInput.change(function () {
    changeCsrField($(this).val());
  });

  /*======================== GENERATE Csr  =======================*/
  sslGotCsr.change(function () {
    toggleCsrFieldsVisibility();
  });

  sslDomainInput.change(function () {
    showConfirmIfCsrFields($(this));
  });


  /*======================== ADD SAN DOMAINS  =======================*/
  $('.ssl__san-add-domain').click(function () {
    addSanDomainInput(sslInitObj);
    updateSSLPrice(sslInitObj);
    updateSanDomainsCount(sslInitObj);
  });

  /*======================== ORDER  =======================*/
  $('#ssl-order-form').submit(function (e) {
    e.preventDefault();
    $(sslBtn).trigger('click');
  });

  $(sslMobileBtn).click(function (e) {
    e.preventDefault();
    $(sslBtn).trigger('click');
  });

  $(sslBtn).click(function (e) {
    e.preventDefault();
    if (sslGotCsr.prop('checked')) {
      if (sslCsrCodeInput.val() === '' || !isValidCsr) {
        errorMessageAdd(sslCsrCodeInput, textCsrInvalid);
        return;
      }
    } else {
      checkCsrFieldsEmpty('#generate-csr-fields');
    }

    if (dcvSelect.val() == '') {
      errorMessageAdd(dcvSelect, textRequired);
      return false;
    }

    // Check if user understands how much documents he should prepare
    if (sslInitObj.IsOrganizationValidation && !$('#ssl-confirm-ov-input').prop('checked')) {
      errorMessageAdd($('#ssl-confirm-ov-input'), textRequired);
      return false;
    }

    if ($('#ssl-order-form .error__message').length < 1) {
      reachCounterGoal('sslordercompletefrompage', 'submit');
      sendPostRequest(sslFormId, $(sslFormId).attr('action'), getPostObject(sslInitObj));
    }
  });
});