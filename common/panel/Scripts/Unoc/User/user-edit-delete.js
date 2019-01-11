/*
 * variable companyId is defined in Edit view
 */

var deleteBlockId = '#unoc-user-delete',
    deleteConfirmId = '#unoc-user-delete-input',
    deleteBtnId = '#unoc-user-delete-btn';

$(function () {
    $(deleteBtnId).click(function () {
        if (!$(deleteConfirmId).prop('checked')) {
            errorMessageAdd($(deleteConfirmId), resources.ConfirmRequired);
        } else {
            sendAjaxRequest(deleteBlockId, $(deleteBlockId).data('action'), { UserId: userId, isConfirmed: true}, function () {
                location.reload();
            }, null, 'DELETE');
        }
    });
});