(function () {
  var block = document.querySelector('#subscribe');
  var cookieName = '1cloud-subscribed';

  if (!getCookie(cookieName) && block !== null) {
    initForm();
  }

  function initForm() {
    var form = block.querySelector('#subscribe-form');
    var mode = block.dataset.mode;
    var emailInput = form.querySelector('[name="Email"]');
    var confirmCheckbox = form.querySelector('[name="IsConfidentialConfirmed"]');
    var submitBtn = form.querySelector('[type="submit"]');
    var popup = document.querySelector('#subscribe-popup');

    submitBtn.addEventListener('click', submitForm);

    switch (mode) {
      case 'end':
        block.classList.remove('hidden');
        break;
      case 'popup':
        showPopup();
        break;
      default:
        return;
    }
    
    function showPopup() {
      if (popup === null) {
        return;
      }
      
      var formModal = block.removeChild(form);
      popup.querySelector('.modal-body').appendChild(formModal);

      setTimeout(function () {
        $(popup).modal('show');
      }, 25000); // 25 seconds
    }

    function submitForm(e) {
      e.preventDefault();
      e.stopPropagation();

      if (emailInput.value === '') {
        errorMessageAdd($(emailInput), textRequired);
        return;
      }

      if (!confirmCheckbox.checked) {
        errorMessageAdd($(confirmCheckbox), textConfirmRequired);
        return;
      }

      sendPostRequest('#' + form.id, form.action, getSubscribeObj(), subscribeSuccess);

      function getSubscribeObj() {
        return {
          'Email': emailInput.value
        };
      }
    }

    function subscribeSuccess(data) {
      var isCounter = typeof yaCounter17861131 !== 'undefined';
      var isPopup = mode === 'popup';
      var successBlock = isPopup ? popup.querySelector('.modal-body') : block;
      var form = successBlock.querySelector('form');

      if (isCounter) {
        yaCounter17861131.reachGoal(isPopup ? 'subscribePopup' : 'subscribeContent');
      }

      successBlock.removeChild(form);
      successBlock.classList.add('subscribe--success');
      successBlock.innerHTML += '<p>' + textSubscribeSuccess + '</p>';
      
      setCookie(cookieName, true, {
        expires: 365,
        path: '/'
      });

      setTimeout(function () {
        if (isPopup) {
          $(popup).modal('hide');
        }
        successBlock.parentNode.removeChild(successBlock);
      }, 10000); // 10 seconds
    }
  }
})();