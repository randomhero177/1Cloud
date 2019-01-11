$(function () {
    var rebuildFormId = '#action-rebuild-form',
        rebuildForm = $(rebuildFormId), 
        rebuildId = rebuildForm.find('[name="ServiceInstanceId"]'),
        rebuildConfirm = rebuildForm.find('[name="Confirm_Rebuild"]'),
        rebuildSelect = $('#os-select');

    rebuildSelect.chosen({
        disable_search_threshold: 50,
        no_results_text: resources.JS_Choosen_NoResults,
        placeholder_text_single: resources.JS_Choosen_NoResults,
        size: 6,
        width: '260px'
    });

    rebuildForm.submit(function (e) {
        e.preventDefault();
        var ifSend = true;

        if (rebuildSelect.val() == 0) {
            errorMessageAdd(rebuildSelect, resources.Server_rebuildChooseImage);
            ifSend = false;
        };
        if (!rebuildConfirm.prop('checked')) {
            errorMessageAdd(rebuildConfirm, resources.ConfirmRequired);
            ifSend = false;
        };
        if (ifSend) {
            sendAjaxRequest(rebuildFormId, rebuildForm.attr('action'), getPostObjRebuild());
        }
    });

    function getPostObjRebuild() {
        var obj = {};
        obj.ServiceInstanceId = rebuildId.val();
        obj.Confirm_Rebuild = true;
        obj.image = rebuildSelect.val();
        return obj;
    };
});