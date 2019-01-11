$(function () {
  var payForm = $('.pay-form'),
    paySumInput = payForm.find('[name="CurrentPayment"]'),
    autoCheckbox = payForm.find('[name="IsRegular"]'),
    payFormInvoice = $('#pay-legal form');

  /*$('#add-money-tabs').tabs({
    active: ($('#add-money-tabs').find('.tabs-buttons li.active').index() == -1) ? 0 : $('#add-money-tabs').find('.tabs-buttons li.active').index(),
  });*/
  toggleAutoPaymentVisibility(autoCheckbox);

  var defaultObj = {};
  defaultObj.money = {
    IsRegular: (autoCheckbox.length > 0) ? autoCheckbox.prop('checked') : false,
    CurrentPayment: Number(paySumInput.val()),
    paymentMethod: 0
  };

  $('.add-money__methods-item').click(function (e) {
    e.preventDefault();
    setActivePaymentBlock($(this));
  });

  /******** TOGGLE FUNCTIONS *********/
  $('#pay-extra-trigger').click(function (e) {
    e.preventDefault();
    $('.pay__item--extra').toggleClass('hidden');
    $(this).addClass('hidden pay__all-items');
  });

  $('.pay__item--paymaster').click(function (e) {
    e.preventDefault();

    defaultObj.money.paymentMethod = Number($(this).attr('data-payment-method'));
    paySumInput.attr('class', '').addClass('pay__item--' + $(this).attr('data-payment-method').toLowerCase());
    $('#pay-list, #pay-sum').toggleClass('hidden');
  });

  $('.back-to-paysystems').click(function (e) {
    e.preventDefault();
    $(this).parents('.pay__form-block').toggleClass('hidden');
    if (!$('#pay-extra-trigger').hasClass('pay__all-items')) {
      $('#pay-extra-trigger').removeClass('hidden');
    }
  });


  $('.js-payPallForm').click(function (e) {
    e.preventDefault();
    $(this).toggleClass('hidden');
    $(this).parent().find('.pay__item--paypal').toggleClass('hidden');
  });

  function setActivePaymentBlock(linkObj) {
    var links = $('.add-money__methods-item');
    var blocks = $('.add-money__methods-details');

    links.removeClass('active');
    blocks.removeClass('active');

    linkObj.addClass('active');
    $(linkObj.attr('href')).addClass('active');
  }

  /******** AUTOPAYMENT PART *********/

  if (autoCheckbox.length > 0) {
    //   toggleAutoPaymentVisibility();

    autoCheckbox.change(function (e) {
      toggleAutoPaymentVisibility(this);
    });

    $('#pay-auto-input').tooltip({
      content: function () {
        return $(this).prop('title');
      },
      position: {
        my: "left top",
        at: "left bottom+20",
        using: function (position, feedback) {
          $(this).css(position);
          $("<div>")
            .addClass("arrow-box")
            .addClass(feedback.vertical)
            .addClass(feedback.horizontal)
            .appendTo(this);
        }
      }
    });
  }

  function toggleAutoPaymentVisibility(item) {
    var parentBlock = $(item).parents('.pay-form');
    if ($(item).prop('checked')) {
      parentBlock.find('.pay-auto-block').removeClass('hidden');
      parentBlock.find('.pay-auto-input').removeAttr('disabled');
      $('#pay-individ').addClass('setHeight');
    } else {
      parentBlock.find('.pay-auto-block').addClass('hidden');
      parentBlock.find('.pay-auto-input').attr('disabled', 'disabled');
    }
  }


  /******** YANDEX CASE *********/
  $('.add-money-yandex-btn').click(function (e) {
    e.preventDefault();
    let form = $(e.target).closest('form');
    let paySumInput = form.find('[name="sum"]');
    let paySum = parseInt(paySumInput.val());

    if (isNaN(paySum)) {
      errorMessageAdd(paySumInput, resources.Billing_AddMoney_Amount_Incorrect);
      return;
    }

    paySumInput.val(paySum);

    if (paySum < minPay.gateway) {
      errorMessageAdd(paySumInput, resources.Billing_AddMoney_Amount_Less_Min + minPay.gateway + ' ' + resources.curCurrency);
      return;
    }

    form.submit();
  });

  /******** BITCOIN PART *********/
  $('[data-toggle="tooltip"]').tooltip();

  var bitcoinInput = document.getElementById('add-money-bitcoin-input');
  var bitcoinSpan = document.getElementById('add-money-bitcoin-convert');
  if (bitcoinInput !== null && bitcoinInput.value !== '') {
    convertBitcoin(bitcoinInput, bitcoinSpan);
  }

  $(bitcoinInput).on('keyup change', function () {
    convertBitcoin(this, bitcoinSpan);
  });
  $('#add-money-bitcoin-form').submit(function (e) {
    e.preventDefault();
    let form = e.target;
    let paySumInput = form.querySelector('[name="Amount"]');
    let payGatewayId = form.querySelector('[name="PaymentGatewayID"]');

    if (isSumInputValidated(paySumInput, minPay.gateway)) {
      sendAjaxRequest('#' + form.id, form.action, { 'Amount': getFloatFromString(paySumInput.value), 'PaymentGatewayID': payGatewayId.value });
    }
  });


  function getFloatFromString(string) {
    let number = parseFloat(string.replace(',', '.'));
    return (isNaN(number)) ? 0 : number;
  }
  function convertBitcoin(input, displaySpan) {
    var value = getFloatFromString(input.value),
      rate = (getFloatFromString(input.dataset.rate)) ? getFloatFromString(input.dataset.rate) : 1,
      sum = (value / rate).toFixed(8);

    displaySpan.textContent = sum;
    displaySpan.classList[(+sum > 0) ? 'remove' : 'add']('hidden');
  }

  function isSumInputValidated(input, min) {
    let paySum = getFloatFromString(input.value);

    if (!paySum) {
      errorMessageAdd($(input), resources.Billing_AddMoney_Amount_Incorrect);
      return false;
    }

    $(input).val(paySum);

    if (paySum < min) {
      errorMessageAdd($(input), resources.Billing_AddMoney_Amount_Less_Min + min + ' ' + resources.curCurrency);
      return false;
    }

    return true;
  }

  /********* CALCULATE AND SHOW BONUS INFORMATION *********/
  var bonusBlocks = $('.js-bonus-block'),
    paymentLegalInput = $('.payment-legal #Amount');

  if (payFormInvoice.length) {
    payFormInvoice.submit(function (e) {
      if (parseInt(paymentLegalInput.val()) < minPay.invoice) {
        e.preventDefault();
        errorMessageAdd(paymentLegalInput, resources.minPaymentInvoice);
      }
    });
  };

  bonusBlocks.each(function () {
    var bonusInput = $(this).find('.js-bonus-amount'),
      paymentInput = $(this).find('.js-payment-amount');

    calculateBonus(bonusInput, paymentInput);
  });

  function calculateBonus($bonusInput, $paymentInput) {
    /*
     * Returns corrresponding value of percent for bonus for a concrete sum // Variable bonusObj is defined in AddMoney.cshtml
     * @number sum - client's desirable payment sum
     */
    function getPercentValue(sum) {
      var percent = 0,
        bonusArr = bonusObj.BonusScale;

      if (sum >= bonusArr[0].MinAmount) {
        for (var i = 0; i < bonusArr.length; i++) {
          if (sum >= bonusArr[i].MinAmount && sum < bonusArr[i].MaxAmount) {
            percent = bonusArr[i].Percent;
            break;
          }
        }
      }
      return percent;
    }

    function setBonusAmount() {
      var payment = parseInt($paymentInput.val());
      var bonus = (isNaN(payment) ? 0 : payment * getPercentValue(payment) / 100);

      if (modelAddMoney.IsHappyNewYearBonus && payment >= modelAddMoney.HappyNewYearMinAmount) {
        bonus = (bonus > modelAddMoney.HappyNewYearMaxBonus) ? bonus : modelAddMoney.HappyNewYearMaxBonus;
      }

      $bonusInput.text(bonus);
      $bonusInput.parent()[(+bonus > 0) ? 'removeClass' : 'addClass']('hidden');
    }

    if ($bonusInput.length && $paymentInput.length && typeof bonusObj !== 'undefined') {

      setBonusAmount();
      $paymentInput.on('keyup change', setBonusAmount);
    }
  };

  /******** INVOICES PART *********/
  var nextInvoiceFormSelector = '#create-next-invoice-form',
    nextInvoiceForm = $(nextInvoiceFormSelector),
    amountField = nextInvoiceForm.find('[name="InvoiceAmount"]');

  checkDecimal(amountField, ',')
  if (nextInvoiceForm.length > 0) {
    nextInvoiceForm.submit(function (e) {
      e.preventDefault();

      if (amountField.val() === '') {
        errorMessageAdd(amountField, resources.Shared_Required);
        return;
      }

      sendAjaxRequest(nextInvoiceFormSelector, nextInvoiceForm.attr('action'), {
        InvoiceAmount: amountField.val()
      });
    });
  }

  /******** PROMISED PAYMENT PART *********/
  var promisedBlockSelector = '#promised-block',
    promisedBtn = $('#promised-btn'),
    promisedSum = $('#promised-sum');

  checkDecimal(promisedSum, ',')
  if (promisedBtn) {
    promisedBtn.click(function (e) {
      e.preventDefault();

      let confirm = new ConfirmPopup({
        text: resources.Billing_AddMoney_Promised_Activate,
        cbProceed: function () {
          sendAjaxRequest(promisedBlockSelector, promisedBtn.data('url-activate'), {}, cbSuccessPromised);
        }
      });
    });

    function cbSuccessPromised(response) {
      let notice = new PanelNotice(resources.Billing_AddMoney_Promised_Success, 'success');

      $('.addmoney-promised__already').html(resources.Billing_AddMoney_Promised_AlreadyExist.replace('defaultDebitDate', response.DebitDate));
      $('#promised-sum').html(response.AmountToDisplay);
      promisedBtn.remove();
    }
  }


  /************ Individual Payments Tab  *****************/
  var IndividualPay = {
    config: {
      autopaymentModal: '#autopayment-modal',
      cryptForm: '#pay-form-cloudpayment',
      tokenForm: '#token-pay-form',
      tokenBtnId: '#token-btn',
      bePaidForm: '#pay-form-bePaid',
      paymasterForm: '#add-paymaster-form',
      removeCardBtn: '.add-money__remov-btn',
      savedCardRow: '.add-money__saved-row',
      savedCardsList: '#saved-cards-list',
      newCardRadio: '#dont-use-saved[type="radio"]',
      disableAutopayForm: '#disable-autopayment-form',
      disableAutopayCheckbox: '#confirm-disable-autopayment',
      editAutopaymentForm: '#edit-autopayment-form',
      autopaymentFormCloud: '#add-autopay-cloud',
      autopaymentFormBePaid: '#add-autopay-bePaid',
      addAutopaymentPaymaster: '#add-autopay-paymaster',
      cardNumber: '#card-number-real',
      cardNumberFake: '#card-number-fake',
      cardHolderSelector: '.add-money__cloudform-holder',
      cardCvvSelector: '.add-money__card-cvv',
      autoCardNumber: '#autopayment-real-card',
      autoCardNumberFake: '#autopayment-fake-card'
    },
    crypt: {
      Cloudpayment: {
        createCryptogram: function (publicId, formId) {
          var checkout = new cp.Checkout(publicId, document.getElementById(formId));
          var result = checkout.createCryptogramPacket();

          if (result.success) {
            // сформирована криптограмма
            return result.packet
          }
          else {
            // найдены ошибки в введённых данных, объект `result.messages` формата: 
            // { name: "В имени держателя карты слишком много символов", cardNumber: "Неправильный номер карты" }
            // где `name`, `cardNumber` соответствуют значениям атрибутов `<input ... data-cp="cardNumber">`
            for (var msgName in result.messages) {
              errorMessageAdd($('#' + formId + ' [data-cp="' + msgName + '"]'), result.messages[msgName])
            }
          }
        },
        getPostObj: function ($form) {
          var c = IndividualPay.config,
            obj = {};

          obj.CardCryptogram = IndividualPay.crypt.Cloudpayment.createCryptogram($form.data('public-id'), $form.attr('id'));
          obj.Amount = IndividualPay.helpers.formatNumber($form.find('.add-money__cloudform-amount').val());
          obj.PaymentGatewayId = $form.find('.add-money__cloudform-gateway').val();

          return obj;
        }
      },
      BePaid: {
        getPostObj: function ($form) {
          var obj = {};
          
          begateway.encrypt($form.attr('id'));

          obj.PaymentGatewayId = $form.find('.add-money__cloudform-gateway').val();
          obj.Amount = $form.find('.add-money__cloudform-amount').val();
          obj.Cryptogram = getCryptogramObj();

          return obj;

          function getCryptogramObj() {
            return {
              Number: $form.find('[name="encrypted_number"]').val(),
              Holder: $form.find('[name="encrypted_holder"]').val(),
              ExpMonth: $form.find('[name="encrypted_exp_month"]').val(),
              ExpYear: $form.find('[name="encrypted_exp_year"]').val(),
              VerificationValue: $form.find('[name="encrypted_verification_value"]').val()
            }
          }
        }
      }
    },
    addMoney: {
      Paymaster: function () {
        var form = $('.pay-form');
        form.submit(function (e) {
          e.preventDefault();
          e.stopPropagation();
          var curForm = $(this),
            paySumInput = curForm.find('[name="CurrentPayment"]'),
            paySum = Math.floor(Number(paySumInput.val()));

          if (paySum < minPay.gateway) {
            errorMessageAdd(paySumInput, resources.Billing_AddMoney_Amount_Incorrect);
          } else {
            defaultObj.money.CurrentPayment = paySum;
            sendAjaxRequest('#' + curForm.attr('id'), curForm.attr('action'), getPaymentObj());
          };

          function getPaymentObj() {
            var obj = {};
            obj.CurrentPayment = paySum;
            obj.PaymentGatewayID = Number(curForm.find('[name="PaymentGatewayID"]').val());
            obj.TypePaymentMethod = curForm.find('[name="TypePaymentMethod"]').val();
            obj.Currency = curForm.find('[name="Currency"]').val();

            return obj;
          }
        });
      },
      Cloudpayment: function ($form) {
        var c = IndividualPay.config;
        var h = IndividualPay.helpers;

        var $sumInput = $form.find('.add-money__cloudform-amount'),
          $monthInput = $form.find('[data-cp="expDateMonth"]'),
          $yearInput = $form.find('[data-cp="expDateYear"]'),
          $storeCard = $form.find('#store-card');

        var values = {};

        h.cardNumber($(c.cardNumberFake), $(c.cardNumber));
        h.autofocusInit($form);

        $form.submit(function (e) {
          e.preventDefault();

          if (h.validatePaymentSum($sumInput) && h.validateCardExpired($monthInput, $yearInput) && h.validateCardNumber($(c.cardNumber))) {

            values.cardNumber = $(c.cardNumber).val();
            values.holder = $form.find(c.cardHolderSelector).val();
            values.expDateMonth = $monthInput.val();
            values.expDateYear = $yearInput.val();
            values.cvv = $form.find(c.cardCvvSelector).val();

            var obj = IndividualPay.crypt.Cloudpayment.getPostObj($form);

            if ($storeCard.length > 0) {
              obj.StoreCard = $storeCard.prop('checked');
            }

            if (obj.CardCryptogram) {
              sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), obj, null, function () {
                IndividualPay.helpers.restoreCardValues($form, values);
              });
            }
          }
        });
      },
      BePaid: function ($form) {
        var c = IndividualPay.config;
        var h = IndividualPay.helpers;

        var $sumInput = $form.find('.add-money__cloudform-amount'),
          $monthInput = $form.find('[data-encrypted-name="encrypted_exp_month"]'),
          $yearInput = $form.find('[data-encrypted-name="encrypted_exp_year"]'),
          $storeInput = $form.find('#store-card');

        var inputValues = {};

        h.cardNumber($(c.cardNumberFake), $(c.cardNumber));
        h.autofocusInit($form);
        
        $form.submit(function (e) {
          e.preventDefault();

          if ($yearInput.val().length !== 4){
            errorMessageAdd($yearInput, resources.Billing_Card_Need_Full_Year);
            return;
          }

          if (h.validatePaymentSum($sumInput) && h.validateCardExpired($monthInput, $yearInput) && h.validateCardNumber($(c.cardNumber))) {

            inputValues.cardNumber = $(c.cardNumber).val();
            inputValues.holder = $form.find(c.cardHolderSelector).val();
            inputValues.expDateMonth = $monthInput.val();
            inputValues.expDateYear = $yearInput.val();
            inputValues.cvv = $form.find(c.cardCvvSelector).val();

            var obj = IndividualPay.crypt.BePaid.getPostObj($form);

            if ($storeInput.length > 0) {
              obj.StoreCard = $storeInput.prop('checked');
            }

            if (obj.Cryptogram.Number) {
              sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), obj, null, function () {
                var $encryptedElements = $form.find('[name*="encrypted_"]');

                $encryptedElements.each(function () {
                  $(this).remove();
                });
                IndividualPay.helpers.restoreCardValues($form, inputValues);
              });
            }
          }
        });
      },

      addTokenTransaction: function ($form) {
        var c = IndividualPay.config;

        $form.submit(function (e) {
          e.preventDefault();
          submitTokenForm();
        });

        function submitTokenForm() {
          var $curCard = $('.add-money__saved-control:checked');

          obj = {};
          obj.Amount = IndividualPay.helpers.formatNumber($form.find('[name="Amount"]').val());
          obj.BankCardId = $curCard.parents(c.savedCardRow).data('cardid');

          sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), obj);
        }
      },

      init: function () {
        var c = IndividualPay.config;
        var a = IndividualPay.addMoney;

        var $formPaymaster = $(c.paymasterForm);
        var $formCloudpayment = $(c.cryptForm);
        var $formBePaid = $(c.bePaidForm);
        var $formToken = $(c.tokenForm);

        if ($formPaymaster.length > 0) {
          a.Paymaster();
        }
        if ($formCloudpayment.length > 0) {
          a.Cloudpayment($formCloudpayment);
        }
        if ($formBePaid.length > 0) {
          a.BePaid($formBePaid);
        }

        // If saved card - add cards choice
        if ($formToken.length > 0) {
          a.addTokenTransaction($formToken);
        }
      }
    },
    autopay: {
      Cloudpayment: function ($form) {
        var c = IndividualPay.config;
        var h = IndividualPay.helpers;
        var $modal = $(c.autopaymentModal);
        var $sumInput = $form.find('.add-money__autopayment-amount'),
          $monthInput = $form.find('[data-cp="expDateMonth"]'),
          $yearInput = $form.find('[data-cp="expDateYear"]');

        h.cardNumber($(c.autoCardNumberFake), $(c.autoCardNumber));
        h.autofocusInit($form);

        $form.submit(function (e) {
          e.preventDefault();

          if (h.validatePaymentSum($sumInput) && h.validateCardExpired($monthInput, $yearInput) && h.validateCardNumber($(c.autoCardNumber))) {
            var obj = IndividualPay.crypt.Cloudpayment.getPostObj($form);

            if (obj.CardCryptogram) {
              sendAjaxRequest($form.attr('id'), $form.attr('action'), obj, function () {
                location.reload();
              });
            };
          }
        });

        $modal.on('hidden.bs.modal', resetValues);

        function resetValues() {
          var $errors = $form.find('.' + errorClass);
          var $errorsParents = $form.find('.error');

          $form[0].reset();
          $errors.each(function () {
            $(this).remove();
          });
          $errorsParents.each(function () {
            $(this).removeClass('error');
          });
        }
      },
      BePaid: function ($form) {
        var c = IndividualPay.config;
        var h = IndividualPay.helpers;
        var $modal = $(c.autopaymentModal);

        var $sumInput = $form.find('.add-money__autopayment-amount'),
          $monthInput = $form.find('[data-encrypted-name="encrypted_exp_month"]'),
          $yearInput = $form.find('[data-encrypted-name="encrypted_exp_year"]');

        h.cardNumber($(c.autoCardNumberFake), $(c.autoCardNumber));
        h.autofocusInit($form);

        $form.submit(function (e) {
          e.preventDefault();

          if ($yearInput.val().length !== 4) {
            errorMessageAdd($yearInput, resources.Billing_Card_Need_Full_Year);
            return;
          }

          if (h.validatePaymentSum($sumInput) && h.validateCardExpired($monthInput, $yearInput) && h.validateCardNumber($(c.autoCardNumber))) {
            begateway.encrypt($form.attr('id'));

            var obj = IndividualPay.crypt.BePaid.getPostObj($form);

            if (obj.Cryptogram.Number) {
              sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), obj,function () {
                location.reload();
              });
            }
          }
        });

        $modal.on('hidden.bs.modal', resetValues);

        function resetValues() {
          var $errors = $form.find('.' + errorClass);
          var $errorsParents = $form.find('.error');

          $form[0].reset();
          $errors.each(function () {
            $(this).remove();
          });
          $errorsParents.each(function () {
            $(this).removeClass('error');
          });
        }
      },
      Paymaster: function () {
        var c = IndividualPay.config;

        $(c.addAutopaymentPaymaster).submit(function (e) {
          e.preventDefault();
          var obj = {};

          obj.PaymentGatewayId = $(c.addAutopaymentPaymaster).find('[name="PaymentGatewayId"]').val();
          obj.MonthLimit = $(c.addAutopaymentPaymaster).find('[name="MonthLimit"]').val();
          obj.Amount = IndividualPay.helpers.formatNumber($(c.addAutopaymentPaymaster).find('[name="Amount"]').val());

          sendAjaxRequest(c.addAutopaymentPaymaster, $(c.addAutopaymentPaymaster).attr('action'), obj, function () {
            location.reload();
          });
        });
      },
      edit: function () {
        var c = IndividualPay.config,
          $form = $(c.editAutopaymentForm);

        $form.submit(function (e) {
          e.preventDefault();
          var amount = IndividualPay.helpers.formatNumber($form.find('[name="Amount"]').val());

          sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), { Amount: amount }, function () {
            location.reload();
          });
        });
      },
      disable: function () {
        var c = IndividualPay.config,
          $form = $(c.disableAutopayForm),
          btn = $form.find('[type="submit"]'),
          checkbox = $(c.disableAutopayCheckbox);

        checkbox.on('change', function (e) {
          btn.prop('disabled', !$(this).prop('checked'));
        });

        $form.submit(function (e) {
          e.preventDefault();
          var obj = {};

          obj.PaymentGatewayId = $('[name="PaymentGatewayId"]').val();
          obj.PaymentGatewayType = $('[name="PaymentGatewayType"]').val();
          sendAjaxRequest('#' + $form.attr('id'), $form.attr('action'), obj, function () {
            location.reload();
          })
        });
      },
      init: function () {
        var c = IndividualPay.config;

        var $formCloud = $(c.autopaymentFormCloud),
          $formBePaid = $(c.autopaymentFormBePaid);
        
        IndividualPay.autopay.Paymaster();

        if ($formCloud.length > 0) {
          IndividualPay.autopay.Cloudpayment($formCloud);
        }

        if ($formBePaid.length > 0) {
          IndividualPay.autopay.BePaid($formBePaid);
        }

        IndividualPay.autopay.edit();
        IndividualPay.autopay.disable();
      }
    },
    helpers: {
      autofocusInit: function ($form) { // Inits autofocus on year, cvv fields, when previous field is filled
        var $monthField = $form.find('.add-money__card-month');
        var $yearField = $form.find('.add-money__card-year');
        var $cvvField = $form.find('.add-money__card-cvv');

        $monthField.on('input', function () {
          if ($(this).val().length === Number($(this).attr('maxlength'))) {
            $yearField.focus();
          }
        });

        $yearField.on('input', function () {
          if ($(this).val().length === Number($(this).attr('maxlength'))) {
            $cvvField.focus();
          }
        });
      },
      restoreCardValues: function ($form, values) {
        for (var field in values) {
          $form.find('[data-restore="' + field + '"]').val(values[field]);
        }
      },
      savedCardsVisibility: function () {
        var c = IndividualPay.config,
          $elems = $(c.savedCardRow).find('input[type="radio"]'),
          $newCardEl = $(c.savedCardRow).find('#dont-use-saved[type="radio"]'),
          $amountInput = $('.add-money__cloudform-amount'),
          $amountTokenInput = $('.add-money__cloudform-token-amount');

        if ($elems.length > 0) {
          $elems.change(function (e) {
            var isNewCard = $newCardEl.prop('checked');

            $elems.parents(c.savedCardRow).removeClass('add-money__saved-row--active');
            $(this).parents(c.savedCardRow).addClass('add-money__saved-row--active');

            $('[data-visible="cryptogram"]')[(isNewCard) ? 'removeClass' : 'addClass']('hidden');
            $('[data-visible="token"]')[(isNewCard) ? 'addClass' : 'removeClass']('hidden');

            // for actual bonus information
            $amountInput.keyup();
            $amountTokenInput.keyup();
          });

          $amountInput.change(function () {
            $amountTokenInput.val($amountInput.val());
          });
          $amountTokenInput.change(function () {
            $amountInput.val($amountTokenInput.val());
          });
        }
      },
      removeCard: function () {
        var c = IndividualPay.config;

        $(c.removeCardBtn).click(function () {
          var curRow = $(this).parents(c.savedCardRow),
            curId = curRow.data('cardid');

          var confirm = new ConfirmPopup({
            text: 'Подтвердите удаление карты из сохраненных',
            cbProceed: function () {
              sendAjaxRequest(c.savedCardsList, $(c.savedCardsList).data('action'), { CardId: curId }, function (data) {
                curRow.remove();

                var $rows = $(c.savedCardsList).find(c.savedCardRow);
                var $newActiveRadio = $(c.newCardRadio);

                if ($rows.length > 0) {
                  $newActiveRadio = $rows.find('[type="radio"]').eq(0);
                }

                $newActiveRadio.prop('checked', true).trigger('change');

                var notice = new PanelNotice('Карта успешно удалена из сохранённых', 'success');

              }, null, 'DELETE');
            }
          });
        })
      },
      cardNumber: function (fakeCardElem, realCardElem) {
        var c = IndividualPay.config,
          prevLength = 0;

        fakeCardElem.keyup(function () {
          var value = $(this).val();
          var cleanValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

          realCardElem.val(cleanValue);
          $(this).val(cc_format(cleanValue));

          if (realCardElem.parent().find('.' + errorClass).length > 0) {
            errorMessageRemove(realCardElem);
          };
        });

        function cc_format(value) {
          var matches = value.match(/\d{4,19}/g);
          var match = matches && matches[0] || '';
          var parts = [];

          for (i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
          }

          return (parts.length) ? parts.join(' ') : value;
        }
      },
      formatNumber: function (num) {
        var cFormat = numberCulture.CurrencyDecimalSeparator,
          fixedNumber = (cFormat == ',') ? num.replace('.', ',') : num.replace(',', '.');

        return fixedNumber;
      },
      validatePaymentSum: function ($sumInput) {
        var paySum = $sumInput.val();

        if (isNaN(paySum)) {
          errorMessageAdd($sumInput, resources.Billing_AddMoney_Amount_Incorrect);
          return false;
        }

        if (paySum < minPay.gateway) {
          errorMessageAdd($sumInput, resources.Billing_AddMoney_Amount_Less_Min + minPay.gateway + ' ' + resources.curCurrency);
          return false;
        }

        return true;
      },
      validateCardNumber: function ($cardInput) {
        var cardNumber = $cardInput.val();
        var isCardNumberValid = getLuhnResult(cardNumber);

        if (!isCardNumberValid) {
          errorMessageAdd($cardInput, resources.Billing_Card_Incorrect_Card_Number );
        }

        return isCardNumberValid;

        function getLuhnResult(cardNumberString) {
          var sum = 0;

          for (var i = 0; i < cardNumberString.length; i++) {
            var cardNum = parseInt(cardNumberString[i]);

            if ((cardNumberString.length - i) % 2 === 0) {
              cardNum = cardNum * 2;

              if (cardNum > 9) {
                cardNum = cardNum - 9;
              }
            }

            sum += cardNum;
          }

          return sum % 10 === 0;
        }
      },
      validateCardExpired: function ($monthInput, $yearInput) {
        var now = new Date();
        var month = Number($monthInput.val());
        var year = $yearInput.val();
        var yearFixed = (year.length === 2) ? '20' + year : year;
        var expDate = new Date(Number(yearFixed), month);

        if (month > 12 || month < 1) {
          errorMessageAdd($monthInput, resources.Billing_Card_Incorrect_Month);
          return false;
        }

        if (now >= expDate) {
          errorMessageAdd($monthInput, resources.Billing_Card_Expired);
          return false;
        }

        return true;
      },

    },
    init: function () {
      var c = IndividualPay.config;

      IndividualPay.addMoney.init();
      IndividualPay.autopay.init();
      IndividualPay.helpers.savedCardsVisibility();
      IndividualPay.helpers.removeCard();
    }
  };

  IndividualPay.init();
});
