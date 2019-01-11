var Amount = function (obj, cbIncrease, cbDecrease, customErrFunc) {
  var amount = this,
    btnIncrease = obj.querySelector('.amount__increase'),
    btnDecrease = obj.querySelector('.amount__decrease'),
    input = obj.querySelector('.amount__input'),
    min = Number(input.min),
    max = Number(input.max),
    step = (input.step) ? Number(input.step) : 1,
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
    if (typeof btnIncrease === 'undefined' || typeof btnDecrease === 'undefined') {
      return false;
    } else {
      if (Number(input.value) === min) {
        btnDecrease.disabled = true;
      }
      if (Number(input.value) === max) {
        btnIncrease.disabled = true;
      }

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
    }
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

  this.removeErr = function () {
    if ($(input).parent().next('.amount-tooltip').length > 0) {
      $(input).parent().next('.amount-tooltip').remove();
    }
  };

  this.init();
}

$(function () {

  initMessageForm('#consult-form', null, null, 'consultstoragesent');
  
  $('.amount').each(function () {
    var parentObj = $(this).parent(),
        amount = new Amount(this, countTotalPrice, countTotalPrice);
  });
  var config = {
    calculator: {
      amountBlock: '.amount__wrap',
      amountInput: '.amount__input',
      amountSize: '.amount__size',
      amountPrice: '.amount__price',
      presetItem: '.storage-calculator__config-item',
      summaryPrice: '#summary-price'
    }
  }

  function countTotalPrice() {
    var c = config.calculator;
    totalPrice = 0;

    $(c.amountBlock).each(function () {
      var curName = $(this).attr('id'),
        curPriceObj = priceConfig[curName],
        curSize = Number($(this).find(c.amountInput).val()),
        costPerUnit = findUnitPrice(curPriceObj, curSize),
        summaryPrice = curSize * costPerUnit;
      totalPrice += summaryPrice;
      $('[data-id="' + curName + '"]').find(c.amountSize).text(curSize.toLocaleString('ru-RU'));
      $('[data-id="' + curName + '"]').find(c.amountPrice).text(summaryPrice.toLocaleString('ru-RU'));
      $(c.summaryPrice).text(totalPrice.toLocaleString('ru-RU'));
    });
  };
  function findUnitPrice(obj, val) {
    var priceArr = Object.keys(obj),
      curInterval;
    for (var i = 0; i < priceArr.length; i++) {
      if ((val >= priceArr[i] && val < priceArr[i + 1]) || (val >= priceArr[i] && typeof priceArr[i + 1] === 'undefined')) {
        curInterval = priceArr[i];
        return Number(obj[curInterval])
      }
    }
  }
  countTotalPrice();
  $(config.calculator.presetItem).click(function () {
    setPresetConfig($(this));
  })
  function setPresetConfig(obj) {
    var block = obj.parents(config.calculator.amountBlock),
      curSize = Number(obj.data('size'));
    block.find(config.calculator.amountInput).val(curSize);
    countTotalPrice();
  }
});
// var Amount = function (obj, cbIncrease, cbDecrease, customErrFunc) {