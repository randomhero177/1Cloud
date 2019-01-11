'use strict';

var SslPrice = {
  modal: {
    config: {
      editBtn: '.ssl-fancy-edit',
      editFormId: 'edit-form',
      editPriceInputId: 'edit-price-amount',
      editCurrencyId: 'edit-price-currency',
      editModelObj: {}
    },
    drawSingleEdit: function () {
      var c = SslPrice.modal.config;
      $(c.editBtn).click(function (e) {
        e.preventDefault();
        var item = $(this);

        c.editModelObj.PartnerId = item.data('partner');
        c.editModelObj.PriceId = item.data('price-id');

        $('#' + c.editPriceInputId).val(item.data('partner-price'));
        $('#' + c.editCurrencyId).text(item.data('partner-currency'));

        $('#preview-title').text(item.data('name'));
        $('#partner-name').text(item.data('partnername'));
        $('#' + c.editFormId).find('.error__message').remove();
      })
    },
    sendEditForm: function () {
      var c = SslPrice.modal.config,
        form = document.getElementById(c.editFormId),
        priceInput = document.getElementById(c.editPriceInputId),
        obj = c.editModelObj;

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        obj.PartnerPriceAmount = parseFloat(priceInput.value);
        sendPostRequest('#' + c.editFormId, form.action, obj, function (data) {
          location.reload();
        }, function (data) {
          handleAjaxErrors(data);
        });
      })
    }
  },
  init: function () {
    $('[data-fancybox]').fancybox({});
    this.modal.drawSingleEdit();
    this.modal.sendEditForm();
  }
}
SslPrice.init();