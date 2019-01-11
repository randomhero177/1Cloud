let hostDelete = {
  config: {
    form: $('#delete-host'),
    checkbox: '#monitoring-delete-confirm',
    btn: '#monitoring-delete-btn',
    monitoringContainer: '#monitoring-edit-tabs',
    deleteContainer: '#monitoring-delete'
  },
  actions: {
    confirm: function () {
      var c = hostDelete.config,
        el = $(c.checkbox),
        btn = $(c.btn);

      el.on('change', function (e) {
        btn.prop('disabled', !$(this).is(':checked'));
      });

      btn.click(function (e) {
        e.preventDefault();
        var hostId = $(c.monitoringContainer).data('hostid');
        sendAjaxRequest(c.deleteContainer, c.form.attr('action'), { hostId: hostId }, function (data) {
          console.log(data);
        }, null, 'DELETE');
      });
    }
  }
}
hostDelete.actions.confirm();