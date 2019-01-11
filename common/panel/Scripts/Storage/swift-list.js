var c = {
  containerSelector: '.swift__container',
  tableSelector: '#swift-table',
  tableAccountEmptySelector: '.swift__empty-account',
  tableEmptySelector: '.swift__empty',
  itemSelector: '.swift__table-item',
  itemActionsSelector: '.swift__table-actions',
  checkboxItemSelector: '.swift__table .swift__table-item input[type="checkbox"]',
  actionsBlockSelector: '.swift__controls'
};

var storageList = {
  container: document.querySelector(c.containerSelector),
  timezoneOffset: 0,
  table: document.querySelector(c.tableSelector),
  tableAccountEmpty: document.querySelector(c.tableAccountEmptySelector),
  tableEmpty: document.querySelector(c.tableEmptySelector),
  actionsBlock: document.querySelector(c.actionsBlockSelector),
  addFolderItem: document.querySelector(c.addFolderSelector),
  currentLevel: 0,
  currentContainer: '',
  currentContainerIsPublic: false,
  currentContainerHeaders: [],
  currentPath: '',
  currentData: false,

  clear: function () {
    var items = storageList.table.querySelectorAll(c.itemSelector);
    [].forEach.call(items, function (el) {
      storageList.table.removeChild(el);
    });
  },
  loadAccount: function (successHandler) {
    let s = storageList;
    let cb = (typeof successHandler === 'function') ? successHandler : s.prepareContent;
    s.currentData = false;
    swift.getListAccount(function (data) {
      s.currentContainerHeaders = [];
      s.currentContainerIsPublic = false;
      cb(data);
    });
  },
  loadContainerContent: function (loadFunction) {
    let s = storageList;
    s.currentData = false;

    swift.getContainerMetadata(s.currentContainer, function (response) {
      s.currentContainerHeaders = response;
      s.currentContainerIsPublic = response.filter(function (el) {
        return el.indexOf('.r:') > -1;
      }).length > 0;

      if (typeof loadFunction === 'function') {
        loadFunction();
      } else {
        swift.getListContainers(s.currentContainer, s.currentPath, s.prepareContent);
      }
    });
  },
  prepareContent: function (data) {
    let s = storageList;
    let p = s.pagination;
    let resultElems = [];

    if (data.length !== 0) {
      if (!s.currentData) {
        s.currentData = sortData(data);

        if (p.item) {
          p.refreshData(s.currentData);
        } else {
          p.init(s.currentData);
        }
      }
      
      let indexes = getElemIndexes();
      resultElems = s.currentData.slice(indexes.from, indexes.to);
    }

    s.massActions.reset();

    if (s.currentLevel === 0) {
      let allHeadersAreSet = false;
      let interval;

      resultElems.forEach(function (el, i) {
        swift.getContainerMetadata(el.name, function (data) {
          addHeadersInfo(data, el.name);
        });
      });

      interval = setInterval(function () {
        allHeadersAreSet = resultElems.filter(function (el) {
          return typeof el.isPublic === 'undefined';
        }).length === 0;

        if (allHeadersAreSet) {
          s.drawContent(resultElems);
          clearInterval(interval);
        }
      }, 100);
    } else {
      s.drawContent(resultElems);
    }

    function getElemIndexes() {
      let guessTo = p.currentPage * p.currentLimit;

      if (data.length <= guessTo) {
        guessTo = data.length;
      }
      return {
        from: (p.currentPage - 1) * p.currentLimit,
        to: guessTo
      };
    }
    /**
     * Sorts data to following way: first in list will be folders, then sort both folders and files by names
     * @array data - response array from server
     */
    function sortData(data) {
      let dataClean = data.filter(function (el) {
        let isSubdir = typeof el.subdir !== 'undefined';
        if (isSubdir) {
          let subdirName = el.subdir.substr(0, el.subdir.length - 1);

          return data.filter(function (item) {
            return (typeof item.name !== 'undefined' && item.name.indexOf(subdirName) > -1);
          }).length < 1;
        }
        return !isSubdir;
      }); // remove subdirs from response
      dataClean.sort(function(a, b) {
        let isFolderA = a.content_type === 'application/directory' || typeof a.subdir !== 'undefined';
        let isFolderB = b.content_type === 'application/directory' || typeof b.subdir !== 'undefined';
        let isContainerA = typeof a.content_type === 'undefined';

        if (isFolderA && !isFolderB) {
          return -1;
        }
        if (!isFolderA && isFolderB) {
          return 1;
        }
        if ((isFolderA && isFolderB) || isContainerA) {
          if (a.name > b.name) {
            return 1;
          }
          return -1;
        }
        return a.name > b.name;
      });

      return dataClean;
    }

    /**
     * Adds information from container's headers
     * @param {array} data - list of headers receieved from server for container
     * @param {any} name - name of container
     */
    function addHeadersInfo(data, name) {
      let resultItem = resultElems.filter(function (el) { return el.name === name })[0];
      let curDataItem = s.currentData.filter(function (el) { return el.name === name })[0];
      let isPublic = data.filter(function (el) { return el.indexOf('.r:') > -1 }).length > 0;
      
      resultItem.isPublic = isPublic;
      curDataItem.isPublic = isPublic;
      //console.log(data);
    }
  },
  drawContent: function (data) {
    let s = storageList;
    let emptyElem = (s.currentLevel === 0) ? s.tableAccountEmpty : s.tableEmpty;
    let hideElem = (s.currentLevel === 0) ? s.tableEmpty : s.tableAccountEmpty;
    let tableHeaderModify = document.querySelector('.like-table__headers .swift__table-modified');
    let paste = s.massActions.paste;
    s.clear();

    s.container.classList.add('loading', 'loading--full');
    hideElem.classList.add('hidden');

    if (data.length === 0) {
      s.table.classList.add('hidden');
      emptyElem.classList.remove('hidden');
      s.currentData = false;
      s.pagination.refreshData(data);
    } else {
      s.table.classList.remove('hidden');
      emptyElem.classList.add('hidden');

      data.forEach(function (el) {
        s.table.appendChild(new StorageItem(el));
      });
    }

    tableHeaderModify.classList[(s.currentLevel === 0) ? 'add' : 'remove']('invisible');

    setTimeout(function () {
      s.container.classList.remove('loading', 'loading--full');
    }, 300);
  },
  fillActionsBlock: function (actionsObj, actionsBlock, itemName) {
    let options = document.createDocumentFragment();
    let separator = document.createElement('li');
    separator.classList.add('divider');

    Object.keys(actionsObj).forEach(function (el) {
      let action = actionsObj[el];

      if (el === 'link' && !storageList.currentContainerIsPublic) {
        return;
      }

      let li = document.createElement('li');
      let span = document.createElement('span');

      span.classList.add('actions__item', 'actions__item--' + el);
      span.textContent = action.title;

      li.appendChild(span);
      li.addEventListener('click', function (e) {
        e.preventDefault();

        if (storageList.massActions.paste.isInitialized) {
          storageList.massActions.paste.reset();
        }

        action.callback(itemName);
      });

      if (el === 'delete') {
        options.appendChild(separator);
      }

      options.appendChild(li);
    });

    actionsBlock.appendChild(options);
  },
  showTopActions: function () {
    let topActions = storageList.actionsBlock.querySelectorAll('.swift__controls-item');
    [].forEach.call(topActions, function (el) {
      let actionType = el.dataset.actionFor;
      let isAccountLevel = storageList.currentLevel === 0;

      if (typeof actionType !== 'undefined') {
        if (isAccountLevel) {
          el.classList[(actionType === 'container') ? 'add' : 'remove']('hidden');
        } else {
          el.classList[(actionType === 'account') ? 'add' : 'remove']('hidden');
        }
      }
    });
  },
  massActions: {
    elems: {
      btn: document.querySelector('#mass-actions-btn'),
      btnCount: document.querySelector('#mass-actions-count'),
      list: document.querySelector('#mass-actions-list'),
      selectedCount: document.querySelector('#selected-counter'),
      actionsList: document.querySelector('#mass-actions-list'),
      massCheckbox: document.querySelector('#swift-checkbox-all')
    },
    config: {
      'delete': {
        'title': resources.Common_delete,
        'callback': function () { storageList.massActions.deleteItems(); }
      }
    },
    checkedItemNames: [],
    toggleVisibility: function () {
      let s = storageList;
      let m = s.massActions;
      let elements = m.elems;
      let checkedItems = document.querySelectorAll(c.checkboxItemSelector + ':checked');
      let count = checkedItems.length;
      let items = document.querySelectorAll(c.itemSelector);

      elements.selectedCount.textContent = count;

      [].forEach.call(items, function (el) {
        el.querySelector(c.itemActionsSelector + ' .dropdown').classList[(count > 0) ? 'add' : 'remove']('hidden');
      });

      if (count > 0) {
        elements.btnCount.textContent = '(' + count + ')';
        elements.btn.disabled = false;
      } else {
        elements.btnCount.textContent = '';
        elements.btn.disabled = true;
      }
    },
    onChangeCheckbox: function (e) {
      let m = storageList.massActions;
      let checkedArr = m.checkedItemNames;
      let mainCheckbox = m.elems.massCheckbox;
      let checkbox = e.target;
      let allCheckboxes = document.querySelectorAll(c.checkboxItemSelector);
      let allCheckboxesChecked = document.querySelectorAll(c.checkboxItemSelector + ':checked');

      if (checkbox === mainCheckbox) {
        checkedArr.length = 0;
        [].forEach.call(allCheckboxes, function (el) {
          setCheckedStatus(el, mainCheckbox.checked, {
            name: el.dataset.name,
            type: el.dataset.type
          });
        });
      } else {
        mainCheckbox.checked = (allCheckboxes.length === allCheckboxesChecked.length);
        if (checkbox.checked) {
          checkedArr.push({
            name: checkbox.dataset.name,
            type: checkbox.dataset.type
          });
        } else {
          removeFromCheckedArray(checkbox.dataset.name);
        }
      }

      if (m.paste.isInitialized) {
        m.paste.reset();
      }

      storageList.massActions.toggleVisibility();

      function setCheckedStatus(elem, isChecked, obj) {
        elem.checked = isChecked;
        if (isChecked) {
          checkedArr.push(obj);
        }
      }
      function removeFromCheckedArray(name) {
        let length = checkedArr.length;
        let index = -1;

        for (var i = 0; i < length; i++) {
          if (checkedArr[i].name === name) {
            index = i;
            break;
          }
        }

        if (index > -1) {
          checkedArr.splice(index, 1);
        }
      }
    },
    getAdditionalBulkList: function (data) {
      let arr = [];
      data.forEach(function(el) {
        if (typeof el.subdir === 'undefined') {
          arr.push(encodeURIComponent(storageList.currentContainer) + '/' + encodeURIComponent(el.name));
        }
      });
      return arr;
    },
    deleteItems: function () {
      let s = storageList;
      let m = storageList.massActions;
      let isAccount = s.currentLevel === 0;
      let onAllItemsDeleted = (isAccount) ? s.loadAccount : s.loadContainerContent;
      let deleteArr = [];

      let confirm = new ConfirmPopup({
        text: resources.Storage_Delete_Confirm_Text,
        cbProceed: function () {
          if (isAccount) {
            performContainersDeletion();
          } else {
            performObjectsDeletion();
          }
        },
        title: resources.Storage_Delete_Confirm_Title,
        alertText: resources.Shared_Action_Undone
      });
      
      function performContainersDeletion() {
        let result = [];

        m.checkedItemNames.forEach(function (el) {
          result.push(encodeURIComponent(el.name));
        });

        swift.bulkDeleteObjects(result, s.loadAccount);
      }

      function performObjectsDeletion() {
        let result = [];
        let foldersCount = m.checkedItemNames.filter(function (el) { return el.type === 'folder' }).length;
        let processedCount = 0;
        let interval;

        m.checkedItemNames.forEach(function (el) {
          result.push(encodeURIComponent(s.currentContainer) + '/' + encodeURIComponent(s.currentPath + el.name));
          if (el.type === 'folder') {
            swift.getListContainers(s.currentContainer, s.currentPath + el.name + '/', function (data) {
              result = result.concat(m.getAdditionalBulkList(data));
              processedCount++;
            }, null, true);
          }
        });

        interval = setInterval(function () {
          if (processedCount === foldersCount) {
            clearInterval(interval);
            if (result.length > 10000) {
              let notice = new PanelNotice(resources.Storage_Delete_Maximum, 'danger');
              return;
            }
            swift.bulkDeleteObjects(result, s.loadContainerContent);
          }
        }, 300);
        
      }
      
    },
    paste: {
      isInitialized: false,
      copyFromContainer: '',
      copyFromPath: '',
      copyObject: {},
      isMove: false,
      elems: {
        block: document.querySelector('#swift-paste'),
        btnSelector: '#btn-paste'
      },
      performPaste: function (e) {
        e.preventDefault();

        let s = storageList;
        let p = s.massActions.paste;
        let curPath = s.currentContainer + '/' + s.currentPath;
        let fromPath = p.copyFromContainer + '/' + p.copyFromPath;
        let isSameFolder = curPath === fromPath;

        if (isSameFolder) {
          let sameNotice = new PanelNotice(resources.Storage_Paste_Same_Folder);
          return;
        }
        if (s.currentLevel === 0) {
          let sameNotice = new PanelNotice(resources.Storage_Paste_Choose_Container);
          return;
        }

        s.container.classList.add('loading', 'loading--full');

        swift[(p.isMove) ? 'moveObject' : 'copyObject'](p.copyFromContainer, p.copyFromPath, s.currentContainer, s.currentPath, p.copyObject, function () {
          let successNotice = new PanelNotice((p.isMove) ? resources.Storage_Move_Success : resources.Storage_Copy_Success, 'success');
          s.loadContainerContent();
          p.reset();
        });
      },
      reset: function () {
        let p = storageList.massActions.paste;

        p.isInitialized = false;
        p.copyFromContainer = '';
        p.copyFromPath = '';
        p.copyObject = {};
        p.isMove = false;
        p.elems.block.classList.add('hidden');
      },
      init: function (name, isMove) {
        let s = storageList;
        let p = s.massActions.paste;
        let oldBtn = document.querySelector(p.elems.btnSelector);
        let newBtn = oldBtn.cloneNode(true);

        p.isInitialized = true;
        p.copyFromContainer = s.currentContainer;
        p.copyFromPath = s.currentPath;
        p.copyObject = s.currentData.filter(function (el) {
          return (!el.name) ? false : el.name.indexOf(name) > -1;
        })[0];
        p.copyObject.filename = name;
        p.isMove = (isMove === true);
        p.elems.block.replaceChild(newBtn, oldBtn);
        p.elems.block.classList.remove('hidden');

        newBtn.addEventListener('click', p.performPaste);
      }
    },
    reset: function () {
      let s = storageList;
      let elements = s.massActions.elems;
      let checkedArr = s.massActions.checkedItemNames;

      elements.selectedCount.textContent = 0;
      elements.btnCount.textContent = '';
      elements.btn.disabled = true;
      elements.btn.parentNode.classList.remove('open');
      elements.massCheckbox.checked = false;
      checkedArr.length = 0;
    },
    init: function () {
      let s = storageList;
      let m = s.massActions;

      s.fillActionsBlock(m.config, m.elems.actionsList);
      m.elems.massCheckbox.addEventListener('change', m.onChangeCheckbox);
    }
  },
  breadcrumbs: {
    config: {
      container: document.querySelector('.swift__breadcrumbs'),
      itemClass: 'swift__breadcrumbs-item',
      items: false
    },
    add: function (type, name) {
      let c = this.config;
      let s = storageList;
      let item = document.createElement('span');
      let isContainer = type === 'container';

      item.classList.add(c.itemClass);
      item.setAttribute('role', 'button');
      item.textContent = name;

      if (isContainer) {
        item.dataset.goTo = 'container';
      }

      item.addEventListener('click', function (e) {
        s.loadContainerContent(function () {
          params = getLoadParams();
          s.currentPath = params.path;

          swift.getListContainers(s.currentContainer, s.currentPath, function (data) {
            s.currentData = false;
            s.currentLevel = params.level;
            s.pagination.currentPage = 1;
            s.breadcrumbs.removeExcess();
            s.prepareContent(data);
            s.history.add(s.currentContainer, s.currentPath, s.pagination.currentPage);
          });
        });
      });

      c.container.appendChild(item);
      s.breadcrumbs.update();

      function getLoadParams() {
        let pathArr = s.currentPath.split('/').filter(function (el) { return el !== '' });
        let index = pathArr.indexOf(name);
        let newPathArr = pathArr.slice(0, index + 1);
        let newPath = newPathArr.join('/') + '/';

        return {
          path: (isContainer) ? '' : newPath,
          level: (isContainer) ? 1 : index + 2
        }
      }
    },
    removeExcess: function () {
      let s = storageList;
      let b = s.breadcrumbs;
      let index = s.currentLevel + 1;
      let items = b.config.items;
      let length = items.length;

      for (let i = length; i > index; i--) {
        b.config.container.removeChild(items[i - 1]);
      }

      b.update();
    },
    update: function () {
      let c = storageList.breadcrumbs.config;
      c.items = c.container.querySelectorAll('.' + c.itemClass);
    },
    init: function () {
      let s = storageList;
      let b = this;

      b.update();
      b.config.items[0].addEventListener('click', function () {
        s.currentData = false;
        s.loadAccount(function (data) {
          s.currentLevel = 0;
          s.currentPath = '';
          s.currentContainer = '';
          s.pagination.currentPage = 1;
          b.removeExcess();
          s.showTopActions();
          s.prepareContent(data);
          s.history.add(s.currentContainer, s.currentPath, s.pagination.currentPage);
        });
      });
    }
  },
  create: {
    currentType: '',
    input: document.querySelector('#add-folder-input'),
    button: document.querySelector('#btn-add-folder'),
    modal: document.querySelector('#addFolderModal'),
    modalTitle: document.querySelector('#addFolderModalLabel'),
    createEntity: function (e) {
      e.preventDefault();
      let s = storageList;
      let c = s.create;
      let input = c.input;
      let modal = c.modal;
      let validationNameMsg = getNameValidationError(name);

      if (validationNameMsg) {
        errorMessageAdd($(input), validationNameMsg);
        return;
      }
      if (c.currentType === '') {
        throw 'Не указан тип создаваемого объекта';
      }

      if (c.currentType === 'container') {
        swift.createContainer(input.value, {
          'X-Container-Read': (modal.querySelector('#input-type-public').checked) ? '.r:*,.rlistings' : '',
          'X-Container-Meta-Access-Control-Expose-Headers': 'X-Container-Read'
        }, function (data) {
          s.loadAccount();
          $(modal).modal('hide');
          reachCounterGoal('createstorage', 'submit');
        });
      } else {
        swift.createObject(s.currentContainer, s.currentPath + input.value, 'application/directory', function (data) {
          s.loadContainerContent();
          $(modal).modal('hide');
        });
      }

      function getNameValidationError(name) {
        if (input.value === '') {
          return resources.Required;
        }
        if (input.value.length > 256) {
          return resources.Error_Max_Namelength_Exceeded;
        }
        if (input.value.match(/[\/.~^`]/)) {
          return resources.Error_Inappropriate_Symbols;
        }
        return false;
      }
    },
    init: function () {
      let creation = this;
      let input = this.input;
      let button = this.button;
      let modal = this.modal;
      let modalTitle = this.modalTitle;
      let modalContainerType = modal.querySelector('#container-create-type');

      $(modal).on('show.bs.modal', function (e) {
        let target = e.relatedTarget;
        let entity = target.dataset.entity;

        creation.currentType = entity;
        modalTitle.textContent = modalTitle.dataset[entity + 'Text'];
        input.setAttribute('placeholder', input.dataset[entity + 'Placeholder']);

        if (entity === 'container') {
          modalContainerType.classList.remove('hidden');
        }

        if (storageList.massActions.paste.isInitialized) {
          storageList.massActions.paste.reset();
        }
      });

      $(modal).on('shown.bs.modal', function (e) {
        input.focus();
      });

      $(modal).on('hidden.bs.modal', function () {
        input.value = '';
        input.removeAttribute('placeholder');
        modalTitle.textContent = '';
        creation.currentType = '';
        modalContainerType.classList.add('hidden');
        modalContainerType.querySelector('input:first-of-type').checked = true;

        if ($(input).parent().find('.' + errorClass).length > 0) {
          errorMessageRemove($(input));
        }
      });

      button.addEventListener('click', this.createEntity);
    }
  },
  pagination: {
    item: false,
    currentLimit: 25,
    currentPage: 1,
    init: function (data) {
      let s = storageList;
      let p = s.pagination;
      if (typeof p.currentPage === 'undefined' || p.currentPage > Math.ceil(data.length / p.currentLimit)) {
        p.currentPage = 1;
        s.history.replace(s.currentContainer, s.currentPath, 1);
      }
      this.item = new StoragePagination(data.length, p.currentLimit, p.update, p.currentPage);
    },
    refreshData: function (data) {
      let s = storageList;
      let p = storageList.pagination;
      if (p.item) {
        if (location.search.indexOf('&page') === -1) {
          p.currentPage = 1;
        }
        p.item.refresh(data.length, p.currentPage);
      }
    },
    update: function (page) {
      let s = storageList;
      s.pagination.currentPage = page;
      s.prepareContent(s.currentData);
      s.history.add(s.currentContainer, s.currentPath, page);
    }
  },
  history: {
    basePath: location.origin + location.pathname,
    add: function (containerName, path, page) {
      let s = storageList;
      let h = s.history;
      let p = s.pagination;

      let queryPath = (containerName === '') ? '' : '?path=' + s.currentContainer + '/' + s.currentPath;
      let queryPage = (page === 1) ? '' : '&page=' + page;

      if (typeof window.history.pushState === 'function') {
        window.history.pushState({
          container: containerName,
          path: path,
          page: page
        }, document.title, s.history.basePath + queryPath + queryPage);
      }
    },
    replace: function (containerName, path, page) {
      let s = storageList;
      let p = s.pagination;
      let queryPath = (containerName === '') ? '' : '?path=' + s.currentContainer + '/' + s.currentPath;
      let queryPage = (page === 1) ? '' : '&page=' + p.currentPage;

      window.history.replaceState({
        container: containerName,
        path: path,
        page: page
      }, document.title, s.history.basePath + queryPath + queryPage);
    },
    init: function (cbInit) {
      let s = storageList;
      let h = s.history;
      let requestParams = window.util.getRequestParams();
      let containerName, path, page;

      if (requestParams && typeof requestParams.path !== 'undefined') {
        containerName = requestParams.path.split('/').filter(function (el) { return el !== '' })[0];
        path = requestParams.path.replace(containerName + '/', '');
        page = (typeof requestParams.page !== 'undefined' && !isNaN(parseInt(requestParams.page))) ? parseInt(requestParams.page) : 1;

        s.pagination.currentPage = page;

        swift.getListContainers(containerName, path, function () {
          loadContentFromHistory(containerName, path, page);
          h.replace(containerName, path, page);
        }, function () {
          loadHistoryDefault();
        });
      } else {
        loadHistoryDefault();
      }

      cbInit();

      window.addEventListener('popstate', function (e) {
        if (e.state && typeof e.state.container !== 'undefined') {
          loadContentFromHistory(e.state.container, e.state.path, e.state.page);
        }
      });

      function loadHistoryDefault() {
        h.replace('', '', 1);
        s.loadAccount();
      }
      function loadContentFromHistory(containerName, path, page) {
        let b = s.breadcrumbs;
        let isAccount = containerName === '';
        let pathArr = path.split('/').filter(function (el) { return el !== '' });

        s.currentContainer = (isAccount) ? '' : containerName;
        s.currentPath = path;
        s.currentLevel = (isAccount) ? 0 : pathArr.length + 1; // if data exists add one level, 'coz we already have container name
        s.pagination.currentPage = page;

        if (isAccount) {
          s.loadAccount();
        } else {
          s.loadContainerContent();
        }

        if (b.config.items) {
          [].forEach.call(b.config.items, function (el) {
            if (el.dataset.goTo !== 'account') {
              b.config.container.removeChild(el);
            }
          });
        }
        if (!isAccount) {
          b.add('container', containerName);
          pathArr.forEach(function (el) {
            b.add('folder', el);
          });
        }
        b.update();

        s.showTopActions();
      }
      
    }
  },
  init: function () {
    let s = storageList;
    let date = new Date();

    document.querySelector('#swift-dashboard-no-token').classList.add('hidden');
    document.querySelector('#swift-dashboard-active').classList.remove('hidden');

    s.timezoneOffset = date.getTimezoneOffset() * 60000; // get offset in milliseconds
    s.history.init(function () {
      s.showTopActions();
      s.massActions.init();
      s.breadcrumbs.init();
    });
    s.create.init();
    storageUpload.init();
  },
  showDefault: function (data) {
    var isBlockedByAdmin = JSON.parse(data.response).BlockedByAdmin;

    document.querySelector('#swift-dashboard-active').classList.add('hidden');

    if (data.status === 403) {
      document.querySelector((isBlockedByAdmin) ? '#swift-dashboard-blocked-by-admin' : '#swift-dashboard-blocked-by-balance').classList.remove('hidden');
      
      return;
    }
    document.querySelector('#swift-dashboard-no-token').classList.remove('hidden');
  }
};

var swift = new Swift(swiftOptions, storageList.init, storageList.showDefault); // swiftOptions are defined in Index view
