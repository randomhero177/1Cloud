/**
 * Feature for popping alert notices
 * @param {string} message - text to be shown in notice
 * @param {string} type - bootstrap style of alert decoration
 */
var PanelNotice = function (message, type) {

  if (typeof message === 'undefined') {
    throw 'To create notice, you must provide text description';
  }

  var n = this;
  var c = {
    blockClass: 'notices',
    elemClass: 'notices__item',
    elemClassActive: 'notices__item--active',
    elemClassHidden: 'notices__item--hidden',
    elemCloseClass: 'notices__item-close',
    timeout: 10000 // 10 seconds
  }
  this.interval = false;

  this.showNotice = function () {
    var existingBlock = document.querySelector('.' + c.blockClass);
    var isBlockAlreadyCreated = existingBlock !== null;
    var resultBlock = (isBlockAlreadyCreated) ? existingBlock : createBlock();
    var notice = createNotice(resultBlock);

    if (!isBlockAlreadyCreated) {
      document.body.appendChild(resultBlock);
    }

    resultBlock.appendChild(notice);

    setTimeout(function () {
      notice.classList.add(c.elemClassActive);
    }, 200);

    n.interval = setTimeout(function () {
      n.removeNotice(notice, resultBlock);
    }, c.timeout);
  };
  this.removeNotice = function (item, parentBlock) {
    item.classList.add(c.elemClassHidden);
    setTimeout(function () {
      if (item) {
        parentBlock.removeChild(item);
      }
    }, 400);
    clearTimeout(n.interval);
  };

  function createBlock() {
    var block = document.createElement('div');
    block.classList.add(c.blockClass);
    return block;
  }
  function createNotice(parentBlock) {
    var notice = document.createElement('div');
    var close = document.createElement('button');
    var noticeType = (typeof type !== 'undefined') ? type : 'warning';

    notice.className = 'notices__item alert alert-dissmissable';
    notice.classList.add('alert-' + noticeType);
    notice.innerHTML = message;

    close.className = 'notices__item-close close';
    close.innerHTML = '&times;';

    notice.appendChild(close);
    close.addEventListener('click', function () {
      n.removeNotice(notice, parentBlock);
    });

    return notice;
  }

  n.showNotice();
};

/**
 * Feature for inline editing text params, for instance, in tables. Required to place text for editing in additional node (e.g. td > span > text)
 * @param {node} elem - node element to be replaced with input
 * @param {string} text - text to be displayed as a value of new input
 * @param {function} completeHandler - callback function to be performed after clicking OK. Must be defined with one parameter "value" - return of input.value
 */
var InlineEdition = function (elem, text, completeHandler) {
  var inputBlock = this;
  var classes = {
    block: 'instead',
    input: 'instead__input',
    control: 'instead__control'
  };

  this.createBlock = function () {
    var block = document.createElement('div');
    block.classList.add(classes.block);

    block.appendChild(getInput(text));
    block.appendChild(getControl('ok'));
    block.appendChild(getControl('cancel'));

    return block;

    function getInput(value) {
      var input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('maxlength', 256);
      input.classList.add(classes.input);
      input.value = value;

      return input;
    }
    function getControl(type) {
      var control = document.createElement('span');
      control.classList.add(classes.control, classes.control + '--' + type);

      control.addEventListener('click', (type === 'ok') ? inputBlock.complete : inputBlock.close);

      return control;
    }
  };

  this.close = function () {
    var parent = elem.parentNode;
    var block = parent.querySelector('.' + classes.block);

    elem.classList.remove('hidden');
    parent.removeChild(block);
    document.removeEventListener('click', watchClick);
    document.removeEventListener('keydown', watchKeyDown);
  };
  this.complete = function () {
    var parent = elem.parentNode;
    var input = parent.querySelector('.' + classes.input);

    document.removeEventListener('click', watchClick);
    document.removeEventListener('keydown', watchKeyDown);

    if (typeof completeHandler === 'function') {
      completeHandler(input.value);
    }
  };
  this.init = function () {
    var inp = inputBlock;

    if (!elem || !text) {
      var notice = new PanelNotice('Error creating input', 'danger');
      return;
    }

    var parent = elem.parentNode;

    elem.classList.add('hidden');
    parent.appendChild(inp.createBlock());
    setTimeout(function () {
      parent.querySelector('.' + classes.input).focus();
      document.addEventListener('click', watchClick);
      document.addEventListener('keydown', watchKeyDown);
    }, 100);
  };

  this.init();

  function watchClick(e) {
    if (!(e.target.classList.contains(classes.block) || e.target.parentNode.classList.contains(classes.block))) {
      inputBlock.close();
    }
  }
  function watchKeyDown(e) {
    if (e.keyCode === KEYCODE_ENTER) {
      inputBlock.complete();
    }
    if (e.keyCode === KEYCODE_ESC) {
      inputBlock.close();
    }
  }
}

/**
 * Generates confirm block. To show this block you should use inner "show" method. Template for confirm is in View->Shared->Layout
 * @param {object} options - object with init options (required)
 * OPTIONS 
 * @param {string} text - text message to be shown in popup (required)
 * @param {function} cbProceed - callback function, which will fire, when confirm button is pressed.
 * @param {function} cbCancel - callback function, which will fire, when cancel button is pressed.
 * @param {string} title - title for confirm block (default title in template - "confirm action")
 * @param {string} alertText - if you want to show additional decorated text (for instance "This action can not be undone" in alert block)
 * @param {string} alertType - bootstrap type of alert decoration (info, warning, success, danger)
 * @param {boolean} isOnlyProceed - if set to true, button 'Cancel' will be removed
 * @param {string} proceedText - if provided, button 'Proceed' text will be changed
 * @param {string} cancelText - if provided, button 'Cancel' text will be changed
 */
var ConfirmPopup = function (options) {
  if (typeof options === 'undefined') {
    throw new ReferenceError('No confirm object provided!');
  }

  if (typeof options.text !== 'string' || options.text === '') {
    throw new ReferenceError('No appropriate confirm text provided!');
  }

  var c = {
    classBlock: 'confirm',
    classBlockActive: 'confirm--active',
    classInner: 'confirm__inner',
    classTitle: 'confirm__title',
    classAlert: 'confirm__alert',
    classText: 'confirm__text',
    classButtons: 'confirm__buttons',
    classCancel: 'confirm__btn-cancel',
    classProceed: 'confirm__btn-proceed'
  }

  var confirm = this;

  this.options = {
    text: '',
    cbProceed: function () {
      return;
    },
    cbCancel: function () {
      return;
    },
    title: resources.Shared_Confirm_Title,
    alertText: '',
    alertType: 'danger',
    isOnlyProceed: false,
    proceedText: resources.Shared_Confirm,
    cancelText: resources.Shared_Cancel
  };

  this.create = function () {
    var opts = confirm.options;
    var blockElem = document.createElement('div');
    var innerElem = document.createElement('div');
    var titleElem = document.createElement('h3');
    var textElem = document.createElement('p');
    var buttonsElem = document.createElement('div');

    blockElem.classList.add(c.classBlock);
    innerElem.classList.add(c.classInner);
    titleElem.classList.add(c.classTitle);
    textElem.classList.add(c.classText);
    buttonsElem.classList.add(c.classButtons);

    textElem.innerHTML = opts.text;
    titleElem.textContent = opts.title;

    if (!opts.isOnlyProceed) {
      addConfirmBtn();
    }
    addConfirmBtn('proceed');

    innerElem.appendChild(titleElem);
    if (opts.alertText !== '') {
      innerElem.appendChild(getAlertBlock());
    }
    innerElem.appendChild(textElem);
    innerElem.appendChild(buttonsElem);

    blockElem.appendChild(innerElem);

    return blockElem;

    function addConfirmBtn(type) {
      var btn = document.createElement('button');
      var isProceed = type === 'proceed';
      var callback = isProceed ? opts.cbProceed : opts.cbCancel;

      btn.setAttribute('type', 'button');
      btn.setAttribute('class', isProceed ? 'btn btn-primary confirm__btn confirm__btn-proceed' : 'btn btn-default confirm__btn confirm__btn-cancel');
      btn.textContent = isProceed ? opts.proceedText : opts.cancelText;
      
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        confirm.close();

        if (typeof callback === 'function') {
          callback();
        }
      });

      buttonsElem.appendChild(btn);
    }

    function getAlertBlock() {
      var alertElem = document.createElement('div');
      alertElem.classList.add(c.classAlert, 'alert', 'alert-' + opts.alertType);
      alertElem.innerHTML = opts.alertText;

      return alertElem;
    }
  };

  this.show = function () {
    var block = confirm.create();

    document.body.appendChild(block);
    setTimeout(function () {
      block.classList.add(c.classBlockActive);
    }, 100);

    document.addEventListener('click', watchClickOuter);
  };

  this.close = function () {
    var block = document.querySelector('.' + c.classBlockActive);

    if (block) {
      block.classList.remove(c.classBlockActive);
      setTimeout(function () {
        document.body.removeChild(block);
      }, 400);
    }

    document.removeEventListener('click', watchClickOuter);
  };

  function watchClickOuter(e) {
    if (e.target.classList.contains(c.classBlock)) {
      confirm.close();
    }
  }
  function setOptions(newOptions) {
    Object.keys(newOptions).forEach(function (key) {
      if (typeof newOptions[key] === typeof confirm.options[key]) {
        confirm.options[key] = newOptions[key];
      }
    });
  }

  setOptions(options);
  this.show();
};

/**
 * Constructor for increase/decrease element. Must have html-structure like in "OnceCloud.Web.Panel\Views\UnocCompany\Create.cshtml"
 * Requires jQuery
 * @param {node} obj - DOM object of amount block
 * @param {function} cbIncrease - callback function for clicking on increase button (optional)
 * @param {function} cbDecrease - callback function for clicking on decrease button (optional)
 * @param {function} customErrFunc - extra function for handling error cases (optional)
 */
var Amount = function (obj, cbIncrease, cbDecrease, customErrFunc) {
  var amount = this,
    btnIncrease = obj.querySelector('.amount__increase'),
    btnDecrease = obj.querySelector('.amount__decrease'),
    input = obj.querySelector('.amount__input'),
    min = Number(input.min),
    max = Number(input.max),
    step = (input.step) ? Number(input.step) : 1,
    errMsgConfig = {
      max: resources.Shared_MaxValue + ': ',
      min: resources.Shared_MinValue + ': ',
      closest: resources.Shared_ClosestValue + ': '
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