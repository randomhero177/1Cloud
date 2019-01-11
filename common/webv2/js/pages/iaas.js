(function () {
  initMessageForm('#consultation-form', messageAjaxSuccess, 'kalkiaassent');
  initRegistrationForm('#registr-block-form', '');

  function messageAjaxSuccess() {
    var $modalForm = $('#consultation-form'),
      $modalFormId = $modalForm.attr('id');

    $modalForm[0].reset();
    $modalForm.replaceWith($('<div />', {
      id: $modalFormId + '-success',
      'html': '<p class="alert alert-success text-center">' + textSent + '</p><p class="text-center">В ближайшее время на указанный email <br />вам ответит наш сотрудник</p>'
    }));
  }
})()