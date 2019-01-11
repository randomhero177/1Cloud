'use strict';

var NotificationTypes = {
  config: {
    filterId: 'notification-types-filter',
    resetBtnId: 'reset-filter-btn',
    filterInit: {},
    previewBtn: '.list-actions__item',
    previewBlockId: 'preview-notification-block'
  },
  filter: {
    init: function () {
      var c = NotificationTypes.config,
        form = document.getElementById(c.filterId),
        resetBtn = document.getElementById(c.resetBtnId);
      resetBtn.addEventListener('click', function (e) {
        e.preventDefault();
        NotificationTypes.filter.resetForm();
        form.querySelector('[type="submit"]').click();
      });
    },
    resetForm: function () {
      var c = NotificationTypes.config,
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
  init: function () {
    NotificationTypes.filter.init();
    $(NotificationTypes.config.previewBtn).click(function (e) {
      e.preventDefault();
      var url = $(this).data('href');
      window.util.fillPreview(NotificationTypes.config.previewBlockId, url);
    });
  }
}
NotificationTypes.init();