'use strict';

var Instances = {
  config: {
    filterFormId: 'instances-filter',
    instancesContainerId: 'instances',
    instancesListId: 'instances-table',
    instancesListUrl: 'list'
  },

  /*
   * Returns correct url for ajax requests. Doesn't depend on the fact if there is a slash in the end of window.location.pathname
   * @string appendix - a string to be added to path name
   */
  makeCorrectUrl: function (appendix) {
    return window.location.origin + window.location.pathname + ((window.location.pathname.slice(-1) === '/') ? '' : '/') + appendix;
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Instances.item.curInstance = {};
      Instances.item.instanceBlock.classList.remove('main-list__info--active');
      Instances.list.load();
    },
    init: function () {
      Instances.filter.obj = new Filter(Instances.config.filterFormId, Instances.filter.submit);
      Instances.filter.obj.init();

      var config = Instances.filter.config;
      config.form = document.getElementById(Instances.config.filterFormId);
      config.canFilterByPartner = config.form.dataset.partnerFilter.toLowerCase();
      config.level = config.form.dataset.level;
    }
  },
  list: {
    interval: false,
    /*
     * Loads instances list due to filter values
     */
    load: function () {
      $.get(Instances.makeCorrectUrl(Instances.config.instancesListUrl), Instances.filter.obj.getFilterObj(), function (data) {
        Instances.list.drawInstancesList(data);
      }).fail(function (data) {
        handleAjaxErrors(data);
        console.log('Error getting instances');
      });
    },
    /*
     * Draw instances table due to server's response
     * @obj data - object from server with instances object list
     */
    drawInstancesList: function (data) {

      var container = document.getElementById(Instances.config.instancesContainerId),
        table = document.getElementById(Instances.config.instancesListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.instances__row-list');

      container.parentNode.classList.add('loading', 'loading--full');
      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            list.appendChild(Instances.list.drawSingleInstance(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');

          if (data.length === 1) {
            Instances.item.load(data[0].InstanceId);
          }
        } else {
          table.classList.add('hidden');
          noResults.classList.remove('hidden');
        }

        container.parentNode.classList.remove('loading', 'loading--full');
      }, 400);

    },
    /*
        * Returns DOM object of a single ticket item
        * @number index - index of a single ticket object in a tickets list
        * @obj ticket - object of a single ticket data
    */
    drawSingleInstance: function (index, instance) {
      var tpl = document.getElementById('instance-row-template'),
        instanceCreated = new Date(instance.DateCreate),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true);

      window.util.fillDetalization('instance-row-template', instance, elem);

      elem.querySelector('.status-label').classList.add('status', 'status--' + instance.State);
      elem.querySelector('.instances__row-date').textContent = window.util.formatDate(instanceCreated);
      elem.addEventListener('click', function () {
        if (instance.InstanceId !== Instances.item.curInstance.InstanceId) {
          var rows = document.querySelectorAll('.instances__row');
          for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('active');
          }
          this.classList.add('active');
          Instances.item.load(instance.InstanceId);
        }
      });

      if (instance.InstanceId === Instances.item.curInstance.InstanceId) {
        elem.classList.add('active');
      };
      return elem;
    }
  },
  item: {
    config: {
      fields: {
        DC: document.getElementById('instance-dc'),
        performance: document.getElementById('instance-performance'),
        needMoney: document.getElementById('needMoney-wrap'),
        bandWidth: document.getElementById('bandWidth-wrap'),
        consoleState: document.getElementById('console-wrap'),
        LockReason: document.getElementById('block-reason'),
        hddPolicy: document.getElementById('instance-Policy')
      },
      controls: {
        hold: {
          elem: document.getElementById('ticket-hold-btn')
        }
      },
      actions: {
        lock: {
          url: '/lock',
          elem: document.getElementById('lock-btn'),
          addInput: '<div class="mb10"><label class="option option-primary"><input type="checkbox" name="block" id="block-checkbox" value=""><span class="checkbox"></span>Не выключать сервер при блокировке</label></div><textarea id="textArea2" name="comment" rows="5" class="form-control send-inp" placeholder="Причина блокировки" required></textarea>',
          modal: {
            title: 'Блокировать сервер',
            introtext: '(Сервер будет переведен в состояние "Blocked" и создан task. Отправлена нотификация с указанием причины блокировки)',
            hiddenComment: false,
            btnText: 'Блокировать'
          }
        },
        unlock: {
          url: '/unlock',
          elem: document.getElementById('unlock-btn'),
          addInput: '<textarea id="textArea2" name="comment" rows="5" class="form-control send-inp" placeholder="Причина разблокировки" required></textarea>',
          modal: {
            title: 'Разблокировать сервер',
            introtext: '(Сервер будет переведен в состояние "Active" и создан task. Отправлена нотификация с указанием причины разблокировки)',
            hiddenComment: false,
            btnText: 'Разблокировать'
          }
        },
        webconsole: {
          url: '/webconsole',
          elem: document.getElementById('webconsole-btn'),
          modal: {
            title: 'Консоль доступа к серверу',
            introtext: '(Вы будете перенаправленны на страницу доступа к серверу в панели управления)',
            hiddenComment: false,
            btnText: 'Webconsole'
          }
        },
        bandwidth: {
          url: '/bandwidth',
          elem: document.getElementById('change-width-btn'),
          addInput: '',
          modal: {
            title: 'Изменить ширину канала',
            introtext: '(Данное действие приведет к изменению ширины канала на выбранном интерфейсе)',
            hiddenComment: false,
            btnText: 'Изменить канал'
          }
        },
        forcecreate: {
          url: '/forcecreate',
          elem: document.getElementById('forcecreate-btn'),
          modal: {
            title: 'Создание сервера',
            introtext: 'Создать сервер без проверки баланса Клиента',
            hiddenComment: false,
            btnText: 'Создать'
          }
        },
        moreOptions: {
          elem: document.getElementById('more-actions-btn'),
          modal: {
            title: 'Выберите операцию',
            introtext: 'Выберите действие из списка',
            btnText: 'Выполнить'
          },
          options: {
            moveToCustomer: {
              url: '/tocustomer/',
              cB: function (data) {
                // here we send post request after ValidateMoveToCustomer
                var mConfig = Instances.modal.config,
                  block = mConfig.mInputBlock.querySelector('.panel-body');
                if (data.IsNeedConfirm) {
                  var descrElem = document.createElement('div');
                  descrElem.classList.add('alert', 'alert-danger', 'alert-dismissable', 'pastel', 'mt10');
                  descrElem.innerHTML = '<b>Внимание!</b> Клиент имеет Parent CustomerId.<br> Для того, чтобы продолжить выполнение операции необходимо подтвердить действие и нажать кнопку "Выполнить"';
                  document.querySelector('[name="toCustomerId"').readOnly = true;
                  block.appendChild(descrElem);
                  block.appendChild(Instances.modal.showCheckbox('Подтвердите действие'));
                  mConfig.mSendBtn.disabled = true;
                  mConfig.mInputBlock.querySelector('#confirm-action').addEventListener('change', function () {
                    if (this.checked) {
                      mConfig.mSendBtn.disabled = false;
                      $(mConfig.mForm).unbind('submit');
                      $(mConfig.mForm).submit(function (e) {
                        e.preventDefault();
                        Instances.modal.submit.moveToCustomer(mConfig.mForm, Instances.modal.onSuccess, false);

                      });
                    } else {
                      mConfig.mSendBtn.disabled = true;
                    }
                  });
                } else {
                  Instances.modal.submit.moveToCustomer(mConfig.mForm, Instances.modal.onSuccess, false);
                }
              },
              elem: document.getElementById('more-actions-btn'),
              addInput: '<div class="form-group"><input type="number" name="toCustomerId" placeholder="Клиенту с ID" class="form-control" required/></div>',
              modal: {
                title: 'Перенос сервера',
                introtext: 'Перенести сервер на другой аккаунт',
                hiddenComment: false,
                btnText: 'Выполнить',
                optionName: 'Перенести сервер на другой аккаунт'
              }
            }
          }
        },
        synchronize: {
          url: '/synchronize',
          elem: document.getElementById('synchronize-btn'),
          modal: {
            title: 'Обновление сервера',
            introtext: 'Синхронизация данных из vCloud с базой данных',
            hiddenComment: false,
            btnText: 'Обновить'
          }
        },

      },
      BandWidthVal: {},
      nicsObj: {},
      curAction: ''
    },
    interval: false,
    curInstance: {},
    instanceBlock: document.getElementById('instance-info'),
    summaryControl: document.getElementById('instance-summary-collapse-btn'),
    filterControl: document.getElementById('collapse-filter-btn'),
    summaryBlock: document.getElementById('instance-summary'),
    descriptionBlock: document.getElementById('instance-description'),
    holdedAlertElems: document.querySelectorAll('.instances__header-alert'),
    actionsBlock: document.getElementById('instance-actions'),
    actionsBlockModal: document.getElementById('modal-actions'),
    load: function (id) {
      Instances.item.instanceBlock.classList.add('loading', 'loading--full');

      $.get(Instances.makeCorrectUrl(id), function (data) {
        var item = Instances.item;
        item.curInstance = data;
        item.actionsBlock.classList.remove('main-list__actions--active');
        item.fillInstanceInfo(data);

      }).fail(function (data) {
        console.log('Error loading instance');
        handleAjaxErrors(data);
        Instances.item.instanceBlock.classList.remove('loading', 'loading--full');
      });
    },
    clearTable: function (tableTh, tableTd) {
      tableTh.innerHTML = '';
      tableTd.innerHTML = '';
    },
    itemTabsConfig: {
      'Nics': [
        'Id', 'VcloudName', 'State', 'IP', 'MAC', 'Gateway', 'DateCreate'
      ],
      'Disks': [
        'Name', 'DateCreate', 'Size', 'DiskTypeString', 'StoragePolicy', 'Cost'
      ],
      'Licenses': [
        'Id', 'StateTitle', 'DateCreate'
      ],
      'Backups': (userRoles.isPlatform && (userRoles.isSupport || userRoles.isSupport2 || userRoles.isAdmin)) ? ['JobID', 'JobName', 'ActivationDate', 'Cost'] : ['ActivationDate', 'Cost'],
      'Tasks': [
        'Id', 'TypeTitle', 'StateTitle', 'DateCreate', 'DateCompleted'
      ],
      'FirewallRules': [
        'Number', 'Name', 'Source', 'SourcePort', 'Destination', 'DestinationPort', 'Protocol', 'Action', 'TrafficDirection'
      ]
    },
    itemTabsFilterConfig: [
      { name: 'state', value: 'Deleted' },
      { name: 'state', value: 'Deleting' }
    ],
    fillInstanceInfo: function (instanceInfo) {
      var instanceBlock = Instances.item.instanceBlock,
        instanceFields = Instances.item.config.fields,
        instanceActions = Instances.item.config.actions;

      setTimeout(function () {
        // FILL TEXT INFO
        window.util.setElementVisibility(instanceFields.consoleState, instanceInfo.IsPowerOn);
        window.util.fillDetalization('instance-summary', instanceInfo);
        window.util.fillDetalizationLinks('instance-summary', instanceInfo.Links);
        instanceFields.DC.textContent = window.util.translateToRussian(instanceInfo.DCLocation);
        instanceFields.performance.textContent = window.util.translateToRussian(instanceInfo.Performance);
        window.util.setElementVisibility(instanceFields.hddPolicy, instanceInfo.StoragePolicy);
        Instances.item.config.nicsObj = {};
        Instances.item.config.BandWidthVal = {};

        for (var i = 0; i < Object.keys(instanceInfo.Nics).length; i++) {
          if (instanceInfo.Nics[i].CanChangeBandwidth === true) {
            Instances.item.config.nicsObj[instanceInfo.Nics[i].Id] = instanceInfo.Nics[i].IP;
            Instances.item.config.BandWidthVal[instanceInfo.Nics[i].Id] = instanceInfo.Nics[i].Bandwidth;
          } else {
            instanceFields.bandWidth.classList.add('hidden');
          };
        };

        window.util.setElementVisibility(instanceFields.bandWidth, (Object.keys(Instances.item.config.nicsObj).length > 0));
        window.util.setElementVisibility(instanceFields.needMoney, (instanceInfo.State == 'NeedMoney'));
        window.util.setElementVisibility(instanceFields.LockReason, (instanceInfo.State === 'Blocked' || instanceInfo.LockReason !== ''));

        window.drawDetalizationTabTables(instanceInfo, Instances.item.itemTabsConfig, Instances.item.itemTabsFilterConfig);

        instanceBlock.classList.add('main-list__info--active');
        instanceBlock.classList.remove('loading', 'loading--full');
      }, 100);
    },
    initSelect: function (nicsId) {
      var selectElem = document.createElement('select');
      selectElem.className = 'form-control';
      for (var prop in nicsId) {
        var optionText = document.createTextNode(nicsId[prop]),
          optionElem = document.createElement('option');
        optionElem.appendChild(optionText);
        optionElem.dataset.id = prop;
        selectElem.appendChild(optionElem);
      }
      Instances.modal.config.mInputBlock.appendChild(selectElem);
      var selectListen = document.querySelector('#' + Instances.modal.config.mFormId + ' select');
      Instances.item.initSlide(selectListen.options[selectListen.selectedIndex].dataset.id);
      selectListen.addEventListener('change', function () {
        Instances.item.initSlide(this.options[this.selectedIndex].dataset.id);
        Instances.modal.config.mForm.action = Instances.makeCorrectUrl(Instances.item.curInstance.InstanceId + '/nic/' + this.options[this.selectedIndex].dataset.id + Instances.item.config.actions['bandwidth'].url);
      });
    },
    initSlide: function (nicsId) {
      var sliderInitValue = (Instances.item.config.BandWidthVal[nicsId] < 10) ? 10 : Instances.item.config.BandWidthVal[nicsId];
      var sliderWrap = document.querySelector('#instance__slider'),
        sliderBlock = '<div class="section mb25 p20"><label for="slide-val">Ширина внешнего канала:  </label><input type="text" readonly="" value="' + sliderInitValue + '" id="slide-val" class="send-inp slider-countbox mb10"><div class="slider-wrapper slider-primary"><div id="slider1"></div></div></div>';
      sliderWrap.innerHTML = sliderBlock;
      $("#slider1").slider({
        range: "min",
        min: 10,
        step: 10,
        max: 300,
        value: sliderInitValue,
        slide: function (event, ui) {
          $(".slider-countbox").val(ui.value);
        }
      });
    },
    /*
     * Inits all instance buttons behaviour
     */
    initButtons: function () {
      var config = Instances.item.config,
        controls = config.controls,
        actions = config.actions,
        sliderEl = document.querySelector('#instance__slider');

      for (var item in actions) {
        Instances.item.drawMoreOptionsBlock();
        if (actions[item].elem) {
          actions[item].elem.dataset.action = item;
          actions[item].elem.addEventListener('click', function () {
            var action = this.dataset.action;
            Instances.modal.clear();
            if (this.dataset.action == 'bandwidth') {
              if (Object.keys(Instances.item.config.nicsObj).length > 0) {
                Instances.item.initSelect(Instances.item.config.nicsObj);
              }
            } else {
              sliderEl.innerHTML = '';
            };
            Instances.modal.fill(Instances.item.config.actions[action], action);
            Instances.modal.curAction = action;
            $(Instances.modal.config.mBlock).modal('show');
            Instances.modal.removeErrors();
          });
        }
      }
    },
    drawMoreOptionsBlock: function () {
      var options = Instances.item.config.actions.moreOptions.options,
        configModal = Instances.item.config.actions.moreOptions.modal,
        select = document.createElement('select'),
        btn = document.getElementById('more-actions-btn'),
        mConfig = Instances.modal.config,
        firstOption = document.createElement('option');
      firstOption.text = 'Выберите операцию из списка';
      firstOption.selected = true;
      firstOption.disabled = true;
      select.appendChild(firstOption);
      for (var item in options) {
        let selectOption = document.createElement('option');
        selectOption.text = options[item].modal.optionName;
        selectOption.dataset.name = item;
        select.appendChild(selectOption);
      };
      select.classList.add('form-control');
      select.addEventListener('change', function () {
        var curOtionName = this.options[this.selectedIndex].dataset.name;
        Instances.modal.fillFromSelect(options[curOtionName], curOtionName);
      });
      if (btn) {
        btn.addEventListener('click', function () {
          select.options[0].disabled = false;
          select.options[0].selected = true;
          select.options[0].disabled = true;
          mConfig.mInputBlock.innerHTML = '';
          $(mConfig.mBlock).modal('show');
          Instances.modal.removeErrors();
          mConfig.mInputBlock.appendChild(select);
          mConfig.mTitle.textContent = configModal.title;
          mConfig.mText.textContent = configModal.introtext;
          mConfig.mSendBtn.textContent = configModal.btnText;
          mConfig.mSendBtn.disabled = true;
        });
      }
    },
    showDescription: function () {
      Instances.item.summaryBlock.classList.remove('hidden');
      Instances.item.summaryControl.classList.remove('main-list__summary-collapse-btn--collapsed');
    },
    /*
     * Toggles ticket description block's visibility
     */
    toggleDescription: function () {

      Instances.item.summaryBlock.classList.toggle('hidden');
      Instances.item.summaryControl.classList.toggle('main-list__summary-collapse-btn--collapsed');
    },
  },
  modal: {
    curAction: '',
    config: {
      mFormId: 'instance-comment-form',
      mForm: document.getElementById('instance-comment-form'),
      mBlock: document.getElementById('modal-comment'),
      mInputBlock: document.getElementById('instance-inputs-block'),
      mTitle: document.getElementById('comment-title'),
      mIntro: document.getElementById('comment-intro'),
      mHidden: document.getElementById('comment-hidden'),
      mText: document.getElementById('comment-text'),
      mClose: document.getElementById('close-form'),
      mDropzone: false,
      mSendBtn: document.getElementById('comment-send'),
      mSelectBlockTempl: 'instance-options-tpl',
      mSelectBlock: 'instance-options-block',
      mSelectBlockTitle: 'instance-options-title',
      mSelectInputBlock: 'instance-options-input'

    },
    /*
     * Fills modal window with the information, corresponding to the cliked button
     * @number ticketId - id of a ticket, to which modal is called for
     * @obj action - object of the chosen action
     */
    fill: function (actionObj, actionName) {
      Instances.modal.config.mSelect = document.querySelector('#' + Instances.modal.config.mFormId + ' select');
      var mConfig = Instances.modal.config;
      mConfig.mTitle.textContent = actionObj.modal.title;
      mConfig.mText.textContent = actionObj.modal.introtext;
      mConfig.mSendBtn.textContent = actionObj.modal.btnText;
      mConfig.mSendBtn.disabled = false;
      if (actionName == 'bandwidth') {
        var nicsId = mConfig.mSelect.options[mConfig.mSelect.selectedIndex].dataset.id;
        mConfig.mForm.action = Instances.makeCorrectUrl(Instances.item.curInstance.InstanceId + '/nic/' + nicsId + actionObj.url);
      } else {
        mConfig.mForm.action = Instances.makeCorrectUrl(Instances.item.curInstance.InstanceId + actionObj.url);
      };

      if (actionObj.addInput) {
        mConfig.mInputBlock.innerHTML += actionObj.addInput;
      };

      var consoleBtn = document.querySelector('#modal-actions span');
      if (consoleBtn) {
        var list = document.getElementById("modal-actions");
        list.removeChild(consoleBtn);
      };

      if (actionName == 'webconsole') {
        var panelLink = document.getElementById('panel-url');
        var hrefLink = panelLink.textContent + '/account/signin-as?projectId=' + Instances.item.curInstance.CustomerId + '&platform=' + userRoles.isPlatform + '&url=/server/webconsolehtml5/' + Instances.item.curInstance.InstanceId,
          consoleWrap = document.createElement('span'),
          consoleLink = document.createElement('a'),
          linkTxt = document.createTextNode('Войти в Webconsole');
        consoleLink.setAttribute('href', hrefLink);
        consoleLink.setAttribute('target', '_blank');
        consoleLink.setAttribute('id', 'webconsole-link');
        consoleLink.appendChild(linkTxt);
        consoleLink.className = 'btn btn-primary';
        consoleLink.addEventListener('click', function () {
          $(Instances.modal.config.mBlock).modal('hide');
        });
        document.getElementById('comment-send').classList.add('hidden');

        consoleWrap.appendChild(consoleLink);
        Instances.item.actionsBlockModal.appendChild(consoleWrap);
      } else {
        document.getElementById('comment-send').classList.remove('hidden');
      }

      $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
        event.preventDefault();
        Instances.modal.removeErrors();
        switch (actionName) {
          case 'bandwidth':
            Instances.modal.submit[actionName](Instances.item.curInstance.InstanceId, mConfig.mForm);
            break;
          default:
            Instances.modal.submit.defaultSubmit(Instances.item.curInstance.InstanceId, mConfig.mForm, actionName);
        }
      });
    },
    fillFromSelect: function (actionObj, actionName) {
      var mConfig = Instances.modal.config,
        tpl = document.getElementById(mConfig.mSelectBlockTempl),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        block = tplContainer.querySelector('#' + mConfig.mSelectBlock).cloneNode(true);
      var prevBlock = mConfig.mInputBlock.querySelector('#instance-options-block');
      if (prevBlock != null) {
        mConfig.mInputBlock.removeChild(prevBlock)
      }
      block.querySelector('#' + mConfig.mSelectBlockTitle).textContent = actionObj.modal.title;
      block.querySelector('#' + mConfig.mSelectInputBlock).innerHTML = actionObj.addInput;
      mConfig.mInputBlock.appendChild(block);
      mConfig.mSendBtn.disabled = false;
      $(mConfig.mForm).unbind('submit');
      $(mConfig.mForm).submit(function (event) {
        event.preventDefault();
        Instances.modal.removeErrors();
        Instances.modal.submit[actionName](mConfig.mForm, Instances.item.config.actions.moreOptions.options[actionName].cB, true);
      });
    },
    submit: {
      defaultSubmit: function (instId, form, action) {
        var formInp = form.querySelector('.send-inp'),
          sendObj = {};
        sendObj.instanceId = instId;
        if (formInp) {
          var powerCheckbox = document.getElementById("block-checkbox");
          sendObj.reason = formInp.value;
          if (typeof powerCheckbox !== 'undefined' && powerCheckbox !== null) {
            sendObj.DoNotPowerOff = powerCheckbox.checked;
          }
        };
        sendPostRequest('#' + form.id, form.action, sendObj, Instances.modal.onSuccess, Instances.modal.onFail);
      },
      bandwidth: function (instId, form) {
        var sendObj = {};
        sendObj.instanceId = instId;
        sendObj.nicId = Instances.modal.config.mSelect.options[Instances.modal.config.mSelect.selectedIndex].dataset.id;
        sendObj.bandwidth = form.querySelector('.send-inp').value;
        sendPostRequest('#' + form.id, form.action, sendObj, Instances.modal.onSuccess, Instances.modal.onFail);
      },
      moveToCustomer: function (form, successFunc, isNeedValidation) {
        var serverId = Instances.item.curInstance.InstanceId,
          toCustomerId = form.querySelector('[name="toCustomerId"]').value,
          curUrl = (isNeedValidation) ? serverId + '/tocustomer/' + toCustomerId + '/validate' : serverId + '/tocustomer/' + toCustomerId,
          requestType = (isNeedValidation) ? 'GET' : 'POST',
          successText = 'Запрос успешно отправлен. Была создана задача по переносу сервера',
          sendObj = {};
        sendObj.serverId = serverId;
        sendObj.toCustomerId = toCustomerId;
        sendPostRequest('#' + form.id, window.util.makeCorrectUrl(curUrl), sendObj, function (data) {
          if (typeof successFunc === 'function') {
            successFunc(data, successText);
          }
        }, Instances.modal.onFail, requestType);
      }
    },
    clear: function () {
      var mConfig = Instances.modal.config;
      mConfig.mInputBlock.innerHTML = '';
      Instances.item.config.curAction = '';
      Instances.modal.curAction = '';
    },
    onSuccess: function (data, text) {
      successPopup('success-pop-up', 'instance-summary', true, text);
      $(Instances.modal.config.mBlock).modal('hide');
      Instances.list.load();
      Instances.modal.clear();
    },
    onFail: function (data) {
      handleAjaxErrors(data, '#' + Instances.modal.config.mFormId);
      Instances.modal.addErrorClass();
    },
    removeErrors: function () {
      var errParentBlock = document.getElementById(Instances.modal.config.mFormId);
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
    },
    showCheckbox: function (msg) {
      var checkbox = document.createElement('input'),
        label = document.createElement('label'),
        span = document.createElement('span');
      label.classList.add('option', 'option-primary');
      span.classList.add('checkbox');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('id', 'confirm-action');
      label.textContent = msg;
      label.insertBefore(span, label.childNodes[0]);
      label.insertBefore(checkbox, label.childNodes[0]);
      return label
    }
  },
  init: function () {
    this.makeCorrectUrl('');
    this.filter.init();
    this.list.load();
    this.item.initButtons();
  }
}
Instances.init();