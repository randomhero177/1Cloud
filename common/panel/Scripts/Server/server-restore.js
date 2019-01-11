$(function () {
    var restoreFormId = 'restore-server-form',
        restoreFormObj = $('#' + restoreFormId),
        restoreTypeId = 'restore-type-switch',
        restoreTypeObj = $('#' + restoreTypeId);

    if (restoreFormObj.length > 0) {
        initRestoreSwitch(restoreTypeObj);
        changeRestoreType();

        restoreFormObj.submit(function (e) {
            e.preventDefault();
            var restoreConfirm = restoreFormObj.find('[name="Confirm_Restore"]');
            if (typeof restoreFormObj.find('[name="SelectedRestorePointId"]:checked').val() === 'undefined') {
                errorMessageAdd($('#SelectedRestorePointId'), resources.Server_Backup_Restore_No_Point_Chosen);
                return;
            }
            if (restoreTypeObj.prop('checked') && !restoreConfirm.prop('checked')) {
                errorMessageAdd(restoreConfirm, resources.ConfirmRequired);
                return;
            }
            sendAjaxRequest('#' + restoreFormId, restoreFormObj.attr('action'), getRestoreObj());
        });

    }
    
    function initRestoreSwitch(checkbox) {
        checkbox.switchButton({
            width: 40,
            height: 25,
            button_width: 25,
            on_label: resources.Server_Backup_Restore_Type_Over,
            off_label: resources.Server_Backup_Restore_Type_Near,
            labels_placement: 'both',
            clear_after: null,
            on_callback: changeRestoreType,
            off_callback: changeRestoreType
        });
    }
    function changeRestoreType() {
        $('.restore__description').addClass('hidden');
        if (restoreTypeObj.prop('checked')) {
            $('#restore-confirm').removeClass('hidden');
            $('#restore-over-description').removeClass('hidden');
        } else {
            $('#restore-confirm').addClass('hidden');
            $('#restore-near-description').removeClass('hidden');
        }
    }

    function getRestoreObj() {
        var obj = {};
        obj.Overwrite = restoreTypeObj.prop('checked');
        obj.ServiceInstanceId = Number(restoreFormObj.find('[name="ServiceInstanceId"]').val()); 
        obj.SelectedRestorePointId = Number(restoreFormObj.find('[name="SelectedRestorePointId"]:checked').val());
        obj.Confirm_Restore = restoreFormObj.find('[name="Confirm_Restore"]').prop('checked');

        return obj;
    }


});