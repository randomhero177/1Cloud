var vmware = (typeof vmware == "undefined" || !vmware) ? {} : vmware;
/* Requires:
 *   core.js
 *   debug.js
 */

/**
 * Display a form-based jQuery dialog.
 *
 * @param {string} title The title for the dialog.
 * @param {string} body The body of the dialog
 * @param {function} dataExtractor A function which will be called with the dialog as an argument when
 *     "Ok" is selected to extract data and return it.
 * @param {function} closeHandler A function which will be called when the confirmation is dismissed.
 * @param {function} okHandler A function which will be called when the "Ok" option is selected,
 *     but before the dialog has closed, with the return value of the extractor as an argument.
 */
vmware.dialog = function(title, body, dataExtractor, closeHandler, okHandler) {
    var dialogOverlay = $('<div></div>').addClass('ui-widget-overlay').appendTo($('body'));

    var dialog = $('<div></div>').attr("title", title);
    dialog.append(body);
    $('body').append(dialog);

    var dialogOptions = {
        modal: false,
        width: 500,
        buttons: {
        },
        close: function (event, ui) {
      //      vmware.log("TRACE", "dialog", "closing dialog");
            dialogOverlay.remove();
            dialog.remove();
            closeHandler();
        }
    };

    dialogOptions.buttons['Ok'.localize()] = function() {
    //    vmware.log("TRACE", "dialog", "Ok selected");
        var data = dataExtractor(dialog);
   //     vmware.log("TRACE", "dialog", "Data extracted: {0}".format(vmware.log.stringify(data)));
        dialog.dialog("close");
        okHandler(data);
    };

    dialogOptions.buttons['Cancel'.localize()] = function() {
  //      vmware.log("TRACE", "dialog", "Cancel selected");
        dialog.dialog("close");
    };

//    vmware.log("TRACE", "dialog", "displaying dialog");
    dialog.dialog(dialogOptions);
};