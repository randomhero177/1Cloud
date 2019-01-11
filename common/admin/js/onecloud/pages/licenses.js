'use strict';

var Licenses = {
    makeCorrectUrl: function (appendix) {
        return window.location.origin + appendix;
    },
    item: {
        config: {
            deleteEl: document.querySelector('.delete'),
            delBtn: document.querySelectorAll('a.delete-item'),
            filterControl: document.getElementById('collapse-filter-btn'),
            pagination: document.querySelectorAll('a.pagination__filter')
        },
        initButtons: function(){
            for (var i = 0; i < this.config.delBtn.length; i++) {
                this.config.delBtn[i].addEventListener('click', function(e){
                    e.preventDefault();
                    $(Licenses.modal.config.mBlock).modal('show');
                    Licenses.modal.fill(this);
                })
            };
        }
    },
    modal: {
        config: {
            mForm: document.getElementById('delete-form'),
            mFormId: 'delete-form',
            deleteConfirmElem: document.getElementById('delete-confirm'),
            mBlock: document.getElementById('modal-delete'),
            previewMBlock: '',
            previewBtn: '.fancy-preview',
            previewBlockId: ('preview-block'),
            previewBlock: document.getElementById('preview-block'),
            editBtn: '.fancy-edit',
            editBlockId: 'edit-block',
            editDetailBlockId: 'edit-license-detail',
            editFormId: 'edit-form',
            editModelObj: {
                Id: '#hiddenId',
                stateEdit: '#stateEdit',
                count: '#edit-count'
            }
        },
        drawSinglePreview: function(){
            $(Licenses.modal.config.previewBtn).click(function (e) {
                e.preventDefault();
                var url = $(this).data('href');
                window.util.fillPreview(Licenses.modal.config.previewBlockId, url, Licenses.modal.fillPreviewCB);
            });
        },
        drawSingleEdit: function () {
            $(Licenses.modal.config.editBtn).click(function (e) {
                e.preventDefault();
                var url = $(this).data('href');
                window.util.fillPreview(Licenses.modal.config.editDetailBlockId, url, Licenses.modal.fillEditCB);
            })
        },
        fillPreviewCB: function (data) {
            if (data.License != null) {
                $('[data-license]').removeClass('hidden');
                var licenseEl = document.querySelectorAll('[data-previewname]');
                [].forEach.call(licenseEl, function (el) {
                    el.textContent = data.License[el.dataset.previewname];
                    if (el.dataset.previewname == 'IsActive') {
                        el.textContent = window.util.convertBooleanToRussian(data.License[el.dataset.previewname]);
                    };
                    if (el.dataset.previewname == 'ExpireDate') {
                        el.textContent = window.util.formatDate(new Date(data.License[el.dataset.previewname]));
                    }
                })
            };
            var dateEl = document.querySelectorAll('[data-date]');
            [].forEach.call(dateEl, function (el) {
                var dateCreate = new Date(data[el.dataset.preview]);
                el.textContent = window.util.formatDate(dateCreate);
            });
        },
        fillEditCB: function (data) {
            var c = Licenses.modal.config,
            block = document.getElementById(c.editBlockId);
            var editCount = document.querySelector(c.editModelObj.count);
            editCount.value = data.Count;
            if (data.CanChangeCount) {
                editCount.disabled = false;
            } else {
                editCount.disabled = true;
            };

            var stateSelect = document.querySelector(c.editModelObj.stateEdit);
            stateSelect.value = data.State;
            Licenses.modal.sendEditForm();
        },
        fill: function (actionObj) {
            var mConfig = Licenses.modal.config;
            mConfig.mForm.action = Licenses.makeCorrectUrl(actionObj.getAttribute('href'));
            Licenses.modal.removeErrors();
            $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
                event.preventDefault();
                Licenses.modal.removeErrors();
                if (!mConfig.deleteConfirmElem.checked) {
                    errorMessageAdd($(mConfig.deleteConfirmElem), 'Необходимо подтвердить удаление');
                    return;
                }
                Licenses.modal.submitDelete(mConfig.mForm.action, actionObj.dataset.id, this);
            });
        },
        removeErrors: function () {
            var errParentBlock = document.getElementById(Licenses.modal.config.mFormId);
            var errChild = errParentBlock.getElementsByClassName(errorClass);
            while (errChild.length > 0) {
                errChild[0].parentNode.removeChild(errChild[0]);
            }
        },
        submitDelete: function (urlLog, custId, form) {
            sendPostRequest('#' + form.id, form.action, { licenseId: custId }, function () {
                location.reload();
            }, Licenses.modal.onFail, 'DELETE');
        },
        sendEditForm: function () {
            var c = Licenses.modal.config,
                form = document.getElementById(c.editFormId);
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var obj = {};
                obj.Id = form.querySelector(c.editModelObj.Id).textContent;
                obj.State = form.querySelector(c.editModelObj.stateEdit).value;
                obj.Count = form.querySelector(c.editModelObj.count).value;
                sendPostRequest('#' + c.editFormId, form.action, obj, function (data) {
                    console.log(data);
                }, function (data) {
                    handleAjaxErrors(data);
                }, 'POST');
            });
        }
    },
    init: function(){
        this.item.initButtons();
        $('[data-fancybox]').fancybox({});
        this.modal.drawSinglePreview();
        this.modal.drawSingleEdit();
    }
}
Licenses.init();