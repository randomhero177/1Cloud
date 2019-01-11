/*
 * Run "switch connection" plugin for concrete checkbox, via switchButton jQuery plugin
 * @obj checkbox - jQuery object of server connection checkbox
 * @string option - name of data-option to change value when switched
 * @func cb - callback function to process switch
 */
function initItemSwitch(checkbox, option, cb) {
    checkbox.switchButton({
        width: 50,
        height: 25,
        button_width: 25,
        checked: (typeof option !== 'undefined') ? checkbox.data(option) : checkbox.data('checked'),
        on_label: resources.TurnOn,
        off_label: resources.TurnOff,
        labels_placement: "right",
        clear_after: null
    });

    if (typeof cb === 'function') {
        checkbox.switchButton('option', 'on_callback', cb);
        checkbox.switchButton('option', 'off_callback', cb);
    }
}

/*
 * Sends request for tasks and proceeding them
 * @obj data - server response on edit company request
 */

if (typeof getActiveTaskUrl !== 'undefined' && typeof getTaskProgressUrl !== 'undefined') {
    initTaskParallelProgessBar(getActiveTaskUrl, getTaskProgressUrl);
};