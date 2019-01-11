
var EditMetricsInit = function () {
  var edit = {
    config: {
      formId: '#metric-edit-form',
      checkboxClass: 'location-checkbox',
      setAllPoints: 'checkbox-set-all',
      forceCheckBtn: '.js-force-check',
      stateIcon: '.monitoring__icon-state',
      editPopupBlock: '#edit-block-modal',
      metricItem: '.monitoring__metrics-edit',
      commandBlockId: '#edit-metric-command'
    },
    view: {
      showMetricBlock: function () {
        var c = edit.config;
        $(c.metricItem).click(function (e) {
          e.preventDefault();
          var url = $(this).attr('href');
          $('#monitoring-metrics').addClass('loading loading--full');
          sendAjaxGetRequest(url, function (data) {
            $('#monitoring-metrics').removeClass('loading loading--full');
            $('#edit-metric-body').html(edit.view.setDifferentId(data));
            
            $(c.editPopupBlock).modal('show');
            edit.onLoadInit();
          })
        });
      },
      setDifferentId: function (data) {
        var block = $('<div />', {
          'html': data
        }),
          checkboxes = block.find('input[type="checkbox"]'),
          inputs = block.find('input[type="text"]');
        checkboxes.each(function () {
          var curId = $(this).attr('id'),
            curLabel = block.find('label[for="' + curId + '"]');
          $(this).attr('id', curId + '-edit');
          curLabel.attr('for', curId + '-edit');
        });
        inputs.each(function () {
          var curId = $(this).attr('id');
          $(this).attr('id', curId + '-' + edit.config.commandBlockId.replace('#', ''));
        });
        return block
      },
      submitForm: function () {
        var c = edit.config,
          form = $(c.formId),
          obj = {},
          extraOptions = $(c.commandBlockId).find('.monitoring__extra-inp');
          obj.hostId = $('#monitoring-edit-tabs').data('hostid');
          obj.CheckCommandName = form.find('[name="CheckCommandName"]').val();
          obj.Name = form.find('[name="Name"]').val();
          obj.CheckTimeout = form.find('[name="CheckTimeout"]').val();
          obj.CheckInterval = form.find('[name="CheckInterval"]').val();
          obj.EnableNotifications = form.find('[name="EnableNotifications"]').is(':checked');
          obj.CheckCommand = {};
        extraOptions.each(function (i, el) {
          obj.CheckCommand[$(this).attr('name')] = ($(this).attr('type') === 'checkbox') ? $(this).is(':checked') : $(this).val();
        });

        sendAjaxRequest(c.formId, form.attr('action'), obj, function () {
          $(c.editPopupBlock).modal('hide');
        }, showErrorsWithObjName)
      },
      smtpListener: function () {
        var c = edit.config,
          block = $(c.formId),
          smtpSelect = block.find('#check-command-smtp');
        if (smtpSelect.length > 0) {
          toggleBlock();
          smtpSelect.off('change');
          smtpSelect.on('change', function () {
            toggleBlock();
          })
        };

        function toggleBlock() {
          var selectedVal = smtpSelect.val(),
            dependentBlock = $('.js-smtp-selectable');
          dependentBlock[(selectedVal == '1') ? 'addClass' : 'removeClass']('hidden');
        }
      }
    },
    onLoadInit: function () {
      var c = edit.config;
      initSelect(edit.config.formId + ' .chosen-select');
      forceCheck($(c.forceCheckBtn), c.stateIcon, c.formId, c.formId);
      $(edit.config.formId).submit(function (e) {
        e.preventDefault();
        edit.view.submitForm();
      });
      edit.view.smtpListener();
    },
    init: function () {
      var c = edit.config;
      edit.view.showMetricBlock();
    }
  }
  edit.init();
};

