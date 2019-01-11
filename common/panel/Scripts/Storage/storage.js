$(function () {
    /*
    * Activate
    */
    $('#storage-activate').submit(function (e) {
        e.preventDefault();

        let form = e.target;
        sendAjaxRequest('#' + form.id, form.action, {});
    });

    /*
     * InProgress
     * 1) We define `getActiveTaskUrl` and `getTaskProgressUrl` string variables in a view before tracking launch
     * 2) progressTaskUrl must be declared as MVC Url.Action with {taskId = -1}. After we get task, we will replace '-1' with current task Id
     */
    if (typeof getActiveTaskUrl !== 'undefined' && typeof getTaskProgressUrl !== 'undefined') {
        initTaskParallelProgessBar(getActiveTaskUrl, getTaskProgressUrl);
    }

    /*
    * Deactivate
    */
    $('#storage-deactivate').submit(function (e) {
        e.preventDefault();

        let form = e.target;
        let confirm = form.elements.DeactivateConfirm;
        if (confirm.checked) {
            sendAjaxRequest('#' + form.id, form.action, {});
        } else {
            errorMessageAdd($(confirm), resources.ConfirmRequired);
        }
    });
});
