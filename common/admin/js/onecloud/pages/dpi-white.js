'use strict';

var Dpi = {
    config: {
        filterFormId: 'dpi-filter',
        instancesContainerId: 'dpi-blacklist',
        instancesListId: 'dpi-table',
        instancesListUrl: 'list'
    },

    makeCorrectUrl: function (appendix) {
        return window.location.origin + window.location.pathname + ((window.location.pathname.slice(-1) === '/') ? '' : '/') + appendix;
    },
    filter: {
        obj: {},
        config: {},
        submit: function () {
            Dpi.item.curInstance = {};
            Dpi.item.instanceBlock.classList.remove('main-list__info--active');
        },
        init: function () {
            Dpi.filter.obj = new Filter(Dpi.config.filterFormId);
            Dpi.filter.obj.init();
            var config = Dpi.filter.config;
            config.form = document.getElementById(Dpi.config.filterFormId);
            config.level = config.form.dataset.level;
        },
    },
    item: {
        initActionBtn: function () {
            for (var i = 0; i < Dpi.modal.config.actionBtn.length; i++) {
                Dpi.modal.config.actionBtn[i].addEventListener('click', function (e) {
                    e.preventDefault();
                    var curUrl = this.dataset.href,
                        curId = this.dataset.id,
                        curMethod = this.dataset.type;
                    Dpi.item.formSubmit(curId, curUrl, curMethod)
                })
            };
        },
        formSubmit: function (itemId, action, method) {
            var curForm = Dpi.modal.config.deactivateForm,
                confirmCheckbox = curForm.querySelector('.confirm-checkbox');
            curForm.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!confirmCheckbox.checked) {
                    var errorEl = curForm.getElementsByClassName(errorClass);
                    while (errorEl.length > 0) {
                        errorEl[0].parentNode.removeChild(errorEl[0]);
                    };
                    errorMessageAdd($(confirmCheckbox), 'Необходимо подтвердить действие');
                    return;
                };
                sendPostRequest('#' + curForm.id, action, {itemId: itemId}, function (data) {
                    console.log(data);
                }, function (data) { handleAjaxErrors(data); }, 'POST');
            })
        }
    },
    modal: {
        curAction: '',
        config: {
            mClose: document.getElementById('close-form'),
            actionBtn: document.querySelectorAll('.action-btn'),
            deactivateForm: document.getElementById('deactivate-form'),
            mForms: document.querySelectorAll('.confirm-action')
        },
    },
    init: function () {
        this.makeCorrectUrl('');
        this.filter.init();
        this.item.initActionBtn();
    }
}
Dpi.init();