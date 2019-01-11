'use strict';

// var networkLinks is defined in Index view

var Networks = {
  config: {
    filterFormId: 'networks-filter',
    networksContainerId: 'networks',
    networksListId: 'networks-table'
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Networks.list.load();
    },
    init: function () {
      Networks.filter.obj = new Filter(Networks.config.filterFormId, Networks.filter.submit);
      Networks.filter.obj.init();

      var config = Networks.filter.config;
      config.form = document.getElementById(Networks.config.filterFormId);
    }
  },
  loading: {
    toggle: function (isLoaded) {
      var elem = document.getElementById(Networks.config.networksContainerId).parentNode;

      elem.classList[(isLoaded) ? 'remove' : 'add']('loading', 'loading--full');
    }
  },
  list: {
    /*
     * Loads networks list due to filter values
     */
    load: function () {
      $.get(networkLinks.List, Networks.filter.obj.getFilterObj(), function (data) {
        Networks.list.drawNetworksList(data);
      }).fail(function (data) {
        handleAjaxErrors(data);
        console.log('Error getting networks');
      });
    },
    /*
     * Draw networks table due to server's response
     * @obj data - object from server with network objects list
     */
    drawNetworksList: function (data) {

      var container = document.getElementById(Networks.config.networksContainerId),
        table = document.getElementById(Networks.config.networksListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.networks__row-list');

      Networks.loading.toggle();

      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            list.appendChild(Networks.list.drawSingleNetwork(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');
        } else {
          table.classList.add('hidden');
          noResults.classList.remove('hidden');
        }

        Networks.loading.toggle(true);
      }, 400);

    },
    /*
        * Returns DOM object of a single network item
        * @number index - index of a single network object in a networks list
        * @obj network - object of a single network data
    */
    drawSingleNetwork: function (index, network) {
      var tpl = document.getElementById('networks-row-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true);

      elem.dataset.id = network.Id;
      window.util.fillDetalization('networks-row-template', network, elem);
      setNetworkActionListeners();

      return elem;

      function setNetworkActionListeners() {
        var triggerDetails = elem.querySelector('.networks-preview'),
          triggerUpdate = elem.querySelector('.networks-update'),
          triggerDelete = elem.querySelector('.networks-delete');

        var type = network.Type,
          state = network.State;

        var isActionsAvailable = ((type === 'PublicShared' || type === 'PublicSharedIPv6') && state === 'Active') || (type === 'PublicClient' && (state === 'Active' || state === 'InPool'));
        
        triggerDetails.addEventListener('click', function (e) {
          e.preventDefault();
          Networks.item.initDetailsModal(network.Id);
        });

        if (isActionsAvailable) {
          triggerUpdate.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            Networks.item.initUpdateModal(network);
          });
          triggerDelete.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            Networks.item.initDeleteModal(network.Id);
          });
        } else {
          triggerUpdate.parentNode.removeChild(triggerUpdate);
          triggerDelete.parentNode.removeChild(triggerDelete);
        }
      }
    }
  },
  item: {
    fillNetworkInfo: function (networkDetails, infoBlockId) {
      window.util.fillDetalization(infoBlockId, networkDetails);
      window.util.fillDetalizationLinks(infoBlockId, networkDetails.Links);
    },

    initDetailsModal: function (networkId) {
      var item = Networks.item;
      var modal = Networks.modal;

      Networks.loading.toggle();

      $.get(networkLinks.Details.replace('-1', networkId), function (data) {
        item.fillNetworkInfo(data, modal.detailsSummary.id);
        $(modal.details).modal('show');

        setTimeout(function () { // For esthetic purposes
          Networks.loading.toggle(true);
        }, 200);
      }).fail(function (data) {
        console.log('Error loading network');
        handleAjaxErrors(data);
        Networks.loading.toggle(true);
      });
    },

    initUpdateModal: function (networkDetails) {
      var item = Networks.item;
      var m = Networks.modal;
      var type = networkDetails.Type;
      var form = m.updateForm;
      var rows = form.querySelectorAll('.network__update-row');

      form.dataset.action = (type === 'PrivateClient') ? networkLinks.UpdatePrivate.replace('-1', networkDetails.Id) : networkLinks.UpdatePublic.replace('-1', networkDetails.Id);
      form.dataset.type = type;

      m.update.querySelector('#modal-update-network-id').textContent = networkDetails.Id;
      item.fillNetworkInfo(networkDetails, form.id);
      
      form.querySelector('[name="NetworkCidr"]').value = networkDetails.CIDR;
      form.querySelector('[name="VcloudName"]').value = networkDetails.VcloudName;

      if (networkDetails.EdgeExternalIp) {
        form.querySelector('[name="EdgeExternalIp"]').value = networkDetails.EdgeExternalIp;
      }

      if (networkDetails.EdgeVcloudName) {
        form.querySelector('[name="EdgeVcloudName"]').value = networkDetails.EdgeVcloudName;
      }

      if (networkDetails.VcenterName) {
        form.querySelector('[name="VcenterName"]').value = networkDetails.VcenterName;
      }
      
      form.querySelector('[name="IsEnabledForConnections"]').checked = networkDetails.IsEnabledForConnections === true;

      [].forEach.call(rows, function (el) {
        var isVisible = el.dataset.for.indexOf(type) > -1;
        el.classList[(isVisible) ? 'remove' : 'add']('hidden');
      });

      $(m.update).modal('show');
    },

    initDeleteModal: function (networkId) {
      var m = Networks.modal;

      m.deleteForm.dataset.action = networkLinks.Delete.replace('-1', networkId);
      m.delete.querySelector('#modal-delete-network-id').textContent = networkId;
      $(m.delete).modal('show');
    }
  },
  modal: {
    details: document.getElementById('modal-summary'),
    detailsSummary: document.getElementById('networks-summary'),
    delete: document.getElementById('modal-delete'),
    deleteForm: document.getElementById('networks-delete-form'),
    update: document.getElementById('modal-update'),
    updateForm: document.getElementById('networks-update-form'),
    create: document.getElementById('modal-create'),
    createForm: document.getElementById('networks-create-form'),

    performUpdate: function (e) {
      e.preventDefault();
      var m = Networks.modal,
        form = m.updateForm,
        url = form.dataset.action,
        type = form.dataset.type,
        postObj = {};

      var models = {
        'PrivateClient': ['NetworkCidr', 'VcloudName'],
        'PublicClient': ['NetworkCidr', 'VcloudName', 'VcenterName', 'EdgeExternalIp', 'EdgeVcloudName'],
        'PublicShared': ['NetworkCidr', 'VcloudName', 'VcenterName', 'IsEnabledForConnections'],
        'PublicSharedIPv6': ['NetworkCidr', 'VcloudName', 'VcenterName', 'IsEnabledForConnections']
      };

      if (!url) {
        throw new Error('Wrong update url!');
      }

      models[type].forEach(function (el) {
        var node = form.querySelector('[name="' + el + '"]');

        if (node) {
          postObj[el] = (node.type === 'checkbox') ? node.checked : node.value;
        }        
      });

      sendPostRequest('#' + form.id, url, postObj, function () {
        $(m.update).modal('hide');
        form.reset();
        Networks.list.load();
      });
    },

    performDelete: function (e) {
      e.preventDefault();
      var m = Networks.modal,
        form = m.deleteForm,
        url = form.dataset.action,
        confirm = form.querySelector('#IsConfirmed');

      if (!url) {
        throw new Error('Wrong delete url!');
      }

      if (!confirm.checked) {
        errorMessageAdd($(confirm), textRequiredConfirm);
        return;
      }

      sendPostRequest('#' + form.id, url, {}, function () {
        $(m.delete).modal('hide');
        form.reset();
        Networks.list.load();
      }, null, 'DELETE');
    },

    performCreate: function (e) {
      e.preventDefault();
      var m = Networks.modal,
        form = m.createForm,
        url = networkLinks.Create,
        type = form.querySelector('#Create_NetworkType').value;


      sendPostRequest('#' + form.id, url, {
        NetworkType: type,
        PartnerId: form.querySelector('#Create_PartnerId').value,
        DcLocationId: form.querySelector('#Create_DcLocationId').value,
        VdcId: form.querySelector('#Create_VdcId').value,
        NetworkCidr: form.querySelector('#Create_NetworkCidr').value,
        VcloudName: form.querySelector('#Create_VcloudName').value,
        EdgeExternalIp: form.querySelector('#Create_EdgeExternalIp').value,
        EdgeVcloudName: form.querySelector('#Create_EdgeVcloudName').value,
        VcenterName: form.querySelector('#Create_VcenterName').value,
        IsEnabledForConnections: (type === 'PublicShared' || type === '1' || type === 'PublicSharedIPv6' || type === '4') ? form.querySelector('#create_IsEnabledForConnections').checked : ''
      }, function () {
        $(m.create).modal('hide');
        form.reset();
        Networks.list.load();
        }, function (ModelState) {
          var errArray = Object.keys(ModelState);
          for (var i = 0; i < errArray.length; i++) {
            var errElem = $(form).find('#Create_' + errArray[i]);
            if (errElem.parent().find('.error__message').length > 0) {
              errorMessageRemove(errElem);
            }
            errorMessageAdd(errElem, ModelState[errArray[i]].toString().replace(/\n/g, '<br />'));
          }
        });
    },

    init: function () {
      var m = Networks.modal;

      initCreateModal();

      m.deleteForm.addEventListener('submit', m.performDelete);
      m.updateForm.addEventListener('submit', m.performUpdate);
      m.createForm.addEventListener('submit', m.performCreate);
      

      $('.modal').on('hidden.bs.modal', function (e) {
        var modal = $(this),
          form = $(this).find('form');

        if (form.length > 0) {
          form.find('.error__message, .error__summary').each(function () {
            $(this).remove();
          });
          form[0].reset();
        }
      });

      function initCreateModal() {
        var form = m.createForm;
        var typeSelect = form.querySelector('#Create_NetworkType');
        var vdcSelect = form.querySelector('#Create_VdcId');
        var dcSelect = form.querySelector('#Create_DcLocationId');

        typeSelect.addEventListener('change', toggleFieldsVisibility);
        dcSelect.addEventListener('change', setVdcOptions);
        vdcSelect.addEventListener('click', showEmptyTooltip);

        $('#modal-create').on('show.bs.modal', toggleFieldsVisibility);

        setVdcOptions();

        function toggleFieldsVisibility() {
          var type = typeSelect.value;
          var connectDiv = form.querySelector('#networks-connect');
          var edgeExternalDiv = form.querySelector('#networks-edge-external');

          connectDiv.classList[(type === 'PublicShared' || type === '1' || type === 'PublicSharedIPv6' || type === '4') ? 'remove' : 'add']('hidden');
          edgeExternalDiv.classList[(type === 'PublicClient' || type === '2') ? 'remove' : 'add']('hidden');
        }

        function setVdcOptions() {
          var dcId = dcSelect.value;
          
          while (vdcSelect.firstChild) {
            vdcSelect.removeChild(vdcSelect.firstChild);
          }

          vdcSelect.appendChild(getExactOption('', vdcSelect.dataset.placeholder));
          vdcSelect.value = '';

          if (dcId) {
            vdcByLocations[dcId].forEach(function (el) {
              vdcSelect.appendChild(getExactOption(el.Id, el.Name));
            });
          }

          function getExactOption(val, text) {
            var o = document.createElement('option');
            o.value = val;
            o.textContent = text;

            return o;
          }
          
        }

        function showEmptyTooltip() {
          if (dcSelect.value === '') {
            var tooltip = vdcSelect.parentNode.querySelector('.tooltip');
            tooltip.classList.add('tooltip--visible');

            setTimeout(function () {
              tooltip.classList.remove('tooltip--visible');
            }, 3000);
          }
        }
      }

      
      
    }
  },
  init: function () {
    this.filter.init();
    this.list.load();
    this.modal.init();
  }
}
Networks.init();
