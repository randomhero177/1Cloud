'use strict';

var Roles = {
    makeCorrectUrl: function (appendix) {
        return window.location.origin + appendix;
    },
    item: {
        config: {
          delBtn: document.querySelectorAll('a.form-action'),
          createBtn: document.getElementById('create-role-btn')
        },
        initButtons: function(){
            for (var i = 0; i < this.config.delBtn.length; i++) {
                this.config.delBtn[i].addEventListener('click', function(e){
                    e.preventDefault();
                    $(Roles.modal.config.mBlock).modal('show');
                    Roles.modal.removeErrors(Roles.modal.config.mForm);
                    Roles.modal.fillDelete(this);
                })
            };
            Roles.item.config.createBtn.addEventListener('click', function (e) {
              e.preventDefault();
              $('#add-role-modal').modal('show');
            })
        },
        initCreate: function () {
          var form = document.getElementById('add-role-form'),
            obj = {};
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            Roles.modal.removeErrors(form);
            obj.PartnerId = form.querySelector('[name="PartnerId"]').value;
            obj.Role = form.querySelector('[name="Role"]').value;
            obj.UserEmail = form.querySelector('[name="UserEmail"]').value;
            sendPostRequest('#add-role-form', form.action, obj, function () {
              location.reload();
            });
          })
        }
    },
    modal: {
        config: {
            mForm: document.getElementById('help-comment-form'),
            mFormId: 'help-comment-form',
            deleteConfirmElem: document.getElementById('delete-article-confirm'),
            mBlock: document.getElementById('modal-delete'),
        },
        fillDelete: function (actionObj) {
          var mConfig = Roles.modal.config,
            obj = {};
          obj.UserId = actionObj.dataset.id;
          obj.Role = actionObj.dataset.role;
          console.log(actionObj.dataset.id);
          $(mConfig.mForm).unbind('submit').bind('submit', function (event) {
            event.preventDefault();
            if (!mConfig.deleteConfirmElem.checked) {
              errorMessageAdd($(mConfig.deleteConfirmElem), 'Необходимо подтвердить удаление');
              return;
            }
            sendPostRequest('#' + mConfig.mFormId, mConfig.mForm.action, obj, function () {
              location.reload();
            }, null, 'DELETE');
          });
        },
        removeErrors: function (form) {
          var errChild = form.getElementsByClassName(errorClass),
            errSummary = form.getElementsByClassName(errorSummaryClass);
          while (errChild.length > 0) {
            form.removeChild(errChild[0]);
          };
          while (errSummary.length > 0) {
            form.removeChild(errSummary[0]);
          }
        }
    },
    init: function(){
        this.item.initButtons();
        this.item.initCreate();
    }
}
Roles.init();