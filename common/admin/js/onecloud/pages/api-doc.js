'use strict';

var apiDoc = {
    makeCorrectUrl: function (appendix) {
        return window.location.origin + appendix;
    },
    item: {
        config: {
            deleteEl: document.querySelector('.delete'),
            delBtn: document.querySelectorAll('a.form-action'),
            filterControl: document.getElementById('collapse-filter-btn'),
            pagination: document.querySelectorAll('a.pagination__filter')
        },
        initButtons: function () {
            for (var i = 0; i < this.config.delBtn.length; i++) {
                this.config.delBtn[i].addEventListener('click', function (e) {
                    e.preventDefault();
                    $(apiDoc.modal.config.mBlock).modal('show');
                    apiDoc.modal.fill(this);
                })
            };
        },
        remove: function () {
            apiDoc.config.deleteEl.addEventListener('click', function () {

            })
        }
    },
    modal: {
        config: {
            mForm: document.getElementById('api-doc-form'),
            mFormId: 'api-doc-form',
            deleteConfirmElem: document.getElementById('delete-article-confirm'),
            mBlock: document.getElementById('modal-delete'),
            previewMBlock: '',
            previewBtn: '.apiDoc-fancy-preview',
            previewBlockId: ('preview-block'),
            previewBlock: document.getElementById('preview-block'),
            previewTitle: '#preview-title',
            previewDescription: '#preview-description',
            previewSeoTitle: '#preview-seo-title',
            previewSeoDescription: '#preview-seo-description',
            previewCheckbox: '#preview-checkbox'
        },
        drawSinglePreview: function () {
            $(apiDoc.modal.config.previewBtn).click(function (e) {
                e.preventDefault();
                var url = $(this).attr('href');
                $('pre, code').each(function (i, block) {
                    hljs.highlightBlock(block);
                });
                window.util.fillPreview(apiDoc.modal.config.previewBlockId, url, apiDoc.modal.fillPreviewCB);
            })
        },
        fillPreviewCB: function (data) {
            var elem = document.getElementById('noindex-bage');
            window.util.setElementVisibility(elem, data.IsPrivate);
        },
        fill: function (actionObj) {
            var mConfig = apiDoc.modal.config;
            mConfig.mForm.action = apiDoc.makeCorrectUrl(actionObj.getAttribute('href'));
            apiDoc.modal.removeErrors();
            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                apiDoc.modal.removeErrors();
                if (!mConfig.deleteConfirmElem.checked) {
                    errorMessageAdd($(mConfig.deleteConfirmElem), 'Необходимо подтвердить удаление');
                    return;
                }
                apiDoc.modal.submit(mConfig.mForm.action, actionObj.dataset.id, this);
            });
        },
        submit: function (urlLog, custId, form) {
            var sendObj = {};
            sendObj.apiDocId = custId;
            sendPostRequest('#' + form.id, form.action, sendObj, function () {
                location.reload();
            }, apiDoc.modal.onFail, 'DELETE');
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(apiDoc.modal.config.mFormId);
            var errChild = errParentBlock.getElementsByClassName(errorClass);
            while (errChild.length > 0) {
                errChild[0].parentNode.removeChild(errChild[0]);
            }
        },
        onFail: function (data) {
            handleAjaxErrors(data, '#' + apiDoc.modal.config.mFormId);
            apiDoc.actions.addErrorClass();
        }
    },
    init: function () {
        this.item.initButtons();
        $('[data-fancybox]').fancybox({});
        this.modal.drawSinglePreview();
    }
}
apiDoc.init();