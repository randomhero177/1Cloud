/*
 * variable companyId is defined in Edit view
 */

var deleteBlockId = '#unoc-company-delete',
    deleteConfirmId = '#unoc-company-delete-input',
    deleteBtnId = '#unoc-company-delete-btn';

$(function () {
    $(deleteBtnId).click(function () {
        if (!$(deleteConfirmId).prop('checked')) {
            errorMessageAdd($(deleteConfirmId), resources.ConfirmRequired);
        } else {
            sendAjaxRequest(deleteBlockId, $(deleteBlockId).data('action'), { companyId: companyId, isConfirmed: true}, function () {
                location.reload();
            }, null, 'DELETE');
        }
    });
});