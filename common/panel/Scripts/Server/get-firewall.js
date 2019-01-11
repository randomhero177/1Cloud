$(function () {
  var Firewall = {
    config: {
      addRuleBtn: '#add_rule',
      addRuleModal: '#addFirewallRuleModal',
      validateForm: '#firewall-add-rule-form',
      rulesTable: '#firewall-rules-list',
      saveChangesBtn: '#firewall-save-changes-btn',
      saveChangesBlock: '.firewall__save-changes',
      firewallBlock: '#server-firewall-section',
      protocol: $('#Protocol'),
      ports: $('[data-for="port"]'),
      direction: $('[name="TrafficDirection"]')
    },
    modal: {
      init: function () {
        $(c.addRuleBtn).click(function (e) {
          e.preventDefault();
          $(c.addRuleModal).modal('show');
        });
      }
    },
    getRulesOrder: function () {
      var rulesNames = [];

      $(c.rulesTable).find('tbody tr').each(function () {
        rulesNames.push($(this).find('[data-for="Name"]').text());
      });

      return rulesNames.join(', ');
    },
    validate: {
      showErors: function () {
        var validator = $(c.validateForm).validate();

        validator.errorList.forEach(function (error) {
          var elem = $(c.validateForm).find(error.element);
          errorMessageAdd(elem, error.message);
        })
      },
      submit: function () {
        $(c.validateForm).submit(function (e) {
          e.preventDefault();
          var obj = Firewall.validate.getRuleModel($(this));
          
          if ($(this).valid()) {
            sendAjaxRequest(c.validateForm, $(c.validateForm).attr('action'), obj, function () {
              Firewall.addRuleRow(obj);
            });
          } else {
            Firewall.validate.showErors();
          };
        });
      },
      getRuleModel: function (addRuleForm) {
        return {
          Name: addRuleForm.find('[name="Name"]').val(),
          Action: addRuleForm.find('[name="Action"]').val(),
          Source: (c.direction.val() === 'Outgoing') ? addRuleForm.find('#server-source-list').val() : addRuleForm.find('[name="Source"]').val(),
          SourcePort: addRuleForm.find('[name="SourcePort"]').val(),
          Destination: (c.direction.val() === 'Incoming') ? addRuleForm.find('#server-destination-list').val() : addRuleForm.find('[name="Destination"]').val(),
          DestinationPort: addRuleForm.find('[name="DestinationPort"]').val(),
          Protocol: addRuleForm.find('#Protocol').val(),
          TrafficDirection: addRuleForm.find('[name="TrafficDirection"]').val()
        }
      },
      setDirection: function () {
        var ipSelect = $('#public-ip-address'),
          sourceBlock = $('#server-source'),
          destinationBlock = $('#server-destination');

        setDirectionDependcies();
        c.direction.on('change', setDirectionDependcies);

        function setDirectionDependcies() {
          var curVal = c.direction.val();

          errorMessageRemove($('[name="Source"]'));
          errorMessageRemove($('[name="Destination"]'));

          if (curVal == 'Incoming') {
            setControlVisibility(sourceBlock, false);
            setControlVisibility(destinationBlock, true);
          } else if (curVal == 'Outgoing') {
            setControlVisibility(sourceBlock, true);
            setControlVisibility(destinationBlock, false);
          };

          function setControlVisibility(block, bool) {
            var input = block.find('input[type="text"]'),
              select = block.find('select'),
              label = block.find('.firewall__small-descr');

            if (bool) {
              input.addClass('hidden');
              input.val('');
              label.addClass('hidden');
              select.removeClass('hidden');
            } else {
              input.removeClass('hidden');
              input.val('');
              label.removeClass('hidden');
              select.addClass('hidden');
            }
          }
        };
      },
      init: function () {
        Firewall.validate.submit();
        Firewall.validate.setDirection();
      }
    },
    dragAndDrop: {
      toggleRulesTableSortable: function () {
        var curRulesCount = $(c.rulesTable).find('tbody tr').length;
        var tbody = $(c.rulesTable + ' tbody');

        if (curRulesCount > 1) {
          tbody.sortable('enable');
          $(c.rulesTable).on('sortupdate', function (event, ui) {
            Firewall.toggleSaveChangesVisibility();
          });
        } else {
          tbody.sortable('disable');
        }
      }
    },
    toggleSaveChangesVisibility: function () {
      var currentState = Firewall.getRulesOrder(),
        isChanged = currentState !== c.rulesOrder;

      $(c.saveChangesBlock)[isChanged ? 'addClass' : 'removeClass']('firewall__save-changes--active');
    },
    addRuleRow: function (ruleObj) {
      var tpl = $('#firewall-row-template').clone(),
        newRow = $(tpl.prop('content')),
        rulesTable = $(c.rulesTable);
      
      for (var key in ruleObj) {
        newRow.find('[data-for="' + key + '"]').text(ruleObj[key]);
      }

      newRow.find('.firewall__rule-id').text(rulesTable.find('tbody tr').length + 1);

      $(c.rulesTable + ' tbody').append(newRow);

      $(c.addRuleModal).modal('hide');
      $(c.validateForm)[0].reset();
      Firewall.dragAndDrop.toggleRulesTableSortable();
      Firewall.toggleSaveChangesVisibility();
    },
    saveRules: function (e) {
      e.preventDefault();
      var modelObj = getFirewallModel();
      
      sendAjaxRequest(c.firewallBlock, $(c.firewallBlock).data('action'), {
        serverId: serverId,
        model: modelObj
      }, function () {
        location.reload();
      }, showErrorFirewall, 'PUT');
      
      function getFirewallModel() {
        return {
          Rules: getFirewallRules()
        }

        function getFirewallRules() {
          var rows = $(c.rulesTable).find('tbody tr');
          var rules = new Array();

          rows.each(function () {
            rules.push({
              Name: $(this).find('[data-for="Name"]').text(),
              Source: $(this).find('[data-for="Source"]').text(),
              SourcePort: $(this).find('[data-for="SourcePort"]').text(),
              Destination: $(this).find('[data-for="Destination"]').text(),
              DestinationPort: $(this).find('[data-for="DestinationPort"]').text(),
              TrafficDirection: $(this).find('[data-for="TrafficDirection"]').text(),
              Action: $(this).find('[data-for="Action"]').text(),
              Protocol: $(this).find('[data-for="Protocol"]').text()
            });
          });

          return rules;
        }
      }

      function showErrorFirewall() {
        
      }
    },
    deleteRuleRow: function(e) {
      e.preventDefault();
      var tr = $(this).closest('tr');

      var confirm = new ConfirmPopup({
        text: 'Вы действительно хотите удалить данное правило?',
        cbProceed: function () {
          tr.remove();
          Firewall.toggleSaveChangesVisibility();
        },
        alertText: 'Для того, чтобы окончательно удалить данное правило, необходимо будет сохранить изменения.',
        alertType: 'info',
      });
    },
    setPort: function () {
      c.protocol.change(function (e) {
        e.preventDefault();
        setAnyPort($(this).val());
      });

      function setAnyPort(protocol) {
        var isHidden = (protocol === 'Any' || protocol === 'Icmp');

        c.ports.each(function () {
          if (isHidden) {
            $(this).prop('disabled', true).val('any');
          } else {
            $(this).prop('disabled', false);
          }
        });
      }
    },
    init: function () {
      c.rulesOrder = Firewall.getRulesOrder();
      Firewall.modal.init();
      Firewall.validate.init();
      $(c.saveChangesBtn).click(Firewall.saveRules);
      $(c.rulesTable + ' tbody').sortable();
      Firewall.dragAndDrop.toggleRulesTableSortable();
      
      $(c.rulesTable).on('click', '.firewall__rules-delete', Firewall.deleteRuleRow);

      Firewall.setPort();
    }
  };

  var c = Firewall.config;

  if ($(c.firewallBlock).length > 0 && $(c.addRuleModal).length > 0) {
    Firewall.init();
  }
});