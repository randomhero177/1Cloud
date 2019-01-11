(function () {
  var powerFormsSelectors = ['#server-power-on-form', '#server-power-off-form', '#server-power-reboot-form'];

  powerFormsSelectors.forEach(function (selector) {
    var form = document.querySelector(selector);

    if (form !== null) {
      form.addEventListener('submit', performPowerAction);
    }
  });

  function performPowerAction(e) {
    e.preventDefault();
    var form = e.target;
    var actionFieldType = form.querySelector('[name="Action"]').type;

    sendAjaxRequest('#' + form.id, form.action, {
      ServiceInstance: form.querySelector('[name="ServiceInstance"]').value,
      Action: (actionFieldType === 'radio') ? form.querySelector('[name="Action"]:checked').value : form.querySelector('[name="Action"]').value
    });
  }
})();