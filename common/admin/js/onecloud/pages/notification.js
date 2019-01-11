'use strict';

var Notification = {
  config: {
    filterId: 'notification-filter',
    resetBtnId: 'reset-filter-btn',
    filterInit: {},
    resendModalId: 'resend-notification-modal',
    resendFormId: 'resend-notification-form',
    resendBtn: '.list-actions__resend',
    confirmElemId: 'send-confirm'
  },
  filter: {
    init: function () {
      var c = Notification.config,
        form = document.getElementById(c.filterId),
        resetBtn = document.getElementById(c.resetBtnId);

      resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        Notification.filter.resetForm();
        form.querySelector('[type="submit"]').click();
      });
    },
    resetForm: function () {
      var c = Notification.config,
        form = document.getElementById(c.filterId),
        elements = form.elements,
        init = c.filterInit;

      [].forEach.call(elements, function (el) {
        if (el.name === 'Level' || el.name === 'StateTask' || el.name === 'PartnerId' || el.name === 'Filter.PartnerId') {
          el.value = init[el.name];
          return;
        }
        if (el.name === 'IsHideDeleted') {
          el.checked = true;
          return;
        }
        switch (el.nodeName.toLowerCase) {
          case 'select':
            el.firstChild.selected = true;
            break;
          default:
            el.value = '';
        }
      });
    }
  },
  item: {
    resend: function (channel, id) {
      var c = Notification.config,
        form = document.getElementById(c.resendFormId);
      form.dataset.channel = channel;
      form.dataset.id = id;

      errorMessageRemove($('#' + c.confirmElemId));
      $('#' + c.resendModalId).modal('show');
    },
    submitForm: function () {
      var c = Notification.config,
        form = document.getElementById(c.resendFormId),
        filterForm = document.getElementById(c.filterId);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var curId = form.dataset.id,
          curChannel = form.dataset.channel,
          confirmElem = document.getElementById(c.confirmElemId);

        if (!confirmElem.checked) {
          errorMessageAdd($('#' + c.confirmElemId), textRequiredConfirm);
          return;
        }

        sendPostRequest('#' + c.resendFormId, form.action, {
          NotificationId: curId,
          Channel: curChannel
        }, function () {
          $('#' + c.resendModalId).modal('hide');
          $('#' + c.confirmElemId).prop('checked', false);

          filterForm.querySelector('[type="submit"]').click();
        });
      })
    }
  },
  init: function () {
    Notification.filter.init();
    $(Notification.config.resendBtn).click(function (e) {
      e.preventDefault();
      var curId = $(this).data('id'),
        curChannel = $(this).data('channel');
      Notification.item.resend(curChannel, curId);
    });
    Notification.item.submitForm();
  }
}
Notification.init();