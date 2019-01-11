'use strict';

var Ssl = {
  config: {
    filterFormId: 'ssl-filter',
    containerId: 'ssl',
    listId: 'ssl-table',
    rowSelector: '.ssl__row'
  },
  item: {
    config: {
      actions: {
        sync: {
          url: urlSslSync, // defined in Index view with default certificateId = -1
          elem: document.getElementById('sync-btn'),
          modal: {
            title: 'Обновить данные сертификата',
            introtext: '(Будет произведена синхронизация данных по указанному сертификату с данными GoGet.)',
            btnText: 'Обновить'
          }
        },
        removeKey: {
          url: urlSslRemoveKey, // defined in Index view with default certificateId = -1
          elem: document.getElementById('remove-key-btn'),
          modal: {
            title: 'Удалить приватный ключ',
            introtext: '(После выполнения данной операции будут удалены: приватный ключ и pfx-пароль. Данная операция необратима.)',
            btnText: 'Удалить'
          }
        }
      },
      curAction: ''
    },

    interval: false,
    curCert: {},
    certBlock: document.getElementById('ssl-info'),
    summaryBlock: document.getElementById('ssl-summary'),
    tabsBlock: document.getElementById('detalization-tabs'),
    actionsBlock: document.getElementById('ssl-actions'),
    load: function (id) {
      Ssl.item.certBlock.classList.add('loading', 'loading--full');

      $.get(urlSslLoad.replace('-1', id), function (data) {
        var item = Ssl.item;
        item.curCert = data;
        item.fillCustomerInfo(data);

      }).fail(function (data) {
        console.log('Error loading ssl');
        handleAjaxErrors(data);
        Ssl.item.certBlock.classList.remove('loading', 'loading--full');
      });
    },
    itemTabsConfig: {
      'DcvList': [
        'DomainName', 'StateTitle', 'Type'
      ]
    },
    fillCustomerInfo: function (certInfo) {
      var certBlock = Ssl.item.certBlock,
        tabsBlock = Ssl.item.tabsBlock,
        certPrice = certBlock.querySelector('#ssl-price'),
        actions = Ssl.item.config.actions;
      
      setTimeout(function () {
        // FILL TEXT INFO
        window.util.fillDetalization('ssl-summary', certInfo);
        window.util.fillDetalizationLinks('ssl-summary', certInfo.Links);

        if (certInfo.DcvList.length > 1) {
          window.drawDetalizationTabTables(certInfo, Ssl.item.itemTabsConfig);
          tabsBlock.classList.remove('hidden');
        } else {
          tabsBlock.classList.add('hidden');
        }

        certPrice.removeAttribute('class');
        if (certInfo.Price) {
          certPrice.textContent = certInfo.Price.Amount.toLocaleString();
          certPrice.setAttribute('class', 'price price--' + certInfo.Price.Currency.toLowerCase());
        } else {
          certPrice.textContent = 'Цена не указана';
        }

        // SHOW SYNC BUTTON ONLY FOR CERTIFICATES WITH STATE ACTIVE OR INCOMPLETE
        actions.sync.elem.classList[(certInfo.State === 'Active' || certInfo.State === 'InComplete') ? 'remove' : 'add']('hidden');

        if (actions.removeKey.elem !== null) {
          window.util.setElementVisibility(actions.removeKey.elem, certInfo.HasPrivateKey);
        }

        certBlock.classList.add('main-list__info--active');
        certBlock.classList.remove('loading', 'loading--full');
      }, 100);
    },
    /*
     * Inits all ssl buttons behaviour
     */
    initButtons: function () {
      var config = Ssl.item.config,
        actions = config.actions;

      for (var item in actions) {
        if (actions[item].elem !== null) {
          actions[item].elem.dataset.action = item;
          actions[item].elem.addEventListener('click', function () {
            var action = this.dataset.action;
            Ssl.modal.clear();

            Ssl.modal.fill(config.actions[action], action);
            Ssl.modal.curAction = action;
            $(Ssl.modal.config.mBlock).modal('show');
            Ssl.modal.removeErrors();
          });
        }
      };
    },
    toggleDescription: function () {
      Ssl.item.summaryBlock.classList.toggle('hidden');
    },
  },
  modal: {
    curAction: '',
    config: {
      mFormId: 'ssl-actions-form',
      mForm: document.getElementById('ssl-actions-form'),
      mBlock: document.getElementById('modal-ssl'),
      mTitle: document.getElementById('modal-title'),
      mText: document.getElementById('modal-text'),
      mClose: document.getElementById('modal-close'),
      mSendBtn: document.getElementById('modal-send')
    },
    /*
     * Fills modal window with the information, corresponding to the cliked button
     * @number ticketId - id of a ticket, to which modal is called for
     * @obj action - object of the chosen action
     */
    fill: function (actionObj, actionName) {
      var mConfig = Ssl.modal.config;
      var form = mConfig.mForm;

      mConfig.mTitle.textContent = actionObj.modal.title;
      mConfig.mText.textContent = actionObj.modal.introtext;
      mConfig.mSendBtn.textContent = actionObj.modal.btnText;
      mConfig.mForm.action = actionObj.url.replace('-1', Ssl.item.curCert.Id);
      mConfig.mSendBtn.disabled = false;
      
      $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
        event.preventDefault();
        Ssl.modal.removeErrors();

        sendPostRequest('#' + form.id, form.action, {}, Ssl.modal.onSuccess, Ssl.modal.onFail);
      });
    },
    clear: function () {
      var mConfig = Ssl.modal.config;
      Ssl.item.config.curAction = '';
      Ssl.modal.curAction = '';
    },
    successPopUp: function () {
      var succChild = document.createElement('div'),
        tpl = document.getElementById('success-pop-up'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        succEl = tplContainer.querySelector('div').cloneNode(true),
        blockToShow = document.querySelector('.main-list__panel-body');

      succChild.appendChild(succEl);
      blockToShow.insertBefore(succChild, blockToShow.firstChild);

      setTimeout(function () {
        blockToShow.removeChild(succChild);
      }, 7000);
    },
    onSuccess: function (data, bool) {
      Ssl.item.load(Ssl.item.curCert.Id);
      $(Ssl.modal.config.mBlock).modal('hide');
      Ssl.modal.clear();
      Ssl.modal.successPopUp(bool);
    },
    onFail: function (data) {
      handleAjaxErrors(data, '#' + Ssl.modal.config.mFormId);
      Ssl.modal.addErrorClass();
    },
    removeErrors: function () {
      var errParentBlock = document.getElementById(Ssl.modal.config.mFormId);
      var errChild = errParentBlock.getElementsByClassName(errorSummaryClass);
      while (errChild.length > 0) {
        errChild[0].parentNode.removeChild(errChild[0]);
      }
    },
    addErrorClass: function () {
      var errChild = document.getElementsByClassName(errorSummaryClass);
      if (errChild.length > 0) {
        for (var i = 0; errChild.length > i; i++) {
          errChild[i].classList.add('alert', 'alert-danger');
        }
      }
    }
  },
  init: function () {
    let sslApp = this;
    
    let rows = document.querySelectorAll(this.config.rowSelector);
    [].forEach.call(rows, function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        sslApp.item.load(item.dataset.id);

        [].forEach.call(rows, (el) => {
          el.classList.remove('active');
        })
        item.classList.add('active');
      });
    });

    this.item.initButtons();

    if (rows.length === 1) {
      rows[0].click();
    }
  }
}
Ssl.init();