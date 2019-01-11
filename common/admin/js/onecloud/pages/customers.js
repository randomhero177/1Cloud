'use strict';

var Customers = {
  config: {
    filterFormId: 'customers-filter',
    customersContainerId: 'customers',
    customersListId: 'customers-table',
    customersListUrl: 'list'
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Customers.item.curCustomer = {};
      Customers.item.customerBlock.classList.remove('main-list__info--active');
      Customers.list.load();
    },
    init: function () {
      Customers.filter.obj = new Filter(Customers.config.filterFormId, Customers.filter.submit);
      Customers.filter.obj.init();
    }
  },
  list: {
    /*
     * Loads customers list due to filter values
     */
    load: function () {
      $.get(window.util.makeCorrectUrl(Customers.config.customersListUrl), Customers.filter.obj.getFilterObj(), function (data) {
        Customers.list.drawCustomersList(data);
      }).fail(function (data) {
        handleAjaxErrors(data);
        console.log('Error getting customers');
      });
    },
    /*
     * Draw customers table due to server's response
     * @obj data - object from server with customers object list
     */
    drawCustomersList: function (data) {

      var container = document.getElementById(Customers.config.customersContainerId),
        table = document.getElementById(Customers.config.customersListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.customers__row-list');

      container.parentNode.classList.add('loading', 'loading--full');
      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            list.appendChild(Customers.list.drawSingleCustomer(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');

          if (data.length === 1) {
            Customers.item.load(data[0].CustomerId);
            list.firstChild.classList.add('active');
          }
        } else {
          table.classList.add('hidden');
          noResults.classList.remove('hidden');
        }

        container.parentNode.classList.remove('loading', 'loading--full');
      }, 400);

    },
    /*
        * Returns DOM object of a single customer item
        * @number index - index of a single customer object in a tickets list
        * @obj customer - object of a single customer data
    */
    drawSingleCustomer: function (index, customer) {
      var tpl = document.getElementById('customer-row-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true),
        dateCreate = new Date(customer.DateCreate),
        balanceElem = elem.querySelector('.customers__row-balance');

      elem.dataset.id = customer.CustomerId;

      window.util.fillDetalization('', customer, elem);

      balanceElem.textContent = customer.Balance.toFixed(2);

      elem.querySelector('.status-label').classList.add('status', 'status--' + customer.State);

      elem.addEventListener('click', function () {
        if (customer.CustomerId !== Customers.item.curCustomer.CustomerId) {
          var rows = document.querySelectorAll('.customers__row');
          for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('active');
          }
          this.classList.add('active');
          Customers.item.load(customer.CustomerId);
        }
      });

      if (customer.CustomerId === Customers.item.curCustomer.CustomerId) {
        elem.classList.add('active');
      };
      return elem;
    }
  },
  item: {
    config: {
      fields: {
        balance: document.getElementById('customer-balance'),
        phone: document.getElementById('customer-phone'),
        samePhones: document.getElementById('customer-same-phones'),
        isLockedByAdmin: document.getElementById('customer-isLockedByAdmin'),
        IsPaidServerCreation: document.getElementById('customer-IsPaidServerCreation'),
        partner: document.getElementById('customer-partner'),
        Servers: document.getElementById('customer-tab-servers'),
        Invoices: document.getElementById('customer-tab-invoices'),
        LockReason: document.getElementById('block-reason'),
        allServer: document.getElementById('customer-server-all'),
        activeServer: document.getElementById('customer-server-active')
      },
      controls: {
        buildAgreement: {
          elem: document.getElementById('build-agreement-link')
        }
      },
      actions: {
        addMoney: {
          url: '/add-money',
          elem: document.getElementById('add-money-btn'),
          addInput: '<label for="AddMoney">Сумма</label><br><input type="number" id="AddMoney" name="AddMoney" placeholder="0" class="form-control mt20" required>',
          modal: {
            title: 'Добавить денег',
            introtext: '(Будет создана операция с типом "бонусные деньги", пополнен баланс пользователя и создан task)',
            hiddenComment: false,
            btnText: 'Добавить денег'
          }
        },
        loginAsClient: {
          url: '/logon',
          elem: document.getElementById('login-as-client-btn'),
          modal: {
            title: 'Войти в панель под ним',
            introtext: '(Вы будете автоматически перенаправлены во внутреннюю панель, с правими данного Клиента)',
            hiddenComment: false,
            btnText: 'Войти с правами Клиента'
          }
        },
        promissedPay: {
          url: '/add-promised-payment',
          elem: document.getElementById('promissed-pay-btn'),
          addInput: '<label for="AddMoneyPromissed">Сумма</label><br><input type="number" id="AddMoneyPromissed" name="AddMoneyPromissed" placeholder="0" class="form-control mt20" required>',
          modal: {
            title: 'Активировать обещанный платеж',
            introtext: '(Будет создана операция с типом "Начисление обещанного платежа", пополнен баланс пользователя и создан task на будущее списание обещанного платежа)',
            hiddenComment: false,
            btnText: 'Активировать обещанный платеж'
          }
        },
        blockClient: {
          url: '/block',
          elem: document.getElementById('block-client-btn'),
          addInput: '<textarea id="textArea2" name="comment" rows="5" class="form-control" placeholder="Причина блокировки" required></textarea>',
          modal: {
            title: 'Блокировать клиента',
            introtext: '(Клиент будет переведен в состояние "Blocked", создан task. Отправлена нотификация в указанием причины блокировки)',
            hiddenComment: false,
            btnText: 'Блокировать клиента'
          }
        },
        unblockClient: {
          url: '/unblock',
          elem: document.getElementById('unblock-client-btn'),
          addInput: '<textarea id="textArea2" name="comment" rows="5" class="form-control" placeholder="Причина блокировки" required></textarea>',
          modal: {
            title: 'Разблокировать клиента',
            introtext: '(Клиент будет переведен в состояние "Active" и создан task. Отправлена нотификация в указанием причины разблокировки)',
            hiddenComment: false,
            btnText: 'Разблокировать клиента'
          }
        },
        checkClient: {
          url: '/check',
          elem: document.getElementById('check-client-btn'),
          modal: {
            title: 'Проверка клиента',
            introtext: 'Проверка на связь клиента с ранее заблокированными',
            hiddenComment: false,
            btnText: 'Проверить'
          }
        },
        deleteClient: {
          url: '',
          elem: document.getElementById('delete-client-btn'),
          addInput: '<label class="option option-primary"><input type="checkbox" id="delete-confirm"><span class="checkbox"></span><b>Подтвердите удаление клиента</b></label>',
          modal: {
            title: 'Удалить клиента',
            introtext: 'Будет создана операция по удалению клиента',
            hiddenComment: false,
            btnText: 'Удалить'
          }
        },
        signoutClient: {
          url: '/signout',
          elem: document.getElementById('signout-client-btn'),
          addInput: '<label class="option option-primary"><input type="checkbox" id="signout-confirm"><span class="checkbox"></span><b>Подтвердите завершение сессии клиента</b></label>',
          modal: {
            title: 'Завершить сессию клиента',
            introtext: 'В результате данного действия у пользователя станет невалидным токен подключения к панели и, на любой следующий запрос пользователя, в ответ будет показываться форма входа в панель',
            hiddenComment: false,
            btnText: 'Завершить'
          }
        },
        changeEmail: {
          url: '/email-change',
          elem: document.getElementById('email-change-btn'),
          addInput: '<label for="AddMoney">Новый email</label><br><input type="email" id="newEmail" name="NewEmail" placeholder="" class="form-control mt20" required><br><label class="option option-primary"><input type="checkbox" id="new-email-force" name="Force"><span class="checkbox"></span><b>Создать новый запрос принудительно</b></label>',
          modal: {
            title: 'Cменить email клиента',
            introtext: 'Будет создана операция по смене почтового ящика клиента',
            hiddenComment: false,
            btnText: 'Сменить'
          }
        },
        clientOperations: {
          url: '/add-operation',
          elem: document.getElementById('customer-operations-btn'),
          addInput: document.getElementById('client-operations-tabs').innerHTML,
          modal: {
            title: 'Добавить операцию',
            introtext: 'Выберите операцию из списка',
            hiddenComment: false,
            btnText: 'Добавить'
          }
        }
      },
      curAction: ''
    },

    interval: false,
    curCustomer: {},
    customerBlock: document.getElementById('customer-info'),
    filterControl: document.getElementById('collapse-filter-btn'),
    summaryBlock: document.getElementById('customer-summary'),
    descriptionBlock: document.getElementById('customer-description'),
    holdedAlertElems: document.querySelectorAll('.customers__header-alert'),
    actionsBlock: document.getElementById('customer-actions'),
    actionsBlockModal: document.getElementById('modal-actions'),

    load: function (id) {
      var item = Customers.item;
      item.customerBlock.classList.add('loading', 'loading--full');

      $.get(window.util.makeCorrectUrl(id), function (data) {
        item.curCustomer = data;
        item.actionsBlock.classList.remove('tickets__actions--active');
        item.fillCustomerInfo(data);

      }).fail(function (data) {
        console.log('Error loading customer');
        handleAjaxErrors(data);
        item.customerBlock.classList.remove('loading', 'loading--full');
      });
    },
    fillCustomerInfo: function (customerInfo) {
      var customerBlock = Customers.item.customerBlock,
        customerCreated = new Date(customerInfo.DateCreate),
        customerFields = Customers.item.config.fields,
        customerControls = Customers.item.config.controls,
        customerActions = Customers.item.config.actions;

      var linkToCustomerTasksElem = customerBlock.querySelector('[data-rel="customer-tasks"]');
      var linkGetAgreement = customerControls.buildAgreement.elem;

      setTimeout(function () {
        // FILL TEXT INFO
        window.util.fillDetalization('customer-summary', customerInfo);
        window.util.fillDetalizationLinks('customer-summary', customerInfo.Links);
        if (linkToCustomerTasksElem) {
          linkToCustomerTasksElem.href += '&StateTask=';
        }

        Object.keys(customerActions).forEach(function (el) {
          if (customerActions[el].elem !== null) {
            window.util.setElementVisibility(customerActions[el].elem.parentNode, customerInfo.State !== 'Deleted');
          }
        })

        if (customerInfo.State !== 'Deleted') {
          window.util.setElementVisibility(customerFields.IsPaidServerCreation.parentNode, customerInfo.IsPaidServerCreation);
          window.util.setElementVisibility(customerFields.LockReason, customerInfo.IsLockedByAdmin);
          window.util.setElementVisibility(customerActions.blockClient.elem.parentNode, !customerInfo.IsLockedByAdmin);
          window.util.setElementVisibility(customerActions.unblockClient.elem.parentNode, customerInfo.IsLockedByAdmin);

          if (linkGetAgreement !== null) {
            window.util.setElementVisibility(linkGetAgreement.parentNode, customerInfo.HasCompany);
            linkGetAgreement.setAttribute('href', linkGetAgreement.dataset.agreementHref.replace('-1', customerInfo.CustomerId));
          }
        }

        customerFields.balance.textContent = (customerInfo.Balance).toFixed(2);

        customerFields.samePhones.classList.add('hidden');
        if (!customerInfo.IsPhoneConfirmed) {
          customerFields.phone.textContent = window.util.checkEmptyStringValue(null);
          customerFields.samePhones.textContent = '';
        } else {
          if (customerInfo.SamePhoneCount > 0) {
            customerFields.samePhones.textContent = '(' + customerFields.samePhones.textContent + ')';
            customerFields.samePhones.classList.remove('hidden');
          }
        }
        
        Customers.item.tabs.reset();
        document.querySelector('#detalization-tabs [data-toggle="tab"]:first-of-type').click();

        customerBlock.classList.add('main-list__info--active');
        customerBlock.classList.remove('loading', 'loading--full');
      }, 100);
    },
    tabs: {
      config: [
        {
          id: 'tab-servers',
          isLoaded: false,
          cells: ['InstanceId', 'Name', 'StateTitle', 'DateCreate', 'Ip']
        },
        {
          id: 'tab-invoices',
          isLoaded: false,
          cells: ['InvoiceId', 'StateTitle', 'InvoiceNumber', 'Amount']
        },
        {
          id: 'tab-ssl',
          isLoaded: false,
          cells: ['Id', 'StateTitle', 'ProductTitle', 'DomainName', 'ActivationDate', 'ExpireDate']
        },
        {
          id: 'tab-dns',
          isLoaded: false,
          cells: ['ZoneId', 'DomainName', 'DateCreate', 'Delegated']
        },
        {
          id: 'tab-storage',
          isLoaded: false,
          cells: ['Id', 'StateTitle']
        },
        {
          id: 'tab-monitoring',
          isLoaded: false,
          cells: ['IpOrDomain', 'State', 'DateActivated', 'DateDeleted']
        }
      ],
      filterConfig: [
        { name: 'state', value: 'InProgress' },
        { name: 'state', value: 'InComplete' },
        { name: 'state', value: 'Deleted' },
        { name: 'state', value: 'Deleting' },
        { name: 'state', value: 'Expired' },
        { name: 'state', value: 'NeedMoney' },
        { name: 'state', value: 'Outdated' },
        { name: 'state', value: 'ChangeSan' },
        { name: 'state', value: 'Canceling' },
        { name: 'state', value: 'Canceled' },
        { name: 'state', value: 'New' },
        { name: 'state', value: 'Rejected' },
        { name: 'state', value: 'Reissue' },
        { name: 'state', value: 'Busy' }
      ],
      limit: 50, // number of items to show. If more, we show button "To all results"
      setTabActive: function (e) {
        var t = Customers.item.tabs,
          elem = e.target,
          elemConfig = t.config.filter(function (item) {
            return item.id === elem.dataset.id;
          })[0];

        if (elemConfig.isLoaded) {
          return;
        } else {
          t.loadTabTable(elem.dataset.loadUrl, elemConfig);
        }
      },
      loadTabTable: function (loadUrl, config) {
        var t = Customers.item.tabs;
        var tab = document.querySelector('#' + config.id);
        var key = config.id.replace('tab-', '');
        var url = loadUrl.replace('-1', Customers.item.curCustomer['CustomerId']);
        url += (((key === 'storage') ? '?' : '&') + 'Limit=' + (t.limit + 1)); // For checking if there are more results than a limit 

        tab.classList.add('loading', 'loading--full');

        $.get(url, function (data) {
          var drawObj = {};
          var configObj = {};
          var isMoreElements = false;

          if (data.length > t.limit) {
            data.pop(); // Remove last element, coz of check above
            isMoreElements = true;
          }

          drawObj[key] = data;
          configObj[key] = config.cells;

          config.isLoaded = true;

          window.drawDetalizationTabTables(drawObj, configObj, t.filterConfig);
          if (isMoreElements) {
            tab.appendChild(getMoreButton(key));
          }

          tab.classList.remove('loading', 'loading--full');
        }).fail(function (data) {
          console.log(data);
          tab.classList.remove('loading', 'loading--full');
          });

        function getMoreButton(instanceKey) {
          var div = document.createElement('div');
          var link = document.createElement('a');

          div.classList.add('text-center', 'link-more', 'mt20');

          link.classList.add('btn', 'btn-primary');
          link.textContent = 'Ещё результаты';

          // linksToPages defined in Customer Index view
          link.href = linksToPages[key].replace('-1', Customers.item.curCustomer['CustomerId']);

          div.appendChild(link);

          return div;
        }
      },
      reset: function () {
        var t = Customers.item.tabs;
        var links = document.querySelectorAll('#detalization-tabs [data-toggle="tab"]');
        var tabs = document.querySelectorAll('#detalization-tabs .tab-pane');
        var checkboxes = document.querySelectorAll('#detalization-tabs .checkbox-custom-tabs');

        t.config.forEach(function (el) {
          el.isLoaded = false;
        });
        [].forEach.call(links, function (link) {
          link.parentNode.classList.remove('active');
        });
        [].forEach.call(tabs, function (tab) {
          var noResults = tab.querySelector('.tab-no-results');
          var moreResults = tab.querySelector('.link-more');
          tab.classList.remove('active');

          if (noResults !== null) {
            tab.removeChild(noResults);
          }
          if (moreResults !== null) {
            tab.removeChild(moreResults);
          }
        });
        [].forEach.call(checkboxes, function (el) {
          el.classList.add('hidden');
        });
      },
      init: function () {
        var links = document.querySelectorAll('#detalization-tabs [data-toggle="tab"]');

        [].forEach.call(links, function (link) {
          link.addEventListener('click', Customers.item.tabs.setTabActive);
        });
      }
    },
    /*
     * Inits all customer buttons behaviour
     */
    initButtons: function () {
      var config = Customers.item.config,
        controls = config.controls,
        actions = config.actions;

      for (var item in actions) {
        if (actions[item].elem !== null) {
          actions[item].elem.dataset.action = item;
          actions[item].elem.addEventListener('click', function () {
            var action = this.dataset.action;
            Customers.modal.clear();

            Customers.modal.fill(Customers.item.config.actions[action], action);
            Customers.modal.curAction = action;
            $(Customers.modal.config.mBlock).modal('show');
            Customers.modal.removeErrors();
            if (this.dataset.action == 'clientOperations') {
              Customers.item.initOperationsSelect();
            }

          });
        }
      };
    },
    initOperationsSelect: function () {
      var select = document.getElementById('operations-select');
      Customers.modal.config.mSendBtn.disabled = true;
      select.addEventListener('change', function () {
        $('#client-operations-forms > div').addClass('hidden');
        var blockId = select.options[select.selectedIndex].dataset.tab,
          activeBlock = document.getElementById(blockId),
          activeForm = activeBlock.querySelector('[data-purpose="form"]');
        activeBlock.classList.remove('hidden');
        Customers.modal.config.mForm.action = (blockId == 'operations-account-refund') ? window.util.makeCorrectUrl(Customers.item.curCustomer.CustomerId + '/add-bank-operation') : window.util.makeCorrectUrl(Customers.item.curCustomer.CustomerId + '/add-operation');
        Customers.modal.config.mSendBtn.disabled = false;

      })
    },
    showDescription: function () {
      Customers.item.summaryBlock.classList.remove('hidden');
    },
    /*
     * Toggles ticket description block's visibility
     */
    toggleDescription: function () {
      Customers.item.summaryBlock.classList.toggle('hidden');
    },
  },
  modal: {
    curAction: '',
    config: {
      mFormId: 'customer-comment-form',
      mForm: document.getElementById('customer-comment-form'),
      mBlock: document.getElementById('modal-comment'),
      mInput: document.getElementById('customer-inputs-block'),
      mTitle: document.getElementById('comment-title'),
      mIntro: document.getElementById('comment-intro'),
      mHidden: document.getElementById('comment-hidden'),
      mText: document.getElementById('comment-text'),
      mClose: document.getElementById('close-form'),
      mDropzone: false,
      mSendBtn: document.getElementById('comment-send')
    },
    /*
     * Fills modal window with the information, corresponding to the cliked button
     * @number ticketId - id of a ticket, to which modal is called for
     * @obj action - object of the chosen action
     */
    fill: function (actionObj, actionName) {
      var mConfig = Customers.modal.config;
      mConfig.mTitle.textContent = actionObj.modal.title;
      mConfig.mText.textContent = actionObj.modal.introtext;
      mConfig.mSendBtn.textContent = actionObj.modal.btnText;
      mConfig.mForm.action = window.util.makeCorrectUrl(Customers.item.curCustomer.CustomerId + actionObj.url);
      mConfig.mSendBtn.disabled = false;

      if (actionObj.addInput) {
        mConfig.mInput.innerHTML = actionObj.addInput;
      };

      $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
        event.preventDefault();
        Customers.modal.removeErrors();
        var customerId = Customers.item.curCustomer.CustomerId;
        switch (actionName) {
          case 'checkClient':
          case 'deleteClient':
          case 'signoutClient':
          case 'changeEmail':
          case 'clientOperations':
            Customers.modal.submit[actionName](customerId, this);
            break;
          default:
            Customers.modal.submit['defaultSubmit'](customerId, this, actionName);
        };
      });
    },
    submit: {
      defaultSubmit: function (custId, form, actionName) {
        var formInp = form.querySelector('.form-control');
        var sendObj = {};
        sendObj.customerId = custId;
        if (actionName == 'unblockClient' || actionName == 'blockClient') {
          sendObj.reason = formInp.value;
        } else if (actionName == 'addMoney' || actionName == 'promissedPay') {
          sendObj.amount = formInp.value;
        };
        sendPostRequest('#' + form.id, form.action, sendObj, Customers.modal.onSuccess, Customers.modal.onFail);
      },
      checkClient: function (custId, form) {
        sendPostRequest('#' + form.id, form.action, { customerId: custId }, Customers.modal.onSuccessCheck, Customers.modal.onFail);
      },
      deleteClient: function (custId, form) {
        var checked = $(form).find('#delete-confirm').is(':checked');
        if (checked) {
          sendPostRequest('#' + form.id, form.action, { customerId: custId }, Customers.modal.onSuccess, Customers.modal.onFail, 'DELETE');
        } else {
          errorMessageAdd($('#delete-confirm'), 'Необходимо подтвердить удаление');
        }
      },
      signoutClient: function (custId, form) {
        var checked = $(form).find('#signout-confirm').is(':checked');
        if (checked) {
          sendPostRequest('#' + form.id, form.action, { customerId: custId }, Customers.modal.onSuccess, Customers.modal.onFail);
        } else {
          errorMessageAdd($('#signout-confirm'), 'Необходимо подтвердить завершение сессии клиента');
        }
      },
      changeEmail: function (custId, form) {
        var sendObj = {};
        sendObj.customerId = custId;
        sendObj.NewEmail = $('[name="NewEmail"]').val();
        sendObj.Force = $('[name="Force"]').prop('checked');
        sendPostRequest('#' + form.id, form.action, sendObj, function (data) {
          Customers.modal.onSuccess(data, true);
        }, Customers.modal.onFail);
      },
      clientOperations: function (custId, form) {
        var select = form.querySelector('select'),
          activeId = select.options[select.selectedIndex].dataset.tab,
          sendObj = {};
        sendObj.customerId = custId;
        sendObj.Amount = $('#' + activeId + ' [name="Amount"]').val();
        sendObj.InvoiceNumber = ($('#' + activeId + ' [name="InvoiceNumber"]').length > 0) ? $('#' + activeId + ' [name="InvoiceNumber"]').val() : "";
        sendObj.Type = $('#' + activeId + ' [data-purpose="form"]').data('type');
        sendPostRequest('#' + form.id, form.action, sendObj, Customers.modal.onSuccess, Customers.modal.onFail);
      }
    },
    clear: function () {
      var mConfig = Customers.modal.config;
      mConfig.mInput.innerHTML = '';
      Customers.item.config.curAction = '';
      Customers.modal.curAction = '';
    },
    successPopUp: function (bool) {
      var succChild = document.createElement('div'),
        tpl = document.getElementById('success-pop-up'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        succEl = tplContainer.querySelector('div').cloneNode(true),
        blockToShow = document.querySelector('.main-list__panel-body');
      succChild.appendChild(succEl);
      blockToShow.insertBefore(succChild, blockToShow.firstChild);
      if (bool === true) {
        document.getElementById('success-text').textContent = 'Запрос успешно отправлен. Была создана задача по смене email'
      } else {
        setTimeout(function () {
          Customers.modal.clearSucc(succChild, blockToShow);
        }, 7000);
      }
    },
    clearSucc: function (deleteThis, deleteFrom) {
      deleteFrom.removeChild(deleteThis);
    },
    onSuccess: function (data, bool) {
      Customers.modal.successPopUp(bool);
      $(Customers.modal.config.mBlock).modal('hide');
      Customers.list.load();
      Customers.modal.clear();
    },
    onSuccessCheck: function (data) {
      var checkState = document.createElement('h3'),
        block = document.getElementById('customer-inputs-block');
      checkState.id = 'check-customer-state';
      checkState.textContent = (!data.IsDanger) ? 'Безопасный' : 'Не безопасный';
      if (document.getElementById('check-customer-state') == null) {
        block.appendChild(checkState);
      };

      // for associated users
      if (data.IsDanger && data.SimilarCustomers.length > 0) {
        var similarCustomers = data.SimilarCustomers,
          similarCustomerText = document.createElement('p');
        similarCustomerText.textContent = 'Ассоциированные пользователи';
        block.appendChild(similarCustomerText);

        similarCustomers.forEach(function (el) {
          var customerLink = document.createElement('a'),
            icon = document.createElement('span');
          customerLink.classList = 'center-block mb5';
          customerLink.setAttribute('target', '_blank');
          customerLink.setAttribute('href', el.SelfLink);
          if (!el.Blocked) {
            icon.classList.add('glyphicon', 'glyphicon-ok', 'mr10')
          } else {
            icon.classList.add('glyphicon', 'glyphicon-ban-circle', 'mr10')
          }
          customerLink.appendChild(icon);
          customerLink.innerHTML += el.Email;

          block.appendChild(customerLink);
        });
      };
    },
    onFail: function (data) {
      handleAjaxErrors(data, '#' + Customers.modal.config.mFormId);
      Customers.modal.addErrorClass();
    },
    removeErrors: function () {
      var errParentBlock = document.getElementById(Customers.modal.config.mFormId);
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
    window.util.makeCorrectUrl('');
    this.filter.init();
    this.list.load();
    this.item.initButtons();
    this.item.tabs.init();
    hackForActiveSidebarMenu();
    function hackForActiveSidebarMenu() {
      var arrLinks = document.querySelectorAll('.sidebar-menu .tickets-menu .sub-nav > li a');
      for (var i = 0; i < arrLinks.length; i++) {
        if (window.location.href.indexOf(arrLinks[i].getAttribute('href')) !== -1) {
          arrLinks[i].parentNode.classList.add('active');
          return;
        }
      }
    }
  }
}
Customers.init();