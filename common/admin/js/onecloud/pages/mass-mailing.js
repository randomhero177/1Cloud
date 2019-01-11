(function initMassMailing() {
  var Mailing = {
    section: $('#mailing'),
    filter: {
      curObj: {},
      form: $('#mailing-filter'),
      submit: function (e) {
        if (e) {
          e.preventDefault();
        }
        
        var f = Mailing.filter;
        var c = Mailing.content;

        Mailing.section.addClass('loading loading--full');
        Mailing.add.hide();
        sendPostRequest('#' + Mailing.section.attr('id'), f.form.attr('action'), f.getFilterObj(), c.showResult);
      },
      getFilterObj: function () {
        var f = Mailing.filter;
        var result = {};

        f.form.find('select').each(function () {
          var select = $(this),
            name = select.attr('name'),
            value = select.val();

          if (value) {
            result[name] = value;
          } else if (name === 'SelectedPartnerIds') {
            result[name] = -1;
          }
        });

        return result;
      },
      initSelects: function () {
        var f = Mailing.filter;

        f.form.find('.select-multiple').each(function () {
          var select = $(this),
            nonSelected = select.data('placeholder'),
            allSelected = select.data('placeholder-all'),
            someSelected = select.data('placeholder-selected'),
            optionsCount = select.find('option').length;

          select.multiselect({
            numberDisplayed: 0,
            includeSelectAllOption: true,
            selectAllText: 'Выбрать все',
            allSelectedText: allSelected,
            nonSelectedText: nonSelected,
            buttonText: function (options) {
              if (options.length === 0) {
                return nonSelected;
              } else if (options.length === optionsCount) {
                return allSelected;
              }
              return someSelected + options.length;
            }
          });
        });
      },
      init: function () {
        var f = Mailing.filter;

        f.initSelects();
        f.submit();
      }
    },
    content: {
      clientsBlock: $('#clients-count-block'),
      clientsCount: $('#clients-count-span'),
      clientsEmpty: $('#clients-count-empty'),
      showResult: function (data) {
        var c = Mailing.content;
        var a = Mailing.add;
        var isResults = data > 0;

        c.clientsBlock[(isResults) ? 'removeClass' : 'addClass']('hidden');
        c.clientsEmpty[(isResults) ? 'addClass' : 'removeClass']('hidden');
        a.addBlockShowBtn[(isResults) ? 'removeClass' : 'addClass']('hidden');

        if (isResults) {
          c.clientsCount.text(data);
        }

        Mailing.section.removeClass('loading loading--full');
      }
    },
    add: {
      addBlock: $('#create-mailing-block'),
      addBlockShowBtn: $('#create-mailing-btn'),
      addSendBtn: $('#mailing-send-btn'),
      addSubject: $('#MailSubject'),
      addBody: $('#Description'),
      show: function (e) {
        e.preventDefault();
        Mailing.add.addBlock.removeClass('hidden');
      },
      hide: function (e) {
        var a = Mailing.add;
        var block = a.addBlock;
        block.addClass('hidden');
        block.find('[name="MailSubject"]').val('');
        block.find('[name="MailBody"]').val('');
        CKEDITOR.instances.Description.setData('');

        block.find('.' + errorClass).each(function () {
          $(this).remove();
        });
      },
      submit: function (e) {
        e.preventDefault();
        var f = Mailing.filter;
        var a = Mailing.add;
        var block = a.addBlock;
        var obj = f.getFilterObj();
        var subj = block.find('[name="MailSubject"]');
        var body = block.find('[name="MailBody"]');
        var bodyVal = CKEDITOR.instances.Description.getData();
        var isError = false;

        block.find('.' + errorClass).each(function () {
          $(this).remove();
        });

        if (subj.val() === '') {
          errorMessageAdd(subj, textRequired);
          isError = isError || true;
        }

        if (bodyVal === '') {
          errorMessageAdd(body, textRequired);
          isError = isError || true;
        }

        if (isError) {
          return;
        }

        obj.MailSubject = subj.val();
        obj.MailBody = bodyVal;

        sendPostRequest('#' + Mailing.section.attr('id'), block.data('action'), obj, a.showSuccessEmailing, a.showErrorEmailing);
      },
      showSuccessEmailing: function () {
        var f = Mailing.filter;

        var notice = new PanelNotice('Сообщения успешно разосланы', 'success');
        
        f.form[0].reset();
        f.form.find('.select-multiple').multiselect('refresh');
        f.submit();
      },
      showErrorEmailing: function () {
        var notice = new PanelNotice('Произошла ошибка при отправке сообщений', 'danger');
      }
    },
    init: function () {
      var f = Mailing.filter;
      var a = Mailing.add;

      f.init();

      f.form.on('submit', f.submit);

      a.addBlockShowBtn.on('click', a.show);
      a.addSendBtn.on('click', a.submit);
    }
  };

  Mailing.init();
})();
