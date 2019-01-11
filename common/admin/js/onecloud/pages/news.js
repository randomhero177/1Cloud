'use strict';

var News = {
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
        initButtons: function(){
            for (var i = 0; i < this.config.delBtn.length; i++) {
                this.config.delBtn[i].addEventListener('click', function(e){
                    e.preventDefault();
                    $(News.modal.config.mBlock).modal('show');
                    News.modal.fill(this);
                })
            };
        },
        remove: function(){
            News.config.deleteEl.addEventListener('click', function () {

            })
        }
    },
    modal: {
        config: {
            mForm: document.getElementById('help-comment-form'),
            mFormId: 'help-comment-form',
            deleteConfirmElem: document.getElementById('delete-article-confirm'),
            mBlock: document.getElementById('modal-delete'),
            previewMBlock: '',
            previewBtn: '.news-fancy-preview',
            previewBlockId: ('preview-news-block'),
            previewBlock: document.getElementById('preview-news-block'),
            previewTitle: '#preview-title',
            previewDescription: '#preview-description',
            previewSeoTitle: '#preview-seo-title',
            previewSeoDescription: '#preview-seo-description',
            previewCheckbox: '#preview-checkbox',
            previewPartnersId: '#preview-partners',
            partnersGroupId: '#partners-group'
        },
        drawSinglePreview: function(){
            $(News.modal.config.previewBtn).click(function (e) {
                e.preventDefault();
                var url = $(this).attr('href');
                window.util.fillPreview(News.modal.config.previewBlockId, url, News.modal.fillPreviewCB);
            })
        },
        fillPreviewCB: function (data) {
          var elem = document.getElementById('noindex-bage'),
            bool = (typeof data.IsNoIndex !== 'undefined') ? data.IsNoIndex : data.IsShowForAllCustomers;
          if (elem && typeof bool !== 'undefined') {
            window.util.setElementVisibility(elem, bool);
          };
          if (data.Partners && Array.isArray(data.Partners)) {
            News.modal.fillPartnersArray(data.Partners)
          };
        },
        fill: function (actionObj) {
            var mConfig = News.modal.config;
            mConfig.mForm.action = News.makeCorrectUrl(actionObj.getAttribute('href'));
            News.modal.removeErrors();
            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                News.modal.removeErrors();
                if (!mConfig.deleteConfirmElem.checked) {
                    errorMessageAdd($(mConfig.deleteConfirmElem), 'Необходимо подтвердить удаление');
                    return;
                }
                News.modal.submit(mConfig.mForm.action, actionObj.dataset.id, this);
            });
      },
        fillPartnersArray: function (array) {
          let c = News.modal.config,
            blockWrap = $(c.previewPartnersId),
            partnersBlock = $(c.partnersGroupId);
          if (array.length > 0) {
            blockWrap.removeClass('hidden');
            partnersBlock.html('');
            array.forEach(function (el) {
              var block = $('<span />', {
                'class': 'checkbox-custom checkbox-primary mr20 pointer-none'
              }),
                checkbox = $('<input type="checkbox" checked/>', {}),
                label = $('<label for="' + el.Name + '">', {
                  'class': 'checkbox-custom checkbox-primary'
                }).text(el.Name);
              block.append(checkbox);
              block.append(label);
              partnersBlock.append(block);
            });
          } else {
            blockWrap.addClass('hidden');
          };
        },
        submit: function (urlLog, custId, form) {
            var sendObj = {};
            sendObj.newsId = custId;
            sendPostRequest('#' + form.id, form.action, sendObj, function () {
                location.reload();
            }, News.modal.onFail, 'DELETE');
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(News.modal.config.mFormId);
            var errChild = errParentBlock.getElementsByClassName(errorClass);
            while (errChild.length > 0) {
                errChild[0].parentNode.removeChild(errChild[0]);
            }
        },
        onFail: function (data) {
            handleAjaxErrors(data, '#' + News.modal.config.mFormId);
            apiDoc.actions.addErrorClass();
        }
    },
    init: function(){
        this.item.initButtons();
        $('[data-fancybox]').fancybox({});
        this.modal.drawSinglePreview();
    }
}
News.init();