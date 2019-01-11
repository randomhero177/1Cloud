(function () {
  var NAT = {
    config: {
      addRuleBtnId: 'add-nat',
      natBlock: document.getElementById('nat'),
      $modalBlock: $('#nat-modal'),
      $modalBlockTitle: $('#modal-block-title'),
      $modalForm: $('#nat-modal-form'),
      modalFormSelector: '#nat-modal-form',
      $typeSelect: $('#nat-modal-form').find('[name="Type"]'),
      $protocolSelect: $('#nat-modal-form').find('[name="Protocol"]'),
      $translatedPort: $('#nat-modal-form').find('[name="TranslatedPort"]'),
      $originalPort: $('#nat-modal-form').find('[name="OriginalPort"]'),
      $listTable: $('#nat-list'),
      $deleteBtn: $('.nat__delete-btn'),
      $addRulePorts: $('[data-rules]')
    },
    modal: function () {
      var btn = document.getElementById(c.addRuleBtnId);
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        c.$modalBlockTitle.text('Добавить правило NAT');
        c.$modalBlock.modal('show');
        c.$modalForm.data('event', 'create');
        c.$typeSelect.prop('disabled', false);
      });
    },
    updateNAT: function () {
      
      var obj = {
        networkId: networkId,
        networkType: networkType,
        Rules: NAT.getNATRules()
      };
      sendAjaxRequest(c.modalFormSelector, c.natBlock.dataset.action, obj, function () {
        location.reload();
      }, null, 'PUT');
    },
    submitModalForm: function () {
      c.$modalForm.submit(function (e) {
        e.preventDefault();
        var ruleObj = NAT.getModalObj();

        sendAjaxRequest(c.modalFormSelector, c.$modalForm.attr('action'), {
          networkId: networkId,
          networkType: networkType,
          model: NAT.getModalObj()
        }, function () {
          NAT.addRuleRow((c.$modalForm.data('event') === 'create'), ruleObj);
        }, function (data) {
          console.log(data);
        });
      });
    },
    addRuleRow: function (isNew, ruleObj) {
      var tpl = $('#nat-row-template').clone();
      var $row = (isNew) ? $(tpl.prop('content')) : c.$listTable.find('[data-rule-id="' + c.$modalForm.data('edit-id') + '"]');
      var $curElemFilled;

      for (var key in ruleObj) {
        $curElemFilled = $row.find('[data-for="' + key + '"]');
        $curElemFilled.text(ruleObj[key]);
        if ($curElemFilled.data('value')) {
          $curElemFilled.data('value', ruleObj[key]);
        };
      };

      $row.find('[data-for="Enabled"]').data('checked', ruleObj['Enabled']);
      c.$modalBlock.modal('hide');
      c.$modalForm[0].reset();

      if (isNew) {
        c.$listTable.find('tbody').append($row);
      };

      NAT.updateNAT();
    },
    editNAT: function () {
      var $editLinks = c.$listTable.find('a[data-event="edit"]'),
        rowId;

      $editLinks.click(function (e) {
        e.preventDefault();
        fillEitModal($(this));
        NAT.setFieldsVisibility($(this).parents('tr').find('[data-for="Type"]').data('value'));
        c.$modalForm.data('event', 'edit');
        c.$typeSelect.prop('disabled', true);
        NAT.setOriginalPort(c.$translatedPort.val());
        NAT.setAnyPort(c.$protocolSelect.val(), c.$addRulePorts);
      });

      function fillEitModal($elem) {
        var $row = $elem.closest('tr'),
          $itemsToFill = $row.find('[data-for]');
        rowId = $row.data('rule-id');

        c.$modalBlockTitle.text('Изменить правило NAT');
        c.$modalBlock.modal('show');
        $itemsToFill.each(function (i, el) {
          fillData($(el));
        });
        c.$modalForm.data('event', 'edit');
        c.$modalForm.data('edit-id', rowId);
      };

      function fillData($el) {
        var key = $el.data('for');
        var value = $el.text();
        var $formElem = c.$modalForm.find('[name="' + key + '"]');
        
        if ($formElem.prop("tagName") === 'SELECT') {
          value = $el.data('value');
          for (var i = 0; i < $formElem.children('option').length; i++) {
            if ($formElem.children('option')[i].value === value) {
              $formElem.children('option').eq(i).attr('selected', 'selected')
              break;
            }
          };
        } else if ($formElem.attr('type') === 'checkbox') {
          $el.data('checked');
          $formElem.attr('checked', true);
        } else {
          $formElem.val(value);
        };
      };

    },
    setFieldsVisibility: function (type) {
      
      var $fields = c.$modalForm.find('[data-type]');
      $fields.each(function (i, el) {
        var curType = $(el).data('type');
        el.classList[(curType.indexOf(type) > -1) ? 'remove' : 'add']('hidden');
      });
    },
    setExternalIp: function (value) {
      var elems = {
        SNAT: c.$modalForm.find('[name="TranslatedIp"]'),
        DNAT: c.$modalForm.find('[name="OriginalIp"]')
      };

      for (var item in elems) {
        elems[item].val('').prop('disabled', false);
      };
      elems[value].val(c.$modalForm.data('edge-external')).prop('disabled', true);
    },
    setAnyPort: function (protocol, ports) {
      var isHidden = (protocol === 'Any' || protocol === 'Icmp');
      ports.each(function () {
        if (isHidden) {
          $(this).prop('disabled', true).val('any');
        } else {
          $(this).prop('disabled', false);
        }
      });
    },
    getModalObj: function () {
      return {
        Type: c.$modalForm.find('[name="Type"]').val(),
        Description: c.$modalForm.find('[name="Description"]').val(),
        OriginalIp: c.$modalForm.find('[name="OriginalIp"]').val(),
        TranslatedIp: c.$modalForm.find('[name="TranslatedIp"]').val(),
        Protocol: c.$modalForm.find('[name="Protocol"]').val(),
        OriginalPort: c.$modalForm.find('[name="OriginalPort"]').val(),
        TranslatedPort: c.$modalForm.find('[name="TranslatedPort"]').val(),
        Enabled: c.$modalForm.find('[name="Enabled"]').prop('checked')
      }
    },
    getNATRules: function() {
      var rows = c.$listTable.find('tbody tr');
      var rules = new Array();

      rows.each(function () {
        rules.push({
          Id: $(this).data('rule-id'),
          Type: $(this).find('[data-for="Type"]').text(),
          Description: $(this).find('[data-for="Description"]').text(),
          OriginalIp: $(this).find('[data-for="OriginalIp"]').text(),
          OriginalPort: $(this).find('[data-for="OriginalPort"]').text(),
          TranslatedIp: $(this).find('[data-for="TranslatedIp"]').text(),
          TranslatedPort: $(this).find('[data-for="TranslatedPort"]').text(),
          Protocol: $(this).find('[data-for="Protocol"]').text(),
          Enabled: $(this).find('[data-for="Enabled"]').data('checked')
        });
      });

      return rules;
    },
    removeRow: function ($el) {
      var $tr = $el.parents('tr');
      var confirm = new ConfirmPopup({
        text: 'Вы действительно хотите удалить NAT туннель?',
        cbProceed: function () {
          $tr.remove();
          NAT.updateNAT();
        },
        alertText: 'Для того, чтобы окончательно удалить NAT туннель, необходимо будет сохранить изменения.',
        alertType: 'info',
      });
    },
    setSelectOptions: function () {
      c.$protocolSelect.children('option').eq(0).attr('selected', 'selected');
      c.$typeSelect.children('option').eq(0).attr('selected', 'selected');
      NAT.setAnyPort(c.$protocolSelect.val(), c.$addRulePorts);
    },
    setOriginalPort: function (value) {
      if (value.toLowerCase() === 'any') {
        c.$originalPort.prop('disabled', true);
        c.$originalPort.text('any');
      } else {
        c.$originalPort.prop('disabled', false);
      };
    },
    init: function () {
      NAT.modal();

      c.$deleteBtn.click(function (e) {
        e.preventDefault();
        NAT.removeRow($(this));
      });

      NAT.submitModalForm();

      c.$modalBlock.on('hidden.bs.modal', function () {
        c.$modalBlock.find('form')[0].reset();
        NAT.setSelectOptions();
      });

      NAT.editNAT();

      c.$typeSelect.on('change', function () {
        NAT.setFieldsVisibility($(this).val());
        NAT.setExternalIp($(this).val());
        c.$protocolSelect.children('option').eq(0).attr('selected', 'selected');
      });

      c.$protocolSelect.change(function () {
        NAT.setAnyPort($(this).val(), c.$addRulePorts);
        NAT.setOriginalPort(c.$translatedPort.val());
      });

      c.$translatedPort.change(function () {
        NAT.setOriginalPort($(this).val());
      });
    }
  };

  var c = NAT.config;
  if (c.natBlock) {
    NAT.init();
  };
})();
