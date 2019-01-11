/*
 * storageList is defined in swift-list.js
 */
var StorageItem = function (data) {
  var actionsConfig = {
    'container': {
      /*
      'getMetadata': {
        'title': 'Просмотреть метаданные',
        'callback': showContainerMetadata
      },*/
      'edit': {
        'title': resources.Shared_Edit,
        'callback': editContainerSettings
      },
      'delete': {
        'title': resources.Common_delete,
        'callback': deleteContainer
      }
    },
    'folder': {
      /*'download': {
        'title': resources.Shared_BtnDownload,
        'callback': defaultCallback
      },*/
      'delete': {
        'title': resources.Common_delete,
        'callback': deleteFolder
      }
    },
    'file': {
      'rename': {
        'title': resources.Shared_Rename,
        'callback': renameObject
      },
      /*'unshare': {
        'title': resources.Storage_Unshare,
        'callback': defaultCallback
      },*/
      'copy': {
        'title': resources.Common_copy,
        'callback': copyObject
      },
      'move': {
        'title': resources.Shared_Move,
        'callback': moveObject
      },
      'download': {
        'title': resources.Shared_BtnDownload,
        'callback': downloadObject
      },
      'link': {
        'title': resources.Storage_Get_Direct_Link,
        'callback': getDirectLink
      },
      'delete': {
        'title': resources.Common_delete,
        'callback': deleteObject
      }
    }
  };
  
  this.getItem = function (data) {
    let tpl = document.getElementById('storage-item-tpl'),
      tplContainer = 'content' in tpl ? tpl.content : tpl,
      newItem = tplContainer.querySelector('.swift__table-item').cloneNode(true),
      itemNameElem = newItem.querySelector('.swift__name'),
      itemName = getItemName(data),
      itemActions = newItem.querySelector('.swift__table-actions .actions'),
      itemType = getItemType(data),
      itemSize = (itemType === 'folder') ? '-' : getSize(data.bytes),
      itemCheckbox = newItem.querySelector('input[type="checkbox"]'),
      itemDateModified;

    let s = storageList;

    itemNameElem.dataset.type = itemType;
    itemNameElem.dataset.name = itemName;
    newItem.querySelector('.swift__name-text').textContent = itemName;
    itemNameElem.classList.add('swift__name--' + itemType);

    if (itemType === 'container') {
      if (data.isPublic) {
        itemNameElem.classList.add('swift__name--shared');
        itemNameElem.setAttribute('title', 'Публичный контейнер ' + itemName);
      } else {
        itemNameElem.setAttribute('title', 'Приватный контейнер ' + itemName);
      }
    }
    
    if (itemSize.value) {
      newItem.querySelector('.size-value').textContent = itemSize.value;
      newItem.querySelector('.size-measure').textContent = itemSize.measure;
    } else {
      newItem.querySelector('.size-value').textContent = itemSize;
    }

    if (typeof data.last_modified !== 'undefined') {
      let tempDate = new Date(data.last_modified);
      itemDateModified = new Date(tempDate.getTime() - s.timezoneOffset);

      newItem.querySelector('.swift__table-modified').textContent = itemDateModified.toLocaleDateString() + ' ' + itemDateModified.toLocaleTimeString();
    }

    setItemLink(itemNameElem, data, itemType);
    setItemId(itemName);
    s.fillActionsBlock(actionsConfig[(itemType === 'container' || itemType === 'folder') ? itemType : 'file'], itemActions, itemName);
    itemCheckbox.addEventListener('change', storageList.massActions.onChangeCheckbox);

    return newItem;

    function getItemName(elem) {
      if (typeof elem.subdir !== 'undefined') {
        return elem.subdir.replace('/', '');
      } else {
        return (storageList.currentPath !== '') ? elem.name.replace(storageList.currentPath, '') : elem.name;
      }
    }
    function setItemLink(elem, data, type) { // type possibly wil need for different links for folders & files clicking
      if (type === 'folder' || type === 'container') {
        elem.href = '/' + itemName;
        elem.addEventListener('click', folderClickHandler);
      }
    }
    function setItemId(name) {
      let checkbox = newItem.querySelector('input[type="checkbox"]');
      let label = newItem.querySelector('label');
      let actions = newItem.querySelector('.swift__btn-actions');
      let cleanName = name.replace(' ', '').replace('.', '').toLowerCase();

      newItem.dataset.id = name;
      checkbox.id = checkbox.id.replace('0', cleanName);
      checkbox.dataset.name = name;
      checkbox.dataset.type = itemType;
      label.setAttribute('for', checkbox.id);
      actions.id = actions.id.replace('0', cleanName);
    }
    function getSize(size) {
      let val = size;
      let measArray = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
      let measIndex = 0;

      while (val / 1024 > 1) {
        val = val / 1024;
        measIndex++;
      }

      return {
        value: val.toFixed(2),
        measure: measArray[measIndex]
      };
    }
    function getItemType(elem) {
      let type = elem.content_type;

      if (typeof elem.subdir !== 'undefined') {
        return 'folder';
      }
      if (typeof type === 'undefined') {
        return 'container';
      }
      if (type.indexOf('image') > -1) {
        return 'image';
      }
      switch (type) {
        case 'application/directory':
          return 'folder';
        default:
          return 'file';
      }
    }
    
    function folderClickHandler(e) {
      e.preventDefault();
      e.stopPropagation();
      let s = storageList;
      let path = '';

      if (itemType === 'container') {
        s.currentContainer = itemNameElem.dataset.name;
      } else {
        s.currentPath += (itemNameElem.dataset.name + '/');
        path = s.currentPath;
      }

      storageList.loadContainerContent(function () {
        swift.getListContainers(s.currentContainer, path, function (data) {
          s.currentData = false;
          s.currentLevel++;
          s.prepareContent(data);
          s.showTopActions();
          s.breadcrumbs.add(itemType, itemName);
          s.history.add(s.currentContainer, s.currentPath, s.pagination.currentPage);
        });
      });
    }
  };

  return this.getItem(data);

  /* ACTIONS FUNCTIONS */

  function defaultCallback(e) {
    console.log('callback fired! ' + e.target.textContent);
  };

  /* CONTAINER */
  function editContainerSettings(name) {
    let s = storageList;
    let item = s.currentData.filter(function (el) {
      return el.name === name;
    })[0];
    let m = document.querySelector('#edit-container-modal');
    let mTitle = m.querySelector('#edit-container-title');
    let mType = m.querySelector('#edit-container-type');
    let mTypeWarning = m.querySelector('#edit-container-to-private-warning');
    let mTypePublic = m.querySelector('#edit-container-public');
    let mBtn = m.querySelector('#edit-container-btn');

    mTitle.textContent = name;
    mType.querySelector((item.isPublic) ? '#edit-container-public' : '#edit-container-private').checked = true;
    
    if (item.isPublic) {
      watchContainerTypeChangeToPrivate();
    }

    mBtn.addEventListener('click', sendEditRequest);
    $(m).modal('show');

    $(m).on('hidden.bs.modal', function () {
      mBtn.removeEventListener('click', sendEditRequest);
      mTypeWarning.classList.add('hidden');
    });
    
    function sendEditRequest(e) {
      e.preventDefault();

      swift.getContainerMetadata(name, function (response) {
        let headersToSet = getHeadersObj();
        let exposeHeaders = getExposeHeaders(response);

        exposeHeaders = addExposeHeader(exposeHeaders, 'X-Container-Read');
        headersToSet['X-Container-Meta-Access-Control-Expose-Headers'] = exposeHeaders;

        swift.setContainerMetadata(name, headersToSet, function () {
          s.loadAccount();
          $(m).modal('hide');

          let successNotice = new PanelNotice('Настройки контейнера <strong>' + name + '</strong> успешно изменены', 'success');
        });
      });
    }

    function getExposeHeaders(headersArr) {
      let exposeHeader = 'x-container-meta-access-control-expose-headers: ';
      let exposeHeaderValue = '';

      headersArr.forEach(function (el) {
        if (el.indexOf(exposeHeader) > -1) {
          exposeHeaderValue = el.replace(exposeHeader, '');
        }
      });

      return exposeHeaderValue;
    }

    function addExposeHeader(exposeHeadersString, headerName) {
      if (exposeHeadersString.indexOf(headerName) === -1) {
        if (exposeHeadersString === '') {
          exposeHeadersString += headerName;
        } else {
          exposeHeadersString += (', ' + headerName);
        }        
      }
      return exposeHeadersString;
    }

    function getHeadersObj() {
      let obj = {};

      obj['X-Container-Read'] = (mTypePublic.checked) ? '.r:*,.rlistings' : '';

      return obj;
    }

    function watchContainerTypeChangeToPrivate() {
      let radios = mType.querySelectorAll('[name="container-edit-type"]');

      [].forEach.call(radios, function (elem) {
        elem.addEventListener('change', function () {
          mTypeWarning.classList[(elem.value === 'private') ? 'remove' : 'add']('hidden');
        });
      });
    }
  }
  function deleteContainer(name) {
    let s = storageList;
    let objectName = name;
    let objectData = s.currentData.filter(function (el) {
      return el.name === name;
    })[0];

    if (objectData.count > 0) {
      let warning = new PanelNotice('<strong>' + name + '</strong> - ' + resources.Storage_Container_Delete_Warning, 'warning');
      return;
    }

    swift.deleteObject(s.currentContainer, objectName, function () {
      s.loadAccount();
      let notice = new PanelNotice(resources.Storage_Container_Delete_Success.replace('defaultContainerName', name), 'success');
    });
  }

  /* FOLDER */
  function deleteFolder(name) {
    let s = storageList;
    
    swift.getListContainers(s.currentContainer, s.currentPath + name + '/', deleteFolderObjects, null, true);

    function deleteFolderObjects(data) {
      let deleteArr = data.map(function (el) {
        return encodeURIComponent(s.currentContainer) + '/' + encodeURIComponent(el.name);
      });

      deleteArr.push(encodeURIComponent(s.currentContainer) + '/' + s.currentPath + name);

      if (deleteArr.length > 10000) {
        let notice = new PanelNotice(resources.Storage_Delete_Maximum, 'danger');
        return;
      }

      let confirm = new ConfirmPopup({
        text: resources.Storage_Delete_Confirm_Folder,
        cbProceed: function () {
          swift.bulkDeleteObjects(deleteArr, s.loadContainerContent);
        },
        title: resources.Storage_Delete_Confirm_Title,
        alertText: resources.Shared_Action_Undone
      });
    }
  }
  
  /* OBJECT */
  function deleteObject(name) {
    let s = storageList;
    let objectName = s.currentPath + name;
    
    swift.deleteObject(s.currentContainer, objectName, function () {
      s.loadContainerContent();
      let notice = new PanelNotice('Объект успешно удален', 'success');
    });
  }

  function downloadObject(name) {
    let s = storageList;
    let xhr = swift.createSimpleRequest('GET', s.currentContainer + '/' + s.currentPath + name);

    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (this.status === 200) {
        let filename = name;
        let type = xhr.getResponseHeader('Content-Type');

        let blob = new File([this.response], { type: type });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
          window.navigator.msSaveBlob(blob, filename);
        } else {
          let URL = window.URL || window.webkitURL;
          let downloadUrl = URL.createObjectURL(blob);

          if (filename) {
            let a = document.createElement("a");
            if (typeof a.download === 'undefined') {
              window.location = downloadUrl;
            } else {
              a.href = downloadUrl;
              a.className = 'hidden';
              a.download = filename;
              document.body.appendChild(a);
              a.click();
            }
          } else {
            window.location = downloadUrl;
          }

          setTimeout(function () {
            URL.revokeObjectURL(downloadUrl);
          }, 100); // cleanup
        }
      }
      s.container.classList.remove('loading', 'loading--full');
    };
    xhr.onerror = function () {
      s.container.classList.remove('loading', 'loading--full');
    }

    xhr.send();
    s.container.classList.add('loading', 'loading--full');
  }

  function copyObject(name) {
    storageList.massActions.paste.init(name);
  };
  function moveObject(name) {
    storageList.massActions.paste.init(name, true);
  };

  function renameObject(name) {
    let s = storageList;
    let copyObj = s.currentData.filter(function (el) {
      return (!el.name) ? false : el.name.indexOf(name) > -1;
    })[0];
    let nameElem = document.querySelector('.swift__name[data-name="' + name + '"]');
    let inputBlock;

    if (nameElem === null) {
      return;
    }

    inputBlock = new InlineEdition(nameElem, name, performRename);

    function performRename(newName) {
      if (newName === name) {
        inputBlock.close();
        return;
      }
      if (copyObj) {
        copyObj.filename = name;
        nameElem.parentNode.classList.add('loading', 'loading--full');
        swift.renameObject(s.currentContainer, s.currentPath, copyObj, newName, s.loadContainerContent);
      }
    }
  }

  function getDirectLink(name) {
    let s = storageList;
    let link = swift.getLinkToObject(s.currentContainer, s.currentPath + name);
    let linkId = 'swift-copy-link';
    let linkHtml = link + '<span class="copy-btn" id="' + linkId + '" data-clipboard-text="' + link + '">' + resources.Common_copy + '</span>';

    let showBlock = new ConfirmPopup({
      text: linkHtml,
      cbProceed: function () {
        return;
      },
      title: resources.Storage_Get_Direct_Link_Title,
      isOnlyProceed: true,
      proceedText: 'OK'
    });
    
    initClipboardButtons('#' + linkId);
  }
  
};
