(function () {
  var Amount = function (elem, obj, cbIncrease, cbDecrease, customErrFunc) {
    var amount = this,
      type = elem.dataset.type,
      btnIncrease = elem.querySelector('.amount__increase'),
      btnDecrease = elem.querySelector('.amount__decrease'),
      input = elem.querySelector('.amount__input'),
      min = (type === 'RAM') ? 1 : obj.min_value,
      max = Number(input.max),
      step = obj.step,
      start = obj.start_value,
      errMsgConfig = {
        max: 'Максимальное значение: ',
        min: 'Миниимальное значение: ',
        closest: 'Ближайшее значение: '
      };
    this.increaseAmount = function () {
      var prevVal = Number(input.value);
      if (prevVal + step > max) {
        return false;
      } else {
        input.value = prevVal + step;
        btnIncrease.disabled = (prevVal + step * 2 > max) ? true : false;
        btnDecrease.disabled = false;

        if (typeof cbIncrease === 'function') {
          cbIncrease();
        }
      }
    };

    this.decreaseAmount = function (prevVal) {
      var prevVal = Number(input.value);
      if (prevVal - step < min) {
        return false;
      } else {
        input.value = prevVal - step;
        btnDecrease.disabled = (prevVal - step * 2 < min) ? true : false;
        btnIncrease.disabled = false;

        if (typeof cbDecrease === 'function') {
          cbDecrease();
        }
      }
    };

    this.init = function () {
      var timeout;
      input.value = start;
      if (typeof btnIncrease === 'undefined' || typeof btnDecrease === 'undefined') {
        return false;
      } else {
        btnDecrease.disabled = (Number(input.value) === min);
        btnIncrease.disabled = (Number(input.value) === max);

        if (typeof customErrFunc === 'function') {
          amount.showError = customErrFunc;
        }

        btnIncrease.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          amount.increaseAmount();
        });

        btnDecrease.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          amount.decreaseAmount();
        });

        input.addEventListener('keyup', function (e) {
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            amount.checkBtn();
            amount.inputChange();
            cbIncrease();
          }, 800)
        });
        $(input).on('change', function (e) {
          e.preventDefault();
          clearTimeout(timeout);
          timeout = setTimeout(function () {
            amount.checkBtn();
            amount.inputChange();
            cbIncrease();
          }, 800)
        });
        amount.setPresetConfig();
      };
    }

    this.checkBtn = function () {
      if (Number(input.value) === min) {
        btnDecrease.disabled = true;
      } else {
        btnDecrease.disabled = false;
      };
      if (Number(input.value) === max) {
        btnIncrease.disabled = true;
      } else {
        btnIncrease.disabled = false;
      };
    };

    this.inputChange = function () {
      input.value = Math.ceil(input.value);
      var curStep = (Number(input.value) - min) / step;
      if (curStep % 1 !== 0) {
        input.value = Math.ceil(curStep) * step + min;
        amount.showError(errMsgConfig.closest + input.value);
      };
      if (Number(input.value) > max) {
        input.value = max;
        amount.showError(errMsgConfig.max + max);
      };
      if (Number(input.value) < min) {
        input.value = min;
        amount.showError(errMsgConfig.min + min);
      };

    };

    this.showError = function (msg) {
      amount.removeErr();
      var parentBlock = $(input).parent();
      $('<span class="amount-tooltip amount-tooltip--active">' + msg + '</span>').hide().insertAfter(parentBlock).fadeIn(400);
      setTimeout(amount.removeErr, 5000);
    };

    this.setPresetConfig = function () {
      var presetBlock = elem.querySelector('[data-preset]');
      if (presetBlock) {
        var items = presetBlock.querySelectorAll('[data-size]');
        [].forEach.call(items, function (el, i) {
          el.addEventListener('click', function () {
            input.value = Number(this.dataset.size);
            input.dispatchEvent(new KeyboardEvent('keyup', { 'keyCode': 13 }));
          });
        });
      };
    };

    this.removeErr = function () {
      if ($(input).parent().next('.amount-tooltip').length > 0) {
        $(input).parent().next('.amount-tooltip').remove();
      }
    };

    this.init();
  };

  var config = {
    calculator: {
      previewBlockSelector: '.calculator-preview__block',
      amountBlock: '.calculator-preview__field',
      amountInput: '.amount__input',
      amountSize: '.amount__size',
      amountPrice: '.amount__price',
      summaryPrice: '#summary-price'
    }
  };

  var exactCalcConfig = getExactConfig();

  if (exactCalcConfig) {
    $(config.calculator.amountBlock).each(function () {
      var obj = exactCalcConfig[$(this).data('type')];

      if (obj) {
        var amount = new Amount(this, obj, countTotalPrice, countTotalPrice)
      } else {
        $(this).remove();
      };

    });
    
    countTotalPrice();
  } else {
    $(config.calculator.previewBlockSelector).remove();
  }

  function countTotalPrice() {
    var c = config.calculator;

    totalPrice = 0;

    $(c.amountBlock).each(function () {
      var curName = $(this).data('type');

      var costPerUnit = (exactCalcConfig[curName]) ? exactCalcConfig[curName].price : '',
        curSize = Number($(this).find(c.amountInput).val()),
        summaryPrice = curSize * costPerUnit;

      totalPrice += summaryPrice;
    });
    $(c.summaryPrice).text(totalPrice.toLocaleString('ru-RU'));
  };

  function getExactConfig() {
    var dcLocation = null;

    for (var dc in calculatorConfig.Initparams) {
      if (calculatorConfig.Initparams[dc].DCLocationTechTitle === calculatorConfig.DefaultValues.Dc) {
        dcLocation = calculatorConfig.Initparams[dc];
        break;
      }
    }

    return (dcLocation) ? dcLocation[calculatorConfig.DefaultValues.Performance] : dcLocation;
  }
})();
