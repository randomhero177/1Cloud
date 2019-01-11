/**
 * Inits document's generation and downloading. Form MUST have an AntiforgeryToken
 * @param {string} formSelector - selector with ID ('#id' - for example)
 * @param {array} objConfig - array of fields to be added in post-object
 */
function generateAndDownloadDocument(formSelector, objConfig) {
  var form = $(formSelector);

  form.on('submit', function (e) {
    e.preventDefault();

    var submitBtn = form.find('[type="submit"]');
    var postObj = {};
    postObj['__RequestVerificationToken'] = form.find('[name="__RequestVerificationToken"]').val();

    objConfig.forEach(function (field) {
      postObj[field] = form.find('[name="' + field + '"]').val();
    });

    submitBtn.addClass('btn-inprogress');
    dowloadFileViaAjax(form.attr('action'), postObj, function () {
      submitBtn.removeClass('btn-inprogress');
      var notice = new PanelNotice('Документ успешно сформирован!', 'success');
    }, function () {
      submitBtn.removeClass('btn-inprogress');
      var notice = new PanelNotice('В процессе формирования документа произошла ошибка', 'danger');
    });
  });
}

/**
 * Provides ajax-based file download from server functionality (POST-request)
 * @param {string} sendUrl - request URL (required)
 * @param {object} sendObj - object to send to server
*  @param {function} cbSuccess - success callback function
*  @param {function} cbError - fail callback function
 */
function dowloadFileViaAjax(sendUrl, sendObj, cbSuccess, cbError) {
  if (typeof sendUrl !== 'string') {
    throw new TypeError('URL must be a string');
  }

  var sendString = Object.keys(sendObj).map(function (key) {
    return key + '=' + sendObj[key]
  }).join('&');

  var xhr = new XMLHttpRequest();

  xhr.open('POST', sendUrl, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader("X-PID", user.projectId);
  xhr.responseType = 'blob';

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      switch (xhr.status) {
        case 200:
          var disposition = xhr.getResponseHeader('content-disposition');
          var fileType = xhr.getResponseHeader('content-type');
          var filename = (disposition) ? disposition.split('filename=')[1] : 'file.pdf';

          var blob = new Blob([xhr.response], { type: fileType });

          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = filename;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          if (typeof cbSuccess === 'function') {
            cbSuccess();
          }
          break;

        case 500:
        case 401:
        case 404:
        case 403:
          console.log(xhr.status + ': ' + xhr.statusText + '. ' + xhr.response);

          if (typeof cbError === 'function') {
            cbError();
          }
          break;

        default:
          console.log(xhr.status + " " + xhr.statusText);
      }
    }
  };

  xhr.send(sendString);  
}