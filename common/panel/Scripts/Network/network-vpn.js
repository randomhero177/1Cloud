(function () {
  var VPN = {
    config: {
      block: document.getElementById('vpn-section'),
      openModalBtn: 'add_vpn',
      modalBlock: 'addVPNModal',
      modalForm: 'vpn-add-form',
      editBlock: 'editVPNModal',
      editForm: 'vpn-edit-form',
      tableId: 'vpn-list',
      rowTemplate: 'vpn-row-template',
      deleteBtnClass: '.vpn__delete-btn',
      deleteBtn: document.querySelectorAll('.vpn__delete-btn')
    },
    modal: function () {
      var btn = document.getElementById(c.openModalBtn);

      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          $('#' + c.modalBlock).find('form')[0].reset();
          $('#' + c.modalBlock).modal('show');
        });
      }
    },
    getVpnStatus: function () {
      var timer = 15000,
        table = document.getElementById(c.tableId),
        rows = table.querySelectorAll('tbody tr'),
        elems = table.querySelectorAll('.state'),
        url = table.dataset.status,
        obj = {};
      
      var tabLink = document.querySelector('a[href="#vpn-section"]');

      if (tabLink && rows.length > 0) {
        tabLink.addEventListener('click', function () {
          sendAjaxGetRequest(url, function (data) { drawStatus(data); });
        });
      };

      function drawStatus(data) {
        data.forEach(function (el) {
          var status = el.Operational,
            stateIcon = table.querySelector('[data-id="' + el.TunnelId + '"] .vpn__state');
          if (stateIcon) {
            stateIcon.classList.add('vpn__status--' + status);
          }
        });
      };
    },
    updateVpn: function () {
      var block = document.getElementById(c.tableId),
        list = [],
        rows = block.querySelectorAll('tbody tr');

      rows.forEach(function (el) {
        var obj = {};
        obj.Name = el.querySelector('[data-for="name"]').textContent;
        obj.PeerNetwork = el.querySelector('[data-for="PeerNetwork"]').textContent;
        obj.PeerEndpoint = el.querySelector('[data-for="PeerEndpoint"]').textContent;
        obj.PeerIdentificator = el.dataset.peerid;
        obj.EncryptionType = el.dataset.encryption;
        if (el.dataset.id) {
          obj.Id = el.dataset.id;
        };
        obj.SharedKey = el.dataset.sharedkey;
        obj.Mtu = el.dataset.mtu;
        obj.Enabled = el.dataset.enabled;

        list.push(obj);
      });
      
      sendAjaxRequest('#' + c.modalForm, block.dataset.action, {
        networkId: networkId,
        networkType: networkType,
        model: {
          Tunnels: list
        }
      }, function () {
        location.reload();
      }, null, 'PUT');
      
    },
    createVpnRow: function () {
      var form = document.getElementById(c.modalForm);

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
        var obj = {
          networkType: c.block.dataset.networkType,
          model: VPN.getModalObj(c.modalForm)
        };

          if ($(form).valid()) {
            sendAjaxRequest('#' + form.id, form.action, obj, function () {
            VPN.drawVpnRow(obj.model);
              VPN.updateVpn();
            });
          };
        });
      }
    },
    editVpn: function () {
      var table = document.getElementById(c.tableId),
        form = document.getElementById(c.editForm),
        editLinks = table.querySelectorAll('a[data-for="name"]'),
        rowId;
      
      [].forEach.call(editLinks, function (link) {
        var row = link.closest('tr');

        link.addEventListener('click', function (e) {
          e.preventDefault();
          fillModal(row);
          rowId = row.dataset.id;
        })
      });

      function fillModal(row) {
        var dataAttrObj = $(row).data(),
          dataKeys = Object.keys(dataAttrObj),
          dataForElems = row.querySelectorAll('[data-for]');

        [].forEach.call(dataForElems, function (el) {
          var curName = el.dataset.for,
            curValue = el.textContent,
            formElem = form.querySelector('[data-for="' + curName + '"]');

          if (formElem) {
            formElem.value = curValue;
          }
        });

        dataKeys.forEach(function (curName) {
          var formElem = form.querySelector('[data-for="' + curName + '"]');
          if (formElem) {
            if (formElem.tagName === 'SELECT') {
              for (var i = 0; i < formElem.options.length; i++) {
                if (formElem.options[i].text === dataAttrObj[curName].toUpperCase()) {
                  formElem.selectedIndex = i;
                  break;
                }
              }
            } else if (formElem.tagName === 'INPUT' && (formElem.type === 'text' || formElem.type === 'hidden')) {
              formElem.value = dataAttrObj[curName];
            } else {
              formElem.checked = (dataAttrObj[curName].toLowerCase() == 'true');
            };
          };
        });

        $('#' + c.editBlock).modal('show');
      };

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var obj = VPN.getModalObj(c.editForm);

        sendAjaxRequest('#' + form.id, form.action, obj, function () {
          editVpnRow(obj);
          VPN.updateVpn();
        });
      });

      function editVpnRow(obj) {
        var curRow = table.querySelector('[data-id="' + rowId + '"]');
        
        curRow.querySelector('[data-for="name"]').textContent = obj.Name;
        curRow.querySelector('[data-for="PeerNetwork"]').textContent = obj.PeerNetwork;
        curRow.querySelector('[data-for="PeerEndpoint"]').textContent = obj.PeerEndpoint;
        curRow.dataset.peerid = obj.PeerIdentificator;
        curRow.dataset.encryption = obj.EncryptionType;
        curRow.dataset.sharedkey = obj.SharedKey;
        curRow.dataset.mtu = obj.Mtu;
        curRow.dataset.enabled = obj.Enabled;
      };
    },
    drawVpnRow: function (obj) {
      var tpl = document.getElementById(c.rowTemplate),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        newRow = tplContainer.querySelector('tr').cloneNode(true),
        table = document.getElementById(c.tableId),
        tBody = table.querySelector('tbody');


      newRow.dataset.sharedkey = obj.SharedKey;
      newRow.dataset.mtu = obj.Mtu;
      newRow.dataset.encryption = obj.EncryptionType;
      newRow.dataset.peerid = obj.PeerIdentificator;
      newRow.dataset.enabled = obj.Enabled;

      newRow.querySelector('[data-for="name"]').textContent = obj.Name;
      newRow.querySelector('[data-for="PeerEndpoint"]').textContent = obj.PeerEndpoint;

      newRow.querySelector('[data-for="PeerNetwork"]').textContent = obj.PeerNetwork;
      tBody.appendChild(newRow);
    },
    getModalObj: function (formId) {
      var form = document.getElementById(formId),
        obj = {};

      obj.Id = form.querySelector('[name="Id"]').value;
      obj.Name = form.querySelector('[name="Name"]').value;
      obj.PeerNetwork = form.querySelector('[name="PeerNetwork"]').value;
      obj.PeerIdentificator = form.querySelector('[name="PeerIdentificator"]').value;
      obj.PeerEndpoint = form.querySelector('[name="PeerEndpoint"]').value;
      obj.EncryptionType = form.querySelector('[name="EncryptionType"]').value;
      obj.SharedKey = form.querySelector('[name="SharedKey"]').value;
      obj.Mtu = form.querySelector('[name="Mtu"]').value;
      obj.Enabled = form.querySelector('[name="Enabled"]').checked;
      return obj
    },
    removeRow: function (el) {
      var tr = el.closest('tr');

      var confirm = new ConfirmPopup({
        text: 'Вы действительно хотите удалить VPN туннель?',
        cbProceed: function () {
          tr.parentNode.removeChild(tr);
          VPN.updateVpn();
        }
      });
    },
    init: function () {
      var table = document.getElementById(c.tableId);

      VPN.modal();
      VPN.createVpnRow();

      if (table) {
        VPN.getVpnStatus();

        [].forEach.call(VPN.config.deleteBtn, function (el) {
          el.addEventListener('click', function (e) {
            e.preventDefault();
            VPN.removeRow(el);
          });
        });

        VPN.editVpn();
      }
    }
  };
  var c = VPN.config;
  VPN.init()
})();
