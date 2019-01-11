// COPY TO CLIPBOARD FUNCTIONS
$(function () {
  initClipboardButtons('.copy-btn');
});

function initClipboardButtons(selector) {
  var parent = $(selector).parent();
  var parentClass = 'copy-content';

  parent.addClass(parentClass);

  parent.hover(function () {
    $(this).delay(1000).addClass(parentClass + '--hovered');
  }, function () {
    $(this).delay(1000).removeClass(parentClass + '--hovered');
    });

  if (typeof Clipboard === "function") {
    var clipboard = new Clipboard(selector);
    clipboard.on('success', function (e) {
      var copyText = $(e.trigger).text();
      $(e.trigger).html('<span class="glyphicon glyphicon-ok"></span>')
      setTimeout(function () {
        $(e.trigger).parent().delay(500).removeClass('copy-content--hovered');
        $(e.trigger).text(copyText);
      }, 1000);
      e.clearSelection();
    });

    clipboard.on('error', function (e) {
      var copyText = $(e.trigger).text();
      $(e.trigger).html('<span class="glyphicon glyphicon-exclamation-sign" style="color:red;"></span>')
      setTimeout(function () {
        $(e.trigger).parent().delay(500).removeClass('copy-content--hovered');
        $(e.trigger).text(copyText);
      }, 1000);
    });
  }
}