$.fn.scrollTo = function (speed) {
    if (typeof (speed) == 'undefined')
        speed = 1000;

    $('html, body').animate({
        scrollTop: parseInt($(this).offset().top)
    }, speed);
};