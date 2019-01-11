$(function () {
  var copyFormId = '#action-copyForm',
    copyForm = $(copyFormId),
    copyFormConfirm = $('#CopyConfirm');

  if ($('#NetworkId').length) {
    $('#NetworkId').chosen({ disable_search_threshold: 10, width: '100%' });
  }

  copyForm.submit(function (e) {
    e.preventDefault();
    if (!copyFormConfirm.prop('checked')) {
      errorMessageAdd(copyFormConfirm, resources.ConfirmRequired);
    } else {
      sendAjaxRequest(copyFormId, copyForm.attr('action'), getPostObjCopy());
    }
  });
  
  function getPostObjCopy() {
    PostObjCopy = {};
    PostObjCopy.Name = copyForm.find('[name="Name"]').val();
    PostObjCopy.ServiceInstanceId = copyForm.find('[name="ServiceInstanceId"]').val();
    
    if ($('#NetworkId').length) {
      if ($('[name="NetworkId"] option:selected').val() !== "0") {
        PostObjCopy.NetworkId = copyForm.find('[name="NetworkId"]').val();
      } else {
        PostObjCopy.NetworkId = null
      }

    }
    return PostObjCopy;
  }
});
