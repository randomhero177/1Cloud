'use strict';

var Tickets = {
  config: {
    filterFormId: 'tickets-filter',
    ticketsContainerId: 'tickets',
    ticketsListId: 'tickets-table',
    ticketsListUrl: 'list'
  },

  filter: {
    obj: {},
    config: {},
    submit: function () {
      Tickets.item.curTicket = {};
      Tickets.item.ticketBlock.classList.remove('tickets__info--active');
      Tickets.list.load();
    },
    init: function () {
      Tickets.filter.obj = new Filter(Tickets.config.filterFormId, Tickets.filter.submit);
      Tickets.filter.obj.init();

      var config = Tickets.filter.config;
      config.form = document.getElementById(Tickets.config.filterFormId);
      config.canFilterByPartner = config.form.dataset.partnerFilter.toLowerCase();
      config.level = config.form.dataset.level;
    }
  },
  list: {
    interval: false,
    /*
     * Loads tickets list due to filter values
     */
    load: function () {
      let list = Tickets.list;
      let item = Tickets.item;

      if (list.interval) {
        clearInterval(list.interval);
        list.interval = false;
      }

      if (item.interval) {
        clearInterval(item.interval);
        item.interval = false;
      }

      $.get(window.util.makeCorrectUrl(Tickets.config.ticketsListUrl), Tickets.filter.obj.getFilterObj(), function (data) {
        list.drawTicketsList(data);
        if (data.length > 1) {
          list.interval = setInterval(list.load, 60000);
        }
        if (item.ticketBlock.classList.contains('tickets__info--active')) {
          item.setCheckHolderInterval(item);
        }
      }).fail(function (data) {
        handleAjaxErrors(data);
        throw 'Error getting tickets';
      });
    },
    /*
     * Draw tickets table due to server's response
     * @obj data - object from server with tickets object list
     */
    drawTicketsList: function (data) {
      var container = document.getElementById(Tickets.config.ticketsContainerId),
        table = document.getElementById(Tickets.config.ticketsListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.tickets__row-list');

      container.parentNode.classList.add('loading', 'loading--full');
      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          if (data.length === 1) {
            Tickets.item.curTicket.TicketId = data[0].Id;
            Tickets.item.load(data[0].Id);
          }

          for (var i = 0; i < data.length; i++) {
            list.appendChild(Tickets.list.drawSingleTicket(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');
        } else {
          table.classList.add('hidden');
          noResults.classList.remove('hidden');
        }

        container.parentNode.classList.remove('loading', 'loading--full');
      }, 1000);
    },
    /*
     * Returns DOM object of a single ticket item
     * @number index - index of a single ticket object in a tickets list
     * @obj ticket - object of a single ticket data
     */
    drawSingleTicket: function (index, ticket) {
      var tpl = document.getElementById('ticket-row-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true),
        elemStatus = elem.querySelector('.status-label');
      //partnerElem = elem.querySelector('.tickets__row-partner')

      elem.dataset.id = ticket.Id;

      // TEMPORARILY REMOVE ICON OF A PARTNER IMG TD FROM ALL ROWS (to show partner's image we will need to uncomment  partnerElem and the following)

      /*if (Tickets.filter.config.canFilterByPartner === 'false') {
          elem.removeChild(partnerElem);
      } else {
          partnerElem.querySelector('img').setAttribute('src', '/Tpl/assets/img/avatars/1.jpg');
      }*/

      elemStatus.classList.add('status', 'status--' + ((ticket.SlaWarning === true) ? 'SlaWarning' : ticket.State));
      elemStatus.setAttribute('title', (ticket.SlaWarning === true) ? 'SLA Warning' : ticket.StateTitle);
      window.util.fillDetalization('', ticket, elem);



      var dateCreate = new Date(ticket.DateCreate);
      elem.querySelector('.tickets__row-date').textContent = window.util.getTwoDigitsDate(dateCreate.getDate()) + '.' + window.util.getTwoDigitsDate(dateCreate.getMonth() + 1) + '.' + dateCreate.getFullYear() + ' ' + (dateCreate.getHours() < 10 ? '0' : '') + dateCreate.getHours() + ':' + (dateCreate.getMinutes() < 10 ? '0' : '') + dateCreate.getMinutes() + ':' + (dateCreate.getSeconds() < 10 ? '0' : '') + dateCreate.getSeconds();

      elem.addEventListener('click', function () {
        if (ticket.Id !== Tickets.item.curTicket.TicketId) {
          var rows = document.querySelectorAll('.tickets__row');
          for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('active');
          }
          this.classList.add('active');
          Tickets.item.load(ticket.Id);
        }
      });

      if (ticket.Id === Tickets.item.curTicket.TicketId) {
        elem.classList.add('active');
      }

      return elem;
    }
  },
  item: {
    config: {
      fields: {
        id: document.getElementById('ticket-id'),
        title: document.getElementById('ticket-title'),
        partner: document.getElementById('ticket-partner'),
        email: document.getElementById('ticket-client-email'),
        requests: document.getElementById('ticket-client-requests'),
        phone: document.getElementById('ticket-client-phone'),
        phoneParent: document.getElementById('ticket-client-phone').parentNode,
        date: document.getElementById('ticket-date'),
        description: document.getElementById('ticket-description'),
        messages: document.getElementById('ticket-messages'),
        clientLink: document.getElementById('ticket-client-email'),
        userBlockedEmailElems: document.querySelectorAll('.ticket-blocked-by-user'),
        userBlockedTimeElems: document.querySelectorAll('.ticket-blocked-time'),
        ticketClientCount: document.getElementById('ticket-client-count')
      },
      controls: {
        hold: {
          elem: document.getElementById('ticket-hold-btn'),
          text: 'Я отвечу',
          textActive: 'Снять блок',
          classDefault: 'btn-warning',
          url: '/hold',
          urlUnhold: '/unhold',
          handleFunc: function () {
            var hold = Tickets.item.config.controls.hold,
              actionUrl = Tickets.item.curTicket.TicketId;

            actionUrl += (hold.elem.classList.contains(hold.classDefault)) ? Tickets.item.config.controls.hold.url : Tickets.item.config.controls.hold.urlUnhold;
            if (Tickets.item.curTicket.TicketId) {
              $.post(window.util.makeCorrectUrl(actionUrl), function (data) {
                Tickets.item.handleBlockedInfo(data);
              }).fail(function () {
                console.log('Error holding/unholding ticket');
              });
            }
          }
        }
      },
      actions: {
        toLevel: {
          elem: document.getElementById('ticket-to-level'),
          modal: {
            title: 'Передать обращение на другой уровень',
            introtext: '(не меняет статус обращения. Будет добавлен скрытый от клиента комментарий и обращение будет передано на выбраный уровень поддержки)',
            hiddenComment: false,
            showLevel: true,
            btnText: 'Передать'
          }
        },
        request: {
          elem: document.getElementById('modal-request-btn'),
          replyType: 1,
          modal: {
            title: 'Запросить информацию у клиента',
            introtext: '',
            hiddenComment: false,
            showLevel: false,
            btnText: 'Запросить'
          }
        },
        solve: {
          elem: document.getElementById('modal-solve-btn'),
          replyType: 2,
          modal: {
            title: 'Предоставить решение по запросу клиента',
            introtext: '',
            hiddenComment: false,
            showLevel: false,
            btnText: 'Решить'
          }
        },
        comment: {
          elem: document.getElementById('modal-comment-btn'),
          replyType: 3,
          modal: {
            title: 'Добавить комментарий',
            introtext: '(не меняет статус обращения)',
            hiddenComment: true,
            showLevel: false,
            btnText: 'Комментировать'
          }
        },
        close: {
          elem: document.getElementById('modal-close-btn'),
          replyType: 4,
          modal: {
            title: 'Закрыть обращение',
            introtext: '(Заказчику отправится нотификация о закрытии)',
            hiddenComment: false,
            showLevel: false,
            btnText: 'Закрыть'
          }
        }
      }
    },
    interval: false,
    curTicket: {},
    ticketBlock: document.getElementById('ticket-info'),
    summaryControl: document.getElementById('ticket-summary-collapse-btn'),
    filterControl: document.getElementById('collapse-filter-btn'),
    summaryBlock: document.getElementById('ticket-summary'),
    descriptionBlock: document.getElementById('ticket-description'),
    holdedAlertElems: document.querySelectorAll('.tickets__header-alert'),
    actionsBlock: document.getElementById('ticket-actions'),
    actionsBlockModal: document.getElementById('modal-actions'),
    /*
     * Inits all ticket buttons behaviour
     */
    initButtons: function () {
      var config = Tickets.item.config,
        controls = config.controls,
        actions = config.actions;

      controls.hold.elem.addEventListener('click', controls.hold.handleFunc);

      for (var item in actions) {
        actions[item].elem.dataset.action = item;
        actions[item].elem.addEventListener('click', function () {
          var action = this.dataset.action;
          if (Tickets.modal.curAction !== action) {
            Tickets.modal.clear();
            Tickets.modal.fill(Tickets.item.config.actions[action]);
            Tickets.modal.curAction = action;
          }
          $(Tickets.modal.config.mBlock).modal('show');
        });
      }

      config.fields.requests.addEventListener('click', function () {
        document.getElementById(Tickets.config.filterFormId).elements["CustomerEmail"].value = config.fields.email.textContent;
        Tickets.item.ticketBlock.classList.remove('.tickets__info--active');
        Tickets.list.load();
      });

      if (Tickets.filter.config.canFilterByPartner !== 'false') {
        config.fields.partner.addEventListener('click', function () {
          Tickets.filter.obj.setSelectValueFromOptionText('PartnerId', config.fields.partner.textContent);
          Tickets.item.ticketBlock.classList.remove('tickets__info--active');
          Tickets.list.load();
        });
      }
    },
    /*
     * Loads selected ticket info
     * @number id - id of a ticket
     */
    load: function (id) {
      $.get(window.util.makeCorrectUrl(id), function (data) {
        var item = Tickets.item;
        item.curTicket = data;
        item.actionsBlock.classList.remove('tickets__actions--active');
        item.fillTicketInfo(data);

        if (item.interval) {
          clearInterval(item.interval);
        }

        item.setCheckHolderInterval(item);

      }).fail(function (data) {
        throw 'Error loading ticket';
      });
    },
    /*
     * Sets interval for checking current opened ticket's holder
     * @obj item - current Ticket.item object
     */
    setCheckHolderInterval: function (item) {
      if (typeof item.curTicket.TicketId === 'undefined') {
        return;
      }
      item.interval = setInterval(function () {
        $.get(window.util.makeCorrectUrl(item.curTicket.TicketId + '/holder'), function (data) {
          item.handleBlockedInfo(data);
        }).fail(function (data) {
          clearInterval(item.interval);
          handleAjaxErrors(data);
          throw 'Error getting holder';
        });
      }, 10000);
    },
    /*
     * Fills ticket edit area with correct information
     * @obj ticketInfo - server response with ticket information
     */
    fillTicketInfo: function (ticketInfo) {
      var ticketBlock = Tickets.item.ticketBlock,
        ticketCreated = new Date(ticketInfo.DateCreate),
        ticketFields = Tickets.item.config.fields,
        ticketActions = Tickets.item.config.actions;

      ticketBlock.classList.remove('tickets__info--active');
      setTimeout(function () {
        // FILL TEXT INFO
        ticketFields.id.textContent = ticketInfo.TicketId;
        ticketFields.title.textContent = ticketInfo.Subject;

        window.util.fillDetalization('ticket-summary', ticketInfo.Creator);
        window.util.fillDetalizationLinks('ticket-summary', ticketInfo.Links);

        ticketFields.date.textContent = window.util.formatDate(ticketCreated);
        ticketFields.description.textContent = window.util.decodeEntitiesToSymbols(ticketInfo.Question);

        if (ticketInfo.Attachments.length > 0) {
          ticketFields.description.innerHTML += '<br>';
          for (var i = 0; i < ticketInfo.Attachments.length; i++) {
            ticketFields.description.appendChild(Tickets.item.getCommentAttachment(ticketInfo.TicketId, ticketInfo.Attachments[i]));
          }
        }

        fillCommentsArea(ticketInfo.Comments, ticketFields.messages);
        
        // SHOW TICKET CONTENT
        Tickets.item.showDescription();
        Tickets.item.handleBlockedInfo(Tickets.item.curTicket.Holder);
        ticketBlock.classList.add('tickets__info--active');
      }, 100);

      function fillCommentsArea(arrComments, block) {
        var commentsLength = arrComments.length;

        if (commentsLength > 0) {
          while (block.firstChild) {
            block.removeChild(block.firstChild);
          }
          for (let i = 0; i < commentsLength; i++) {
            block.appendChild(Tickets.item.getTicketComment(ticketInfo.Comments[i]))
          }
          if (document.querySelectorAll('.fancy').length > 0) {
            $('.fancy').fancybox({
              'type': 'image',
              'loop': false
            });
          }
        } else {
          block.innerHTML = '';
        };
      }
    },
    /*
     * Returns an element of ticket's comment
     * @obj comment - an object of concrete comment
     */
    getTicketComment: function (comment) {
      var tpl = document.getElementById('ticket-comment-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('.tickets__message').cloneNode(true),
        dateCreate = new Date(comment.DateCreate),
        hiddenBadge = elem.querySelector('.badge');

      if (comment.Creator.IsSupportTeam) {
        elem.classList.remove('tickets__message--client');
      }
      elem.querySelector('.tickets__message-email').textContent = comment.Creator.CustomerLogin;
      elem.querySelector('.tickets__message-date').textContent = window.util.formatDate(dateCreate);
      elem.querySelector('.tickets__message-text').textContent = window.util.decodeEntitiesToSymbols(comment.Text);

      if (!comment.IsHidden) {
        hiddenBadge.parentNode.removeChild(hiddenBadge);
      }

      if (comment.Attachments.length > 0) {
        for (var i = 0; i < comment.Attachments.length; i++) {
          elem.querySelector('.tickets__attachments').appendChild(this.getCommentAttachment(comment.CommentId, comment.Attachments[i]));
        }
      }

      return elem;
    },
    /*
     * Returns DOM object for a link to the concrete comment's attachment
     * @number id - id of a comment
     * @obj attach - object of the attachment
     */
    getCommentAttachment: function (id, attach) {
      var link = document.createElement('a');
      var icon = document.createElement('i');

      link.setAttribute('href', attach.Link);
      link.setAttribute('class', 'tickets__attachments-item badge badge-info');
      icon.setAttribute('class', 'fa');

      if (attach.Type.indexOf('image') === -1) {
        link.setAttribute('target', '_blank');
        icon.classList.add('fa-file-o');
      } else {
        link.dataset.fancyboxGroup = id;
        link.setAttribute('title', attach.Name);
        link.classList.add('fancy');
        icon.classList.add('fa-picture-o');
      }

      link.appendChild(icon);
      link.innerHTML += attach.Name;

      return link;
    },
    /*
     * Shows ticket description block's visibility
     */
    showDescription: function () {
      Tickets.item.descriptionBlock.classList.remove('hidden');
      Tickets.item.summaryBlock.classList.remove('hidden');
      Tickets.item.summaryControl.classList.remove('tickets__summary-collapse-btn--collapsed');
    },
    /*
     * Toggles ticket description block's visibility
     */
    toggleDescription: function () {
      Tickets.item.descriptionBlock.classList.toggle('hidden');
      Tickets.item.summaryBlock.classList.toggle('hidden');
      Tickets.item.summaryControl.classList.toggle('tickets__summary-collapse-btn--collapsed');
    },
    /*
     * Handles the behaviour of holding tickets
     * @obj holder - Holder part of the concrete ticket object
     */
    handleBlockedInfo: function (holder) {
      var hUsernameElems = Tickets.item.config.fields.userBlockedEmailElems,
        hTimeElems = Tickets.item.config.fields.userBlockedTimeElems,
        hConfig = Tickets.item.config.controls.hold,
        hDivs = Tickets.item.holdedAlertElems,
        tActBlock = Tickets.item.actionsBlock,
        tActBlockModal = Tickets.item.actionsBlockModal;

      for (var i = 0; i < hDivs.length; i++) {
        if (holder.HolderEmail && holder.HoldStartDate) {
          let hDate = new Date(holder.HoldStartDate);
          hUsernameElems[i].textContent = holder.HolderEmail;
          hTimeElems[i].textContent = hDate.toLocaleDateString() + ' ' + hDate.toLocaleTimeString();
          hDivs[i].classList.remove('hidden');
        } else {
          hDivs[i].classList.add('hidden');
        }
      }

      if (holder.HoldedByMe) {
        hConfig.elem.textContent = hConfig.textActive;
        hConfig.elem.classList.remove(hConfig.classDefault);
        tActBlock.classList.add('tickets__actions--active');

        tActBlockModal.classList.remove('hidden');
        document.getElementById('modal-no-actions').classList.add('hidden');
      } else {
        hConfig.elem.textContent = hConfig.text;
        hConfig.elem.classList.add(hConfig.classDefault);
        tActBlock.classList.remove('tickets__actions--active');

        tActBlockModal.classList.add('hidden');
        document.getElementById('modal-no-actions').classList.remove('hidden');
      }
    },
    /*
     * Fires, when comment successfuly added to ticket
     */
    changedSuccess: function () {
      $(Tickets.modal.config.mBlock).modal('hide');
      Tickets.list.load();
      if (Tickets.modal.curAction == 'comment') {
        Tickets.item.load(Tickets.item.curTicket.TicketId);
      } else {
        Tickets.item.curTicket = {};
        Tickets.item.ticketBlock.classList.remove('tickets__info--active');
      }

      Tickets.modal.clear();
    }
  },
  modal: {
    curAction: '',
    config: {
      url: '/add-comment',
      mFormId: 'ticket-comment-form',
      mForm: document.getElementById('ticket-comment-form'),
      mBlock: document.getElementById('modal-comment'),
      mTitle: document.getElementById('comment-title'),
      mIntro: document.getElementById('comment-intro'),
      mHidden: document.getElementById('comment-hidden'),
      mToLevel: document.getElementById('comment-level'),
      mText: document.getElementById('comment-text'),
      mDropzone: false,
      mSendBtn: document.getElementById('comment-send')
    },
    /*
     * Fills modal window with the information, corresponding to the cliked button
     * @number ticketId - id of a ticket, to which modal is called for
     * @obj action - object of the chosen action
     */
    fill: function (action) {
      var mConfig = Tickets.modal.config;
      var replyTypeElem = mConfig.mToLevel.querySelector('[data-level="' + Tickets.item.curTicket.SupportLevelId + '"]');

      mConfig.mTitle.textContent = action.modal.title;

      mConfig.mIntro.textContent = action.modal.introtext;
      window.util.setElementVisibility(mConfig.mIntro, action.modal.introtext !== '');

      mConfig.mHidden.querySelector('[name="IsHidden"]').removeAttribute('checked');
      window.util.setElementVisibility(mConfig.mHidden, action.modal.hiddenComment);

      window.util.setElementVisibility(mConfig.mToLevel, action.modal.showLevel);
      replyTypeElem.classList.add('hidden');
      replyTypeElem.querySelector('[name="ReplyType"]').checked = true;

      mConfig.mSendBtn.textContent = action.modal.btnText;
      mConfig.mForm.action = window.util.makeCorrectUrl(Tickets.item.curTicket.TicketId + mConfig.url);
    },
    clear: function () {
      var mConfig = Tickets.modal.config;

      mConfig.mTitle.textContent = '';
      mConfig.mIntro.classList.add('hidden');
      mConfig.mIntro.textContent = '';
      mConfig.mText.querySelector('[name="CommentText"]').value = '';
      mConfig.mHidden.classList.add('hidden');
      mConfig.mHidden.querySelector('[name="IsHidden"]').checked = false;
      mConfig.mSendBtn.textContent = '';
      mConfig.mForm.action = '';

      [].forEach.call(mConfig.mToLevel.querySelector('[name="ReplyType"]'), function (el) {
        el.parentNode.classList.remove('hidden');
      });

      Tickets.modal.curAction = '';

      $('.' + errorClass).remove();
      $('.state-error').removeClass('state-error');

      if (typeof mConfig.mDropzone !== 'boolean') {
        mConfig.mDropzone.removeAllFiles(true);
      }
    },
    submit: function () {
      var mConfig = Tickets.modal.config,
        action = Tickets.modal.curAction,
        id = Tickets.item.curTicket.TicketId,
        replyType = (Tickets.item.config.actions[action].modal.showLevel) ? mConfig.mToLevel.querySelector('[name="ReplyType"]:checked').value : Tickets.item.config.actions[action].replyType,
        msg = mConfig.mText.querySelector('[name="CommentText"]').value,
        form = mConfig.mForm,
        formData = new FormData();

      if (form.querySelectorAll('.' + errorClass).length > 0) return;

      if (window.util.checkIfHtml(msg)) {
        errorMessageAdd($('[name = "CommentText"]'), 'HTML-теги не допускаются');
        return;
      }

      formData.append('ticketId', id);
      formData.append('IsHidden', mConfig.mHidden.querySelector('[name="IsHidden"]').checked);
      formData.append('CommentText', msg);
      formData.append('ReplyType', replyType);

      if (typeof mConfig.mDropzone !== 'boolean' && mConfig.mDropzone.files.length > 0) {
        for (var i = 0; i < mConfig.mDropzone.files.length; i++) {
          formData.append('Attachments', mConfig.mDropzone.files[i]);
        }
      }

      $.ajax({
        type: 'POST',
        url: form.action,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
          Tickets.item.changedSuccess();
        },
        error: function (data) {
          console.log('error commenting');
          handleAjaxErrors(data, '#' + Tickets.modal.config.mFormId);
        },
        fail: function (data) {
          console.log('fail commenting');
        }
      });
    },
    initForm: function () {
      var mConfig = Tickets.modal.config;

      Dropzone.options.commentDropzone = {
        url: '#', // default. Real url will be assigned when submitting form
        autoProcessQueue: false,
        uploadMultiple: true,
        parallelUploads: 100,
        maxFiles: 100,
        init: function () {
          var myDropzone = this;
          Tickets.modal.config.mDropzone = this;

          this.on("addedfile", function (file) {
            file.previewElement.classList.add('dz-success', 'dz-complete');
          });
          this.on('removedfile', function () {
            $('[name="Attachments"]').trigger('change');
          });

          mConfig.mSendBtn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            Tickets.modal.submit();
          });
        },
        fallback: function () {
          document.getElementById('comment-file').classList.remove('hidden');
        }
      }
    }
  },
  init: function () {
    window.util.makeCorrectUrl('');
    this.filter.init();
    this.list.load();
    this.item.initButtons();
    this.modal.initForm();
    this.item.summaryControl.addEventListener('click', this.item.toggleDescription);
    hackForActiveSidebarMenu();

    function hackForActiveSidebarMenu() {
      var arrLinks = document.querySelectorAll('.sidebar-menu .tickets-menu .sub-nav > li a');
      for (var i = 0; i < arrLinks.length; i++) {
        if (window.location.href.indexOf(arrLinks[i].getAttribute('href')) !== -1) {
          arrLinks[i].parentNode.classList.add('active');
          return;
        }
      }
    }
  }
};

Tickets.init();