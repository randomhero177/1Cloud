'use strict';


var UnocCreate = {
    config: {
        formId: '#unoc-create-form',
        form: document.getElementById('unoc-create-form'),
        checkBox: document.querySelectorAll('.unoc__users-access-input'),
        disabled: '.unoc__disabled',
        userItemSelector: '.unoc__users-item',
        userItemAccessSelector: '.unoc__users-access-input'
    },
    model: {
        postObj: {
            FirstName: '',
            Email: '',
            UserCompanyIds: []
                
        },
        getPostObj: function () {
            this.postObj.UserCompanyIds = [];
            this.postObj.FirstName = document.getElementById('unoc-modal-userfirstname').value;
            this.postObj.Email = document.getElementById('unoc-modal-useremail').value;
            
            var compChosen = $('input.unoc__users-access-input:checked');
            for (var i = 0; i < compChosen.length; i++) {
                var companyId = $(compChosen[i]).data('id');
                $(compChosen[i]).attr('name', 'UserCompanyIds[' + i + ']');
                UnocCreate.model.postObj.UserCompanyIds.push(companyId);
            }
            return this.postObj;
        }
    },
    view : {
        moveDisabledDown: function () {
            var config = UnocCreate.config;
            var arr = $(config.disabled);
            var parent = $(config.disabled).parents('.unoc__table');
            if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    $(parent).append(arr[i]);
                    this.addTooltipToDisabled($(arr[i]).find('.unoc__table-name'))
                }
            }
        },
        addTooltipToDisabled: function (elem) {
            var tooltip = $('<span />', {
                'class': 'unoc__users-tooltip-txt',
                'text': tooltipTxt
            });
            $(elem).append(tooltip);
        },
        makeSwitchBtn: function () {
            var config = UnocCreate.config;
            $(config.userItemSelector).each(function () {
                UnocCreate.view.initItemSwitch($(this).find(config.userItemAccessSelector), 'connected');
            });
        },
        initItemSwitch: function (checkbox, option, cb) {
            checkbox.switchButton({
                width: 50,
                height: 25,
                button_width: 25,
                checked: (typeof option !== 'undefined') ? checkbox.data(option) : checkbox.data('checked'),
                on_label: resources.TurnOn,
                off_label: resources.TurnOff,
                labels_placement: "right",
                clear_after: null
            });

            if (typeof cb === 'function') {
                checkbox.switchButton('option', 'on_callback', cb);
                checkbox.switchButton('option', 'off_callback', cb);
            }
        }
    },
    controller: {
        init: function(){
            UnocCreate.config.form.addEventListener('submit', function (e) {
                e.preventDefault();
                UnocCreate.controller.submit();
            })
        },
        submit: function () {
            sendAjaxRequest(UnocCreate.config.formId, $(UnocCreate.config.formId).attr('action'), UnocCreate.model.getPostObj(), function () {
                location.reload();
            }, UnocCreate.controller.onFail, 'POST');
        },
        onFail: function (data) {
            var compChosen = $('input.unoc__users-access-input:checked');
            for (var i = 0; i < compChosen.length; i++) {
                $(compChosen[i]).attr('name', 'UserCompanyIds[]');
            }
        },
    },
    init: function () {
        UnocCreate.controller.init();
        UnocCreate.view.moveDisabledDown();
        UnocCreate.view.makeSwitchBtn();
    }
}


UnocCreate.init();
