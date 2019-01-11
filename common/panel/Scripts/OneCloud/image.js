$(function () {
  var c = {
    formSelector: '#create-image-form',
    serverNameSelector: '#new_image_name_server',
    serverIdSelector: '#ServiceInstanceId',
    deleteBtnSelector: '.delete-image-item'
  };

  var createForm = document.querySelector(c.formSelector);
  var delBtns = document.querySelectorAll(c.deleteBtnSelector);

  if (createForm) {
    initCreateImageForm();
  }

  if (delBtns.length > 0) {
    addDeleteImageListeners();
  }

  function initCreateImageForm() {
    var btn = createForm.querySelector('[type="submit"]');
    $(c.serverNameSelector).chosen({
      disable_search_threshold: 10,
      search_contains: true
    }).change(function (e, params) {
      $(c.serverIdSelector).val(params.selected).trigger('change');
    });

    createForm.addEventListener('submit', sendCreateImageRequest);
    btn.addEventListener('click', sendCreateImageRequest);
  }

  function sendCreateImageRequest(e) {
    e.preventDefault();
    e.stopPropagation();

    reachCounterGoal('tryingcreatepattern', 'try');

    var image = getImagePostObj();
    var errors = 0;

    for (var name in image) {
      if (image[name] === '') {
        errorMessageAdd($('[name="' + name + '"]'), resources.Required);
        errors++;
      }
      if (window.util.checkIfHtml(image[name])) {
        errorMessageAdd($('[name="' + name + '"]'), resources.HtmlTagNotAvaliable);
        errors++;
      }
    }
    if (errors > 0) {
      return;
    }

    reachCounterGoal('creatingpattern', 'submit');
    sendAjaxRequest(c.formSelector, createForm.action, image);
  }

  function getImagePostObj() {
    return {
      TechTitle: document.querySelector('[name="TechTitle"]').value,
      Title: document.querySelector('[name="Title"]').value,
      ServiceInstanceId: document.querySelector('[name="ServiceInstanceId"]').value
    };
  }

  function addDeleteImageListeners() {
    [].forEach.call(delBtns, function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        initDeleteImage(btn.dataset.id, btn.dataset.title);
      });
    });
  }

  function initDeleteImage(id, title) {
    var confirm = new ConfirmPopup({
      text: resources.deleteDescr,
      cbProceed: function () {
        sendAjaxRequest('#image-list', deleteImageUrl, {
          ImageId: id,
          Confirm_Delete: true
        });
      },
      title: resources.deleteTitle.replace('defaultTitle', title),
      alertText: resources.deleteNotice,
      alertType: 'info',
      proceedText: resources.Shared_Confirm
    });
  }
});