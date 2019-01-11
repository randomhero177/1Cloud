var storageUpload = {
  config: {
    tplId: 'storage-upload-tpl',
    tpl: null,
    input: document.querySelector('#swift-files'),
    dropzone: document.querySelector('#swift-dropzone'),
    modal: {
      block: document.querySelector('#addFilesModal'),
      title: document.querySelector('#addFilesModal #addFilesModalLabel'),
      body: document.querySelector('#addFilesModal .modal-body'),
      btnUpload: document.querySelector('#addFilesModal #upload-start'),
      actions: document.querySelector('#addFilesModal #upload-actions'),
      status: document.querySelector('#addFilesModal #upload-status')
    },
    process: {
      classBlock: 'swift__upload',
      classProcess: 'swift__upload-process',
      classTitle: 'swift__upload-title',
      classBtn: 'swift__upload-btn'
    }
  },
  items: [],
  itemsUploaded: 0,
  isLoading: false,
  changeInput: function (e) {
    e.preventDefault();

    if (storageList.currentLevel === 0) return;
    storageUpload.setItems(storageUpload.config.input.files);
  },
  setItems: function (files) {
    let u = storageUpload;
    let m = u.config.modal;
    let p = u.config.process;

    if (files.length > 0) {
      [].forEach.call(files, function (file) {
        setItem(file, file.name);
      });

      $(m.block).modal('show');
    }

    function setItem(file, name) {
      let uploadBlock;
      let request = getUploadRequest(file);

      m.body.appendChild(getUploadBlock(file));
      uploadBlock = m.body.querySelector('.' + p.classBlock + '[data-name="' + name + '"]');

      u.items.push({
        file: file,
        xhr: request
      });

      function getUploadBlock(file) {
        let fragment = u.config.tpl.cloneNode(true);
        let p = u.config.process;
        let block = fragment.querySelector('.' + p.classBlock);

        block.dataset.name = file.name;
        block.querySelector('.' + p.classTitle).textContent = file.name;
        block.querySelector('.' + p.classBtn).addEventListener('click', u.removeFromUploadList);

        return fragment;
      }
      function getUploadRequest(file) {
        let request;

        request = swift.createSimpleRequest('PUT', '/' + encodeURIComponent(storageList.currentContainer) + '/' + encodeURIComponent(storageList.currentPath + file.name) + swift.formatPostfix);
        request.onload = request.onerror = function () {
          if (request.status == 200 || request.status == 201) {
            setUploadProgress(100);
          }
          else {
            showProgressError('Ошибка загрузки: ' + request.status + ' ' + request.statusText);
          }
          manageUploadSuccess();
        };

        request.onabort = function () {
          showProgressError('Загрузка файла ' + file.name + ' отменена');
          manageUploadSuccess();
        };

        request.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var percentLoaded = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentLoaded - 1); // for setting success status only when we reach "loaded" status
          }
        };

        return request;
      }
      function setUploadProgress(percent) {
        let progressBlock = uploadBlock.querySelector('.' + p.classProcess);
        progressBlock.style = 'width:' + percent + '%';

        if (percent === 100) {
          uploadBlock.classList.add(p.classBlock + '--success');
        }
      }
      function showProgressError(statusText) {
        setUploadProgress(0);
        uploadBlock.classList.add(p.classBlock + '--error');
        uploadBlock.setAttribute('title', statusText);
      }
      function manageUploadSuccess() {
        u.itemsUploaded++;
        if (u.items.length === u.itemsUploaded) {
          let status = (m.body.querySelectorAll('.' + p.classBlock + '--error').length > 0) ? 'danger' : 'success';

          if (status === 'success') {
            $(m.block).modal('hide');
            let successNotice = new PanelNotice(m.status.dataset[status], status);
          } else {
            m.title.textContent = m.title.dataset.uploadCompleteText;
            m.actions.classList.add('hidden');

            m.status.textContent = m.status.dataset[status];
            m.status.classList.add('alert-' + status);
            m.status.classList.remove('hidden');
          }
        }
      }
    }
  },
  removeFromUploadList: function(e) {
    e.preventDefault();
    let u = storageUpload;
    let m = u.config.modal;
    let uploadBlock = e.target.parentNode;
    let name = uploadBlock.dataset.name;
    let index = u.getUploadingItemIndex(name);
    
    m.body.removeChild(uploadBlock);
    u.items.splice(index, 1);
    if (u.items.length === 0) {
      $(m.block).modal('hide');
    }
  },
  startUploading: function (e) {
    e.preventDefault();
    let u = storageUpload;

    if (u.items.length > 0 && !u.isLoading) {
      u.items.forEach(function (el) {
        swift.uploadObject(el.file, el.xhr);
        changeAbortListeners(el.file.name);
      });
      u.config.modal.btnUpload.disabled = true;
      u.isLoading = true;
    }

    function changeAbortListeners(filename) {
      let u = storageUpload;
      let m = u.config.modal;
      let p = u.config.process;
      let btn = m.body.querySelector('.' + p.classBlock + '[data-name="' + filename + '"] .' + p.classBtn);
      btn.removeEventListener('click', u.removeFromUploadList);
      btn.addEventListener('click', u.abortItemUploading);
    }
  },
  abortItemUploading: function (e) {
    e.preventDefault();
    let u = storageUpload;
    let m = u.config.modal;
    let uploadBlock = e.target.parentNode;
    let name = uploadBlock.dataset.name;
    let index = u.getUploadingItemIndex(name);

    u.items[index].xhr.abort();
  },
  getUploadingItemIndex: function (filename) {
    let u = storageUpload;
    let length = u.items.length;
    let index = 0;
    for (let i = 0; i < length; i++) {
      if (u.items[i].file.name === filename) {
        index = i;
        break;
      }
    }
    return index;
  },
  dragdrop: {
    classActive: 'swift__container--active',
    onDragEnter: function (e) {
      e.preventDefault();
      if (storageList.currentLevel === 0) return;

      storageUpload.config.dropzone.classList.add(storageUpload.dragdrop.classActive);
    },
    onDragLeave: function (e) {
      e.preventDefault();

      if (storageList.currentLevel === 0) return;
      let classes = e.target.className;
      if (classes.indexOf('swift__') === -1 || classes.indexOf('swift__container') > -1) {
        storageUpload.config.dropzone.classList.remove(storageUpload.dragdrop.classActive);
      }
    },
    onDragOver: function (e) {
      e.preventDefault();
    },
    onDragEnd: function (e) {
      e.preventDefault();

      if (storageList.currentLevel === 0) return;
      let dt = e.dataTransfer;
      if (dt.items) {
        [].forEach.call(dt.items, function (item) {
          dt.items.remove(item);
        });
      } else {
        e.dataTransfer.clearData();
      }
    },
    onDrop: function (e) {
      e.preventDefault();

      if (storageList.currentLevel === 0) return;
      let dt = e.dataTransfer;
      let files = [];

      if (dt.items) {
        [].forEach.call(dt.items, function (el) {
          if (el.kind === 'file') {
            files.push(el.getAsFile());
          }
        });
      } else {
        files = dt.files;
      }
      storageUpload.setItems(files);
      storageUpload.config.dropzone.classList.remove(storageUpload.dragdrop.classActive);
    },
    init: function () {
      let u = storageUpload;
      let zone = u.config.dropzone;
      let d = u.dragdrop;

      if (zone) {
        zone.addEventListener('dragenter', d.onDragEnter);
        zone.addEventListener('dragleave', d.onDragLeave);
        zone.addEventListener('dragover', d.onDragOver);
        zone.addEventListener('dragend', d.onDragEnd);
        zone.addEventListener('drop', d.onDrop);
      }
    }
  },
  clear: function () {
    let u = storageUpload;
    let m = u.config.modal;
    let i = u.config.input;

    while (m.body.firstChild) {
      m.body.removeChild(m.body.firstChild);
    }
    i.value = '';
    m.title.textContent = m.title.dataset.uploadText;

    if (u.isLoading) {
      u.items.forEach(function (el) {
        el.xhr.abort();
      });
    }

    u.items.length = 0;
    u.itemsUploaded = 0;
    u.isLoading = false;

    m.btnUpload.disabled = false;
    m.actions.classList.remove('hidden');
    m.status.classList.remove('alert-success', 'alert-danger');
    m.status.classList.add('hidden');
  },
  init: function () {
    let u = storageUpload;
    let m = u.config.modal;
    let template = document.getElementById(u.config.tplId);

    if (!template) {
      throw 'Нет элемента для добавления файлов';
    }
    u.config.tpl = 'content' in template ? template.content : template;

    u.config.input.addEventListener('change', u.changeInput);
    m.btnUpload.addEventListener('click', u.startUploading);

    $(m.block).on('show.bs.modal', function () {
      if (storageList.massActions.paste.isInitialized) {
        storageList.massActions.paste.reset();
      }
    });

    $(m.block).on('hidden.bs.modal', function () {
      let uploadedElems = m.body.querySelectorAll('.' + u.config.process.classBlock + '--success');
      let isNeedReload = uploadedElems.length > 0;
      u.clear();

      if (isNeedReload) {
        storageList.currentData = false;
        storageList.loadContainerContent();
      }
    });

    u.dragdrop.init();
  }
};