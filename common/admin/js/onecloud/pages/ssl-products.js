'use strict';

var SslProd = {
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
    remove: function () {
      SslProd.config.deleteEl.addEventListener('click', function () {

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
      editBlockId: 'edit-ssl-block',
      editDetailBlockId: 'edit-ssl-detail',
      editBtn: '.news-fancy-edit',
      editFormId: 'edit-form',
      editModelObj: {
        Id: '#hiddenId',
        IsEv: '#isEv',
        IsPublic: '#isPublic',
        TrustLevel: '#TrustLevel',
        Description: '#edit-description'
      }
    },
    drawSinglePreview: function () {
      $(SslProd.modal.config.previewBtn).click(function (e) {
        e.preventDefault();
        var url = $(this).data('href');
        window.util.fillPreview(SslProd.modal.config.previewBlockId, url, SslProd.modal.fillPreviewCB);
      })
    },
    drawSingleEdit: function () {
      $(SslProd.modal.config.editBtn).click(function (e) {
        e.preventDefault();
        var url = $(this).data('href');
        window.util.fillPreview(SslProd.modal.config.editDetailBlockId, url, SslProd.modal.fillEditCB);
      })
    },
    fillEditCB: function (data) {
      var c = SslProd.modal.config,
        block = document.getElementById(c.editBlockId);

      var elems = document.querySelectorAll('[data-checkbox]');
      [].forEach.call(elems, function (el) {
        el.checked = data[el.dataset.previewname];
      });
      $(c.editModelObj.Id).val(data.Id);
      $(c.editModelObj.TrustLevel).val(data.TrustLevel);
      $(c.editModelObj.Description).parent().removeClass('hidden'); // hotfix for description visibility (util method setVisibility for null values)
      SslProd.modal.sendEditForm();
    },
    fillPreviewCB: function (data) {
      var checkboxEl = document.querySelectorAll('[data-checkbox]');
      [].forEach.call(checkboxEl, function (el) {
        el.checked = data[el.dataset.previewname];
      });
    },
    sendEditForm: function () {
      var c = SslProd.modal.config,
        form = document.getElementById(c.editFormId);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var obj = {};
        obj.Id = form.querySelector(c.editModelObj.Id).value;
        obj.IsEv = form.querySelector(c.editModelObj.IsEv).checked;
        obj.IsPublic = form.querySelector(c.editModelObj.IsPublic).checked;
        obj.TrustLevel = form.querySelector(c.editModelObj.TrustLevel).value;
        obj.Description = form.querySelector(c.editModelObj.Description).value;
        sendPostRequest('#' + c.editFormId, form.action, obj, function (data) {
          console.log(data);
        }, function (data) {
          handleAjaxErrors(data);
        }, 'POST');
      })
    }
  },
  init: function () {
    $('[data-fancybox]').fancybox({});
    this.modal.drawSinglePreview();
    this.modal.drawSingleEdit();
  }
}
SslProd.init();