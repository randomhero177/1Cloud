(function initDeleteServer() {
  var formId = 'action-destroy-form',
    form = document.getElementById(formId),
    confirm = document.getElementById('server-destroy-confirm'),
    submitBtn = document.getElementById('server-destroy-btn');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!confirm.checked) {
        errorMessageAdd($(confirm), resources.ConfirmRequired);
        return;
      }

      sendAjaxRequest('#' + formId, form.action, {
        ServiceInstanceId: document.querySelector('[name="ServiceInstanceId"]').value,
        isEditable: document.querySelector('[name="isEditable"]').value,
        Confirm_Delete: confirm.checked
      });

    });
  }
})();