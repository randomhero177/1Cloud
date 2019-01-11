/*
 * variables companyId,  calc, prevOrder are defined in Edit view
 */

var userEditState = {
  config: {
    userBlockId: '#unoc-user-info',
    userBtnSaveId: document.getElementById('unoc-user-lock-btn'),
    userSwitchBtn: '.unoc__users-change-state',
    passwordBlock: '#unoc-user-generate',
    userEditFormId: '#unoc-user-edit-info'
  },
  actions: {
    initStateSwitch: function (checkbox, option, cb) {
      checkbox.switchButton({
        width: 50,
        height: 25,
        button_width: 25,
        checked: (typeof option !== 'undefined') ? checkbox.data(option) : checkbox.data('checked'),
        on_label: resources.StateOn,
        off_label: resources.StateOff,
        labels_placement: "left",
        clear_after: null
      });
      if (typeof cb === 'function') {
        checkbox.switchButton('option', 'on_callback', cb);
        checkbox.switchButton('option', 'off_callback', cb);
      }
    },
    setUserConnectionStatus: function () {
      var item = $(this).parents('.unoc__users-state-input'),
        isPresented = item.data('state');

      if (this[0].classList.contains('checked')) {
        this[0].previousSibling.dataset.connected = true;
      } else {
        this[0].previousSibling.dataset.connected = false;
        if (isPresented !== 1) {
          item.remove();
        }
      }
    },
    getSettingsObj: function () {
      var postObj = {};
      postObj.userId = userId;
      return postObj;
    },
    getEditObj: function () {
      var config = userEditState.config;
      var postObj = {};
      postObj.FirstName = $(config.userEditFormId).find('#unoc-modal-userfirstname').val();
      postObj.Email = $(config.userEditFormId).find('#unoc-modal-useremail').val();
      return postObj;
    },
    sendChangeStateRequest: function () {
      sendAjaxRequest(userEditState.config.userBlockId, $(userEditState.config.userBlockId).data('action'), userEditState.actions.getSettingsObj(), function () {
        location.reload();
      }, userEditState.actions.showError, 'PUT');
    },
    confirmCb: function (e) {
      e.preventDefault();
      e.stopPropagation();

      let confirm = new ConfirmPopup({
        text: resources.ConfirmStateChange,
        cbProceed: function () {
          $('.switch-button-background').trigger('click');
        }
      });
    },
    showError: function () {

    }
  },
  init: function () {
    var config = userEditState.config;
    $('.unoc__users-state').each(function () {
      userEditState.actions.initStateSwitch($(this).find(config.userSwitchBtn), 'connected', userEditState.actions.sendChangeStateRequest);
    });

    $('.unoc__users-state-fake').click(function (e) {
      userEditState.actions.confirmCb(e);
    });

    $('.unoc__users-generate-new').click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      let confirm = new ConfirmPopup({
        text: resources.ConfirmPasswordChange,
        cbProceed: function () {
          sendAjaxRequest(userEditState.config.userBlockId, $(userEditState.config.passwordBlock).data('action'), userEditState.actions.getSettingsObj(), function () {
            location.reload();
          }, userEditState.actions.showError, 'PUT');
        }
      });
    });

    $(config.userEditFormId).submit(function (e) {
      e.preventDefault();
      sendAjaxRequest(userEditState.config.userEditFormId, $(userEditState.config.userEditFormId).attr('action'), userEditState.actions.getEditObj(), function () {
        location.reload();
      }, userEditState.actions.showError, 'PUT');
    })
  }
}
userEditState.init();