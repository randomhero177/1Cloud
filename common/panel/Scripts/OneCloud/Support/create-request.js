var myDropzone = false;
var formId = 'create-request',
  form = document.getElementById(formId),
  closeBtn = $('#close-ticket-btn'),
  closeForm = $('#close-ticket-form');

if (lang && lang == 'ru') {
  Dropzone.prototype.defaultOptions.dictDefaultMessage = "Для добавления файлов кликните или просто переместите файлы сюда";
  Dropzone.prototype.defaultOptions.dictFallbackMessage = "Ваш браузер не поддерживает загрузку файлов через drag'n'drop.";
  Dropzone.prototype.defaultOptions.dictFallbackText = "Пожалуйста, для добавления файлов используйте поле, приведенное ниже.";
  Dropzone.prototype.defaultOptions.dictFileTooBig = "Файл слишком большой: ({{filesize}}MiB). Максимальный размер: {{maxFilesize}}MiB.";
  Dropzone.prototype.defaultOptions.dictInvalidFileType = "Загружать файлы такого типа запрещено.";
  Dropzone.prototype.defaultOptions.dictResponseError = "Сервер ответил с кодом {{statusCode}}.";
  Dropzone.prototype.defaultOptions.dictCancelUpload = "Отменить загрузку";
  Dropzone.prototype.defaultOptions.dictCancelUploadConfirmation = "Вы уверены, что хотите отменить ззагрузку данного файла?";
  Dropzone.prototype.defaultOptions.dictRemoveFile = "Удалить файл";
  Dropzone.prototype.defaultOptions.dictMaxFilesExceeded = "Достигнут максимум количества файлов для одного сообщения.";
}

if ($('.comments__item-file.fancybox').length > 0) {
  $('.comments__item-file.fancybox').fancybox({
    'type': 'image',
    'loop': false
  });
}

if (form) {
  var formBtn = form.querySelector('[type="submit"]'),
    formBtnDefaultText = formBtn.value,
    collapseBtn = document.getElementById('reply-form-btn'),
    collapseBlock = document.getElementById('reply-form');

  Dropzone.options.commentDropzone = {
    url: '#', // default. Real url will be assigned when submitting form
    autoProcessQueue: false,
    uploadMultiple: true,
    parallelUploads: 100,
    maxFiles: resources.Upload.MaxUploadFiles,
    maxFilesize: resources.Upload.MaxUploadFileSize / 1024 / 1024,
    addRemoveLinks: true,
    acceptedFiles: 'image/*,.doc,.docx,.txt,.rtf,.pdf,.zip,.rar,.7z,.tar.bz2,.tar.gz,.xls,.xlsx,.csv',
    init: function () {
      myDropzone = this;

      this.on('addedfile', function (file) {
        file.previewElement.classList.add('dz-success', 'dz-complete');
      });
      this.on('removedfile', function () {
        $('[name="Attachments"]').trigger('change');
      });

      formBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        submitRequest();
      });
    },
    fallback: function () {
      document.getElementById('dropzone-fallback').querySelector('.onecloud-file').classList.remove('hidden');
    }
  }

  form.submit = function (e) {
    e.preventDefault();
    e.stopPropagation();
    submitRequest();
  };

  if (collapseBlock && collapseBtn) {
    $(collapseBlock).on('show.bs.collapse', function () {
      collapseBtn.querySelector('.reply-btn-text').textContent = collapseBtn.dataset.closeText;
      collapseBtn.querySelector('.glyphicon').classList.remove('glyphicon-plus');
      collapseBtn.querySelector('.glyphicon').classList.add('glyphicon-minus');
    }).on('hide.bs.collapse', function () {
      collapseBtn.querySelector('.reply-btn-text').textContent = collapseBtn.dataset.openText;
      collapseBtn.querySelector('.glyphicon').classList.remove('glyphicon-minus');
      collapseBtn.querySelector('.glyphicon').classList.add('glyphicon-plus');
    });
  }

  function submitRequest() {
    var isValid = true,
      formData = new FormData(),
      formFiles = (typeof myDropzone !== 'boolean') ? myDropzone : document.getElementById('Attachments'),
      biggerFilesCount = 0,
      checkElem = document.querySelectorAll('.check-html'),
      checkbox = document.getElementById('IsViewedFAQ');

    [].forEach.call(checkElem, function (el) {
      if (el.value === '') {
        isValid = false;
        errorMessageAdd($(el), resources.Required);
      }

      if (window.util.checkIfHtml(el.value)) {
        isValid = false;
        errorMessageAdd($(el), resources.HtmlTagNotAvaliable);
      }
    });

    if (checkbox && !checkbox.checked) {
      isValid = false;
      errorMessageAdd($(checkbox), resources.Required);
    };

    if (formFiles.files.length > resources.Upload.MaxUploadFiles) {
      isValid = false;
      errorMessageAdd($('[name="Attachments"]'), resources.Upload.MaxUploadFilesErrorText);
    }

    [].forEach.call(formFiles.files, function (el) {
      if (el.size > resources.Upload.MaxUploadFileSize) {
        biggerFilesCount++;
      }
    });
    if (biggerFilesCount > 0) {
      isValid = false;
      errorMessageAdd($('[name="Attachments"]'), resources.Upload.MaxUploadFileSizeErrorText);
    }

    if (!isValid) {
      return;
    }
    if (formBtn.value !== resources.Sending) {
      formData.append('__RequestVerificationToken', document.querySelector('[name="__RequestVerificationToken"]').value);

      if (!collapseBlock) {
        formData.append('IsViewedFAQ', document.querySelector('[type="checkbox"][name="IsViewedFAQ"]').checked);
        formData.append('Subject', document.querySelector('[name="Subject"]').value);
        formData.append('Question', document.querySelector('[name="Question"]').value);
      } else {
        formData.append('TicketID', document.querySelector('[name="TicketID"]').value);
        formData.append('ReplyText', document.querySelector('[name="ReplyText"]').value);
      }

      if (formFiles.files.length > 0) {
        for (var i = 0; i < formFiles.files.length; i++) {
          formData.append('Attachments', formFiles.files[i]);
        }
      }

      formBtn.value = resources.Sending;

      $.ajax({
        type: 'POST',
        url: form.action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
          if (data.redirectTo) {
            window.location.href = data.redirectTo;
          } else {
            location.reload();
          }
        },
        error: function (data) {
          formBtn.value = formBtnDefaultText;
          handleAjaxErrors(data, '#' + formId);
        },
        fail: function (data) {
          console.log('fail commenting');
        }
      });
    }
  }
}

closeForm.submit(function (e) {
  e.preventDefault();
  e.stopPropagation();

  let confirm = new ConfirmPopup({
    text: resources.Support_Close_Ticket_Confirm,
    cbProceed: function () {
      reachCounterGoal('helprequest', 'submit');
      sendAjaxRequest('#' + closeForm.attr('id'), closeForm.attr('action'), {});
    },
    title: resources.Support_Close_Ticket_Confirm_Title,
    alertText: resources.Shared_Action_Undone
  });
});