'use strict';

var Feedback = {
    makeCorrectUrl: function (appendix) {
        return window.location.origin + appendix;
    },
    item: {
        config: {
            deleteEl: document.querySelector('.delete'),
            delBtn: document.querySelectorAll('a.form-action'),
            filterControl: document.getElementById('collapse-filter-btn'),
            pagination: document.querySelectorAll('a.pagination__filter')
        }
    },
    modal: {
        config: {
            previewBtn: '.news-fancy-preview',
            previewBlockId: ('preview-feedback-block')
        },
        drawSinglePreview: function () {
          $(Feedback.modal.config.previewBtn).click(function (e) {
            e.preventDefault();
            var url = $(this).data('href');
            window.util.fillPreview(Feedback.modal.config.previewBlockId, url);
          })
        },
        fillPreviewCB: function (data) {
            var elems = document.querySelectorAll('[data-checkbox]');
            [].forEach.call(elems, function (el) {
                el.checked = data[el.dataset.previewname];
            });
        }
    },
    init: function () {
        this.modal.drawSinglePreview();
    }
}
Feedback.init();