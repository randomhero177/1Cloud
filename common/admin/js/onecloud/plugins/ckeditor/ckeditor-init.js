'use strict';

CKEDITOR.replaceAll('js-ckeditor', {
    customConfig: 'config-onecloud.js',
    height: 400,
    allowedContent: true
});

CKEDITOR.dtd.$removeEmpty.span = 0;
CKEDITOR.dtd.$removeEmpty.i = 0;

var data = CKEDITOR.instances.Description.getData();