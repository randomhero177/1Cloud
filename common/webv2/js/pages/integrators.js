$(function () {

  initRegistrationForm('#topblock-form', 'regtop', 'registrationmain');
  initMessageForm('#consult-form', null, null, 'Integraskqustion');
  initMessageForm('#consultation-form', messageAjaxSuccess, null, 'integrkpsent');
  initRegistrationForm('#registr-block-form', '');

  function messageAjaxSuccess() {
    var $consultFormContainer = $('#consultation-form-container'),
      $consultForm = $('#consultation-form');

    $consultForm[0].reset();
    $consultFormContainer.replaceWith($('<div />', {
      id: $consultForm.attr('id') + '-success',
      'html': '<p class="alert alert-success text-center">' + textSent + '</p><p class="text-center">В ближайшее время на указанный email <br />вам ответит наш сотрудник</p>'
    }));
  }



  /* =============== TOPBLOCK SECTION =============== */
  var $topForm = $('#topblock-form'),
    $topFormTrigger = $('.topblock__form-trigger'),
    $topFormClose = $('.topblock__form-close');

  if ($topForm && $topFormTrigger && $topFormClose) {
    $topFormTrigger.click(function (e) {
      e.preventDefault();
      document.body.classList.add('topblock--opened');
    });

    $topFormClose.click(function (e) {
      e.preventDefault();
      document.body.classList.remove('topblock--opened');
    });
  };

  var $topBlockLink = $('.topblock__service');
  $topBlockLink.removeAttr('href').find('.topblock__service-link').remove();
});
