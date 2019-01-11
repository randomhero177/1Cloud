$(function () {
  var firewallBlockSelector = '#firewall';
  var rulesTableSelector = '#firewall-rules-list';
  var $rulesTable = $(rulesTableSelector);
  var $powerCheckbox = $('.firewall__power-trigger [type="checkbox"]');
  var $trafficRadios = $('[name="DefaultRuleAction"]');
  var $trafficAllowedRadio = $('#TraficAllowed');

  var $saveChangesBlock = $('.firewall__save-changes');
  var $saveChangesBtn = $('#firewall-save-changes-btn');
  var $items = $('.firewall__item');

  var $addRuleTrigger = $('#add_rule');
  var $addRuleModal = $('#addFirewallRuleModal');
  var $addRuleLabel = $('#addFirewallRuleLabel');
  var addRuleFormSelector = '#firewall-add-rule-form';
  var $addRuleForm = $(addRuleFormSelector);
  var $addRuleProtocol = $addRuleForm.find('[name="Protocol"]');
  var $addRulePorts = $addRuleForm.find('[data-for="port"]');

  var ruleFields = {
    Source: $('#Source'),
    SourcePort: $('#SourcePort'),
    Destination: $('#Destination'),
    DestinationPort: $('#DestinationPort'),
    Protocol: $('#Protocol')
  };

  if ($powerCheckbox.length === 0) {
    return;
  }

  var loadedState = getCurrentState();
  var protoDictionary = getProtoDictionary();

  /*************** LISTENERS & ACTIONS ***************/
  $(rulesTableSelector + ' tbody').sortable();
  toggleRulesTableSortable();

  $powerCheckbox.switchButton({
    width: 40,
    height: 25,
    button_width: 25,
    checked: $powerCheckbox.data('powered'),
    on_label: 'Вкл',
    off_label: 'Выкл',
    labels_placement: "right",
    clear_after: null,
    on_callback: toggleFirewallEdition,
    off_callback: toggleFirewallEdition
  });

  $trafficRadios.on('change', function () {
    toggleSaveChangesVisibility();
  })

  $rulesTable.on('click', '.firewall__rules-delete', deleteRuleRow);

  $addRuleTrigger.click(function () {
    $addRuleModal.modal('show');
    $addRuleForm.data('event', 'create');
    $addRuleLabel.text('Добавить правило');
  });

  $addRuleModal.on('hidden.bs.modal', function () {
    $addRuleForm[0].reset();
  });

  $addRuleProtocol.change(function () {
    setAnyPort($(this).val(), $addRulePorts);
  });

  $addRuleForm.submit(addRuleSubmit);

  $saveChangesBtn.click(saveFirewallChanges);

  /*************** FUNCTIONS ***************/

  function setAnyPort(protocol, ports) {
    var isHidden = (protocol === 'Any' || protocol === 'Icmp');

    ports.each(function () {
      if (isHidden) {
        $(this).prop('disabled', true).val('any');
      } else {
        $(this).prop('disabled', false);
      }
    });
  }

  function toggleRulesTableSortable() {
    var curRulesCount = $rulesTable.find('tbody tr').length;
    var $tbody = $(rulesTableSelector + ' tbody');

    if (curRulesCount > 1) {
      $tbody.sortable('enable');
      $rulesTable.on('sortupdate', function (event, ui) {
        toggleSaveChangesVisibility();
        setIdNumber($('#firewall-rules-list tbody'), '.firewall__rule-id');
      });
    } else {
      $tbody.sortable('disable');
    }
  }

  function toggleFirewallEdition() {
    var isChecked = $(this).hasClass('checked');
    $items[(isChecked) ? 'removeClass' : 'addClass']('firewall__item--blocked');
    $powerCheckbox.prop('checked', isChecked);

    toggleSaveChangesVisibility();
  }

  function toggleSaveChangesVisibility() {
    var currentState = getCurrentState();
    var isChanged = false;

    for (var key in currentState) {
      isChanged = isChanged || currentState[key] !== loadedState[key];
    }

    $saveChangesBlock[isChanged ? 'addClass' : 'removeClass']('firewall__save-changes--active');
  }

  function getCurrentState() {
    return {
      isOn: $powerCheckbox.prop('checked'),
      isTraficAllowed: $trafficAllowedRadio.prop('checked'),
      rules: $rulesTable.find('tbody tr').length,
      rulesOrder: getRulesOrder()
    };
  };

  function getRulesOrder() {
    var rulesNames = [];

    $rulesTable.find('tbody tr').each(function () {
      rulesNames.push($(this).find('td:nth-child(3)').text());
    });

    return rulesNames.join(', ');
  }

  function deleteRuleRow(e) {
    e.preventDefault();

    var tr = $(this).closest('tr');

    var confirm = new ConfirmPopup({
      text: 'Вы действительно хотите удалить данное правило?',
      cbProceed: function () {
        tr.remove();
        toggleSaveChangesVisibility();
        setIdNumber($('#firewall-rules-list tbody'), '.firewall__rule-id');
      },
      alertText: 'Для того, чтобы окончательно удалить данное правило, необходимо будет сохранить изменения.',
      alertType: 'info',
    });
  }

  function addRuleSubmit(e) {
    e.preventDefault();
    var ruleObj = getRuleModel($addRuleForm);

    if ($addRuleForm.valid()) {
      sendAjaxRequest(addRuleFormSelector, $addRuleForm.attr('action'), {
        networkId: networkId,
        networkType: networkType,
        model: ruleObj
      }, function () {
        addRuleRow(($addRuleForm.data('event') === 'create'));
      }, function (data) {
        showErrorsWithObjName(data, addRuleFormSelector);
      });
    } else {
      showErors()
    };

    function showErors() {
      var validator = $addRuleForm.validate();

      validator.errorList.forEach(function (error) {
        var elem = $addRuleForm.find(error.element);
        errorMessageAdd(elem, error.message);
      })
    };

    function getRuleModel() {
      return {
        Name: $addRuleForm.find('[name="Name"]').val(),
        Action: $addRuleForm.find('[name="Action"]').val(),
        Protocol: $addRuleForm.find('[name="Protocol"]').val(),
        Source: $addRuleForm.find('[name="Source"]').val(),
        SourcePort: $addRuleForm.find('[name="SourcePort"]').val(),
        Destination: $addRuleForm.find('[name="Destination"]').val(),
        DestinationPort: $addRuleForm.find('[name="DestinationPort"]').val()
      }
    }

    function addRuleRow() {
      var $tpl = $('#firewall-row-template').clone();
      var $newRow = $($tpl.prop('content'));
      var $protoTd = $newRow.find('[data-for="Protocol"]');

      for (var key in ruleObj) {
        if (key === 'Protocol') {
          $protoTd.data('value', ruleObj[key]);
          $protoTd.html(protoDictionary[ruleObj[key]]);
        } else {
          $newRow.find('[data-for="' + key + '"]').text(ruleObj[key]);
        }
      }

      $newRow.find('.firewall__rule-id').text($rulesTable.find('tbody tr').length + 1);

      $(rulesTableSelector + ' tbody').append($newRow);
      $addRuleModal.modal('hide');
      $addRuleForm[0].reset();
      toggleRulesTableSortable();
      toggleSaveChangesVisibility();
    }
  }

  function saveFirewallChanges(e) {
    e.preventDefault();
    var modelObj = getFirewallModel();
    
    sendAjaxRequest(firewallBlockSelector, $(firewallBlockSelector).data('action'), {
      networkId: networkId,
      networkType: networkType,
      model: modelObj
    }, function () {
      location.reload();
    }, showErrorFirewall, 'PUT');
    
    function getFirewallModel() {
      return {
        Enabled: $powerCheckbox.prop('checked'),
        DefaultRuleAction: $('[name="DefaultRuleAction"]:checked').val(), 
        Rules: getFirewallRules()
      }

      function getFirewallRules() {
        var rows = $rulesTable.find('tbody tr');
        var rules = new Array();

        rows.each(function () {
          var row = $(this);

          rules.push({
            Name: row.find('[data-for="Name"]').text(),
            Source: row.find('[data-for="Source"]').text(),
            SourcePort: row.find('[data-for="SourcePort"]').text(),
            Destination: row.find('[data-for="Destination"]').text(),
            DestinationPort: row.find('[data-for="DestinationPort"]').text(),
            Protocol: row.find('[data-for="Protocol"]').data('value'),
            Action: row.find('[data-for="Action"]').text()
          });
        });

        return rules;
      }
    }
  }

  function showErrorFirewall(data) {
    var notice = new PanelNotice('Во время сохранения произошла ошибка', 'danger');
    var tableParent = $rulesTable.parent();

    if (!data) {
      return;
    }

    for (var key in data) {
      if (data[key].length > 0) {
        data[key].forEach(function (el, i) {
          appendErrorMessage(el);
        });
      }
    }

    function appendErrorMessage(msg) {
      var newError = $('<div />', {
        class: 'alert alert-danger alert-dismissible',
        text: msg
      });
      var closeBtn = $('<button />', {
        class: 'close',
        type: 'button',
        html: '&times;',
        click: function () {
          $(this).parent().remove();
        }
      });

      newError.append(closeBtn);
      tableParent.append(newError);
    }
  };

  function setIdNumber(body, showElemSelector) {
    
    var $childs = body.children();
    $childs.each(function (i, el) {
      $(el).find(showElemSelector).text(i + 1);
    })
  };

  function showErrorsWithObjName(data, blockId) {
    var names = Object.keys(data);
    names.forEach(function (el) {
      var curEl = $(blockId).find('[name="' + el + '"]');
      if (curEl.length == 0) {
        var split = el.split('.'),
          fixName = split[split.length - 1],
          fixElem = $(blockId).find('[name="' + fixName + '"]');
        if (fixElem.length > 0) {
          errorMessageAdd(fixElem, data[el]);
        }
      }
    })
  }

  function getProtoDictionary() {
    var $options = $addRuleProtocol.find('option');
    var dict = {};

    $options.each(function () {
      var opt = $(this);

      dict[opt.val()] = opt.text();
    });

    return dict;
  }
});