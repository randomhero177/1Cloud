// COPY TO CLIPBOARD FUNCTIONS
$(function () {
    $('.copy-content').hover(function () {
        $(this).delay(1000).addClass('copy-content--hovered');
    }, function () {
        $(this).delay(1000).removeClass('copy-content--hovered');
    });
    if (typeof Clipboard === "function") {
        var clipboard = new Clipboard('.copy-btn');
        clipboard.on('success', function (e) {
            var copyText = $(e.trigger).text();
            $(e.trigger).html('<span class="glyphicon glyphicon-ok text-success"></span>')
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
});