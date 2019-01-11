'use strict';
//
//  This file is reserved for changes made by the use. 
//  Always seperate your work from the theme. It makes
//  modifications, and future theme updates much easier 
// 

$(document).ready(function () {
    // Set name of a file attached to corresponding area
    $('.gui-file').change(function () {
        $(this).next('.gui-filename').val($(this).val().split(/(\\|\/)/g).pop());
    });
});
