$(function () {

    // ==================== MODAL FORMS ON PAGE =====================
    var kpFormId = '#request-kp-form',
        testFormId = '#request-testperiod-form';

    $(kpFormId).on('submit', function (e) {
        e.preventDefault();
      sendPostRequest(kpFormId, $(kpFormId).attr('action'), getNetworkMessageObj($(kpFormId)), function () {
        reachCounterGoal('calkpricesentcloud', 'submit');
        networkMessageAjaxSuccess();
      });
    });

    $(testFormId).on('submit', function (e) {
        e.preventDefault();
      sendPostRequest(testFormId, $(testFormId).attr('action'), getNetworkMessageObj($(testFormId)), function () {
        reachCounterGoal('cloudtestspecialsent', 'submit');
        networkMessageAjaxSuccess();
      });
    });

    function getNetworkMessageObj(formObj) {
        var result = {};
        var subjectField = formObj.find('[name="Subject"]');

        result.Name = formObj.find('[name="Name"]').val();
        result.Email = formObj.find('[name="Email"]').val();
        result.Phone = formObj.find('[name="Phone"]').val();
        result.Company = formObj.find('[name="Company"]').val();
        result.City = formObj.find('[name="City"]').val();
        result.Body = formObj.find('[name="Body"]').val();

        if (subjectField.length > 0) {
            result.Subject = subjectField.val();
        }

        return result;
    }
    function networkMessageAjaxSuccess() {
        var modalActive = $('.modal.in');
        if (modalActive.length > 0) {
            var modalForm = modalActive.find('form'),
                modalFormId = modalForm.attr('id');

            modalForm[0].reset();
            modalForm.replaceWith($('<div />', {
                id: modalFormId + '-success',
                'html': '<p class="alert alert-success text-center">' + textSent + '</p><p class="text-center">В ближайшее время на указанный email <br />вам ответит наш сотрудник</p>'
            }));

            modalActive.on('show.bs.modal', function () {
                if (modalActive.find('#' + modalFormId + '-success').length > 0) {
                    $('#' + modalFormId + '-success').replaceWith(modalForm);
                }
            });
        }
    }
});