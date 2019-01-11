'use strict';

var Monitoring = {
  config: {
    filterFormId: 'monitoring-filter',
    monitoringContainerId: 'monitoring-container',
    monitoringListId: 'monitoring-table',
    monitoringListUrl: 'list'
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Monitoring.item.curmonitoring = {};
      Monitoring.item.monitoringBlock.classList.remove('main-list__info--active');
      Monitoring.list.load();
    },
    init: function () {
      Monitoring.filter.obj = new Filter(Monitoring.config.filterFormId, Monitoring.filter.submit);
      Monitoring.filter.obj.init();
    }
  },
  list: {
    /*
     * Loads monitoring list due to filter values
     */
    load: function () {
      $.get(window.util.makeCorrectUrl(Monitoring.config.monitoringListUrl), Monitoring.filter.obj.getFilterObj(), function (data) {
        Monitoring.list.drawMonitoringList(data);
      }).fail(function (data) {
        handleAjaxErrors(data);
        console.log('Error getting monitoring');
      });
    },
    /*
     * Draw monitoring table due to server's response
     * @obj data - object from server with monitoring object list
     */
    drawMonitoringList: function (data) {
      var container = document.getElementById(Monitoring.config.monitoringContainerId),
        table = document.getElementById(Monitoring.config.monitoringListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.monitoring__row-list');

      container.parentNode.classList.add('loading', 'loading--full');
      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            list.appendChild(Monitoring.list.drawSinglemonitoring(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');

          if (data.length === 1) {
            Monitoring.item.load(data[0].Id, data[0].ProjectUid);
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
        * Returns DOM object of a single monitoring item
        * @number index - index of a single monitoring object in a tickets list
        * @obj monitoring - object of a single monitoring data
    */
    drawSinglemonitoring: function (index, monitoring) {
      var tpl = document.getElementById('monitoring-row-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true),
        dateCreate = new Date(monitoring.DateCreate);

      elem.dataset.id = monitoring.Id;
      elem.dataset.ProjectUid = monitoring.ProjectUid;

      window.util.fillDetalization('', monitoring, elem);
      elem.addEventListener('click', function () {
        if (monitoring.Id !== Monitoring.item.curmonitoring.monitoringId) {
          
          var rows = document.querySelectorAll('.monitoring__row');
          for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('active');
          }
          
          this.classList.add('active');
          Monitoring.item.load(monitoring.Id, elem.dataset.ProjectUid);
        }
      });
      if (monitoring.Id === Monitoring.item.curmonitoring.monitoringId) {
        elem.classList.add('active');
      };
      return elem;
    }
  },
  item: {
    config: {
      fields: {
        partner: document.getElementById('monitoring-partner'),
        Servers: document.getElementById('monitoring-tab-servers'),
        allServer: document.getElementById('monitoring-server-all'),
        activeServer: document.getElementById('monitoring-server-active')
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
          addInput: '<label for="AddMoney">Новый email</label><br><input type="email" id="newEmail" name="NewEmail" placeholder="" class="form-control mt20" required>',
          modal: {
            title: 'Cменить email клиента',
            introtext: 'Будет создана операция по смене почтового ящика клиента',
            hiddenComment: false,
            btnText: 'Сменить'
          }
        }
      },
      curAction: ''
    },

    interval: false,
    curmonitoring: {},
    monitoringBlock: document.getElementById('monitoring-info'),
    filterControl: document.getElementById('collapse-filter-btn'),
    summaryBlock: document.getElementById('monitoring-summary'),
    descriptionBlock: document.getElementById('monitoring-description'),
    holdedAlertElems: document.querySelectorAll('.monitoring__header-alert'),

    load: function (id, getParam) {
      var item = Monitoring.item;
      item.monitoringBlock.classList.add('loading', 'loading--full');

      $.get(window.util.makeCorrectUrl('hosts/' + id + '?projectUid=' + getParam), function (data) {
        item.curmonitoring = data;
        item.fillMonitoringInfo(data);

      }).fail(function (data) {
        console.log('Error loading monitoring');
        handleAjaxErrors(data);
        item.monitoringBlock.classList.remove('loading', 'loading--full');
        });

      $.get(window.util.makeCorrectUrl('hosts/' + id + '/metrics' + '?projectUid=' + getParam), function (data) {
        
        item.fillMetricsInfo(data);

      }).fail(function (data) {
        console.log('Error loading monitoring');
        handleAjaxErrors(data);
        item.monitoringBlock.classList.remove('loading', 'loading--full');
      });
    },
    fillMetricsInfo: function (metrics) {
      var t = Monitoring.item.tabs;
      window.drawDetalizationTabTables({ metrics : metrics }, t.config, t.filterConfig);
    },
    fillMonitoringInfo: function (monitoringInfo) {
      var monitoringBlock = Monitoring.item.monitoringBlock,
        monitoringCreated = new Date(monitoringInfo.DateCreate),
        monitoringFields = Monitoring.item.config.fields,
        monitoringControls = Monitoring.item.config.controls,
        monitoringActions = Monitoring.item.config.actions;

      var linkTomonitoringTasksElem = monitoringBlock.querySelector('[data-rel="monitoring-tasks"]');

      setTimeout(function () {
        // FILL TEXT INFO
        window.util.fillDetalization('monitoring-summary', monitoringInfo);
        window.util.fillDetalizationLinks('monitoring-summary', monitoringInfo.Links);
        Monitoring.item.drawIcinga(monitoringInfo.IcingaHostIdByZone);
        if (linkTomonitoringTasksElem) {
          linkTomonitoringTasksElem.href += '&StateTask=';
        }

        Object.keys(monitoringActions).forEach(function (el) {
          if (monitoringActions[el].elem !== null) {
            window.util.setElementVisibility(monitoringActions[el].elem.parentNode, monitoringInfo.State !== 'Deleted');
          }
        })

        monitoringBlock.classList.add('main-list__info--active');
        monitoringBlock.classList.remove('loading', 'loading--full');
      }, 100);
    },
    drawIcinga: function (icingaObj) {
      var monitoringBlock = Monitoring.item.monitoringBlock,
        icingaBlock = monitoringBlock.querySelector('#idIcinga');
      icingaBlock.innerHTML = '';
      for (var item in icingaObj) {
        var elem = document.createElement('div'),
          elemKey = document.createElement('div'),
          elemVal = document.createElement('div');
        elem.classList.add('list-group-item', 'detalization__row');
        elemKey.classList.add('detalization__item', 'detalization__item--name');
        elemVal.classList.add('detalization__item', 'detalization__item--text');
        elemKey.textContent = item;
        elemVal.textContent = icingaObj[item];
        elem.appendChild(elemKey);
        elem.appendChild(elemVal);
        icingaBlock.appendChild(elem);
      }
    },
    tabs: {
      config: {
        metrics: ['Name', 'StateTitle', 'CommandType']
      },
      filterConfig: [
        { name: 'state', value: 'New' },
        { name: 'state', value: 'Busy' },
        { name: 'state', value: 'Deleted' },
        { name: 'state', value: 'Deleting' }
      ],
      limit: 50, // number of items to show. If more, we show button "To all results"
    },
    /*
     * Inits all monitoring buttons behaviour
     */
    
    showDescription: function () {
      Monitoring.item.summaryBlock.classList.remove('hidden');
    },
    /*
     * Toggles ticket description block's visibility
     */
    toggleDescription: function () {
      Monitoring.item.summaryBlock.classList.toggle('hidden');
    },
  },
  
  init: function () {
    window.util.makeCorrectUrl('');
    this.filter.init();
    this.list.load();
  }
}
Monitoring.init();