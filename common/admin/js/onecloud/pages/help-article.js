'use strict';

var Helps = {
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
                    $(Helps.modal.config.mBlock).modal('show');
                    Helps.modal.fill(this);
                })
            };
        },
        remove: function(){
            Helps.config.deleteEl.addEventListener('click', function () {

            })
        }
    },
    modal: {
        config: {
            mFormId: 'help-comment-form',
            mForm: document.getElementById('help-comment-form'),
            mBlock: document.getElementById('modal-comment'),
            mInput: document.getElementById('help-inputs-block'),
            mTitle: document.getElementById('comment-title'),
            mIntro: document.getElementById('comment-intro'),
            mHidden: document.getElementById('comment-hidden'),
            mText: document.getElementById('comment-text'),
            mClose: document.getElementById('close-form'),
            mDropzone: false,
            mSendBtn: document.getElementById('comment-send')
        },
        fill: function (actionObj) {
            var mConfig = Helps.modal.config;
            mConfig.mForm.action = Helps.makeCorrectUrl(actionObj.getAttribute('href'));

            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                Helps.modal.removeErrors();
                Helps.modal.submit(mConfig.mForm.action, actionObj.dataset.id, this);
            });
        },
        submit: function (urlLog, custId, form) {
            var sendObj = {};
            sendObj.articleId = custId;
            sendPostRequest('#' + form.id, form.action, sendObj, Helps.modal.onSuccess, Helps.modal.onFail);
            location.reload();
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(Helps.modal.config.mFormId);
            var errChild = errParentBlock.getElementsByClassName(errorSummaryClass);
            while (errChild.length > 0) {
                errChild[0].parentNode.removeChild(errChild[0]);
            }
        },
        onSuccess: function (data) {
            $(Helps.modal.config.mBlock).modal('hide');
            Helps.actions.successPopUp();
        },
        onFail: function (data) {
            handleAjaxErrors(data, '#' + Tasks.modal.config.mFormId);
            Helps.actions.addErrorClass();
        },
    },
    actions: {
        successPopUp: function () {
            var succChild = document.createElement('div'),
                succEl = '<div class="success-window"><div class="bs-component"><div class="alert alert-micro alert-border-left alert-success alert-dismissable"><button type="button" data-dismiss="alert" aria-hidden="true" class="close"></button><i class="fa fa-check pr10"></i><strong>Well done!</strong> Изменения успешно внесены.</div></div></div>',
                blockToShow = document.querySelector('#showStat');
            succChild.innerHTML = succEl;
            blockToShow.insertBefore(succChild, blockToShow.firstChild);
            setTimeout(function () {
                Helps.actions.clearSucc(succChild, blockToShow);
            }, 5000);
        },
        clearSucc: function (deleteThis, deleteFrom) {
            deleteFrom.removeChild(deleteThis);
        },
        addErrorClass: function () {
            var errChild = document.getElementsByClassName(errorSummaryClass);
            if (errChild.length > 0) {
                for (var i = 0; errChild.length > i; i++) {
                    errChild[i].classList.add('alert', 'alert-danger');
                }
            }
        }
    },
    init: function(){
        this.item.initButtons();
        $("[data-fancybox]").fancybox({});
    }
}
Helps.init();