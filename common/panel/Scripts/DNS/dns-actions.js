var recordStorage = localStorage,
  taskList = [],
  ttlBaseSelect = $('#ttl-base-select'),
  protoBaseSelect = $('#proto-base-select');

var activeFormId = '';

$(function () {
  var recordsContainerSelector = '#domain-records';

  /*================ IF RECORD STATE IS NOT ACTIVE - INITIATE CHECKING STATUS =================*/
  $('#domain-records .progress').each(function () {
    var taskId = $(this).attr('id').replace('pending-', ''),
      recordId = $(this).closest('.dns__record').attr('data-record-id');

    taskList[taskId] = window.setInterval(function () {
      checkDNSRecordState(taskId, recordId);
    }, 1000);
  });

  /*================ GET DOMAIN NAME AND ID AND PUT IT IN CORRECT PLACES =================*/
  $('.dns__domain-name').text('.' + gloss.domainName + '.');
  $('.dns__domain-id').val($('#dns-create-record').attr('data-domain-id'));

  $('#dns-create-record-btn').click(function (e) {
    e.preventDefault();
    $('#dns-create-record').slideDown();
    $(this).fadeOut();
    $('#dns-create-record-close').fadeIn();
  });
  $('#dns-create-record-close').click(function () {
    $('#dns-create-record').slideUp();
    $(this).fadeOut();
    $('#dns-create-record-btn').fadeIn();
  });

  $(".ttl-select").chosen({ disable_search_threshold: 10, width: '150px' });

  $("#new_domain_ip_server").chosen({ disable_search_threshold: 10, width: '250px' }).change(function (e, params) {
    var text = $('#new_domain_ip_server').val();
    $('#IP').val(text);
    if (text == "") {
      $(this).parent().prev().find('label').removeClass("stay");
    }
    else {
      $(this).parent().prev().find('label').addClass("stay");
    }
  });

  $('.choose-server-select').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    if (params.selected != '') {
      var selectTarget = $('.choose-server-input[data-server-field=' + $(this).data('server-for') + ']');
      selectTarget.val(params.selected);
      selectTarget.next('label').addClass('stay');
      $('[data-valmsg-for="' + $(this).data("server-for") + '"]').remove();
    }
  });
  $('.choose-server-input').keyup(function () {
    var curVal = $(this).val(),
      field = $(this).data('server-field'),
      selectServer = $('.choose-server-select[data-server-for=' + field + ']');

    if (selectServer.find('option[value="' + curVal + '"]').length > 0) {
      selectServer.val(curVal).trigger('chosen:updated');
    } else {
      selectServer.val('').trigger('chosen:updated');
    }
  });

  $('.dns_create_record .radio_select').click(function () {
    $('.dns_create_record .radio_select').removeClass('selected');
    $('.dns_create_record .create-record-form').addClass('hidden');

    $(this).addClass('selected');
    var formid = '#' + $(this).attr('id') + '_form';
    $(formid).removeClass('hidden');
  });

  $('.mixName').on('keyup change', function () {
    addInfoFromInputToTip($(this));
  });

  function addInfoFromInputToTip(inputObj) {
    var text = inputObj.val(),
      tipElem = inputObj.closest('form').find('.record-name-full');

    if (!inputObj.val() == "") {
      inputObj.next().addClass('stay');
    } else {
      inputObj.next().removeClass('stay');
    }

    if (text == '@') {
      tipElem.next().addClass('hidden');
      tipElem.text(tipElem.next().text().substring(1));
    }
    else {
      tipElem.next().removeClass('hidden');
      tipElem.text(text);
    }
  }

  /*================ SRV RECORDS =================*/

  setSRVProtocolValue();
  $("#Proto").chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    setSRVProtocolValue();
  });

  var srvDomainName = $('#srv_domain_name').text();

  $('#CreateRecord_SRV_form #Name').on('keyup change', function () { setSrvName($(this)) });
  $('#CreateRecord_SRV_form #Service').on('keyup change', function () { setSrvService($(this)) });

  function setSrvName(input) {
    var text = input.val();

    if (text == '@' || text == '') {
      $('#srv_domain_name').text(srvDomainName);
    } else {
      $('#srv_domain_name').text('.' + text + srvDomainName);
    }
  }
  function setSrvService(input) {
    var text = input.val();
    if (text.charAt(0) != '_' && text != '') {
      text = '_' + text;
    }
    $('#srv_service_name').text(text);
  }

  function setSRVProtocolValue() {
    $('#srv_proto_name').text('_' + $("#Proto option:selected").text().toLowerCase());
  }

  /*================ AJAX CREATE EXACT RECORD =================*/
  $('.dns__create-record-btn').click(function (e) {
    e.preventDefault();
    var form = $(this).closest('form'),
      recordObj = {},
      send = true;

    $('[data-val="true"]', form).each(function () {
      if (!$(this).valid()) {
        send = false;
      }
    });

    if (send) {
      $('[data-val="true"]', form).each(function () {
        recordObj[$(this).attr('name')] = $(this).val();
      });

      activeFormId = form.attr('id');
      sendAjaxRequest('#' + activeFormId, form.attr('action'), recordObj, createRecordSuccess);
    } else {
      console.log('В форме есть ошибки');
    }
  });

  /*================ AJAX DELETE EXACT RECORD =================*/

  $('.dns__record-delete').click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    let recordBlock = $(this).closest('.dns__record');
    let confirm = new ConfirmPopup({
      text: gloss.textRecordConfirmDeleting,
      cbProceed: function () {
        deleteDNSRecord(recordBlock);
      }
    });
  });

  /*================ EDIT RECORD MODEL =================*/
  var objRecord = {};
  objRecord.Model = function () {
    this.Record = Object.create(null);
    this.Record.DomainId = $('[name="DomainId"]').val();
    this.Record.DomainName = gloss.domainName;
    this.Record.Name = '';
    this.Record.Id = '';
    this.Record.TypeRecord = '';
    this.Record.IP = '';
    this.Record.HostName = '';
    this.Record.Priority = '';
    this.Record.Text = '';
    this.Record.MnemonicName = '';
    this.Record.ExtHostName = '';
    this.Record.DateCreate = '';
    this.Record.Service = '';
    this.Record.Proto = '';
    this.Record.Weight = '';
    this.Record.Ttl = '';
    this.Record.Port = '';
    this.Record.Target = '';

    this.getActiveRecordValues = function (recordHTMLObj, model) {
      model.Record.TypeRecord = recordHTMLObj.data('record-type');
      model.Record.Id = recordHTMLObj.data('record-id');
      var HostNameTail = '.' + model.Record.DomainName + '.';

      for (var i = 0; i < recordHTMLObj.find('input').length; i++) {
        var input = recordHTMLObj.find('input').eq(i);
        model.Record[input.attr('data-name')] = input.val();
      }
      for (var i = 0; i < recordHTMLObj.find('select').length; i++) {
        var select = recordHTMLObj.find('select').eq(i);
        model.Record[select.attr('data-name')] = select.val();
      }

      if (model.Record.HostName.indexOf(HostNameTail) < 0 && model.Record.HostName != '@' && model.Record.TypeRecord !== 'CNAME') {
        model.Record.HostName += HostNameTail;
      }
      if (model.Record.TypeRecord == 'CNAME' && model.Record.MnemonicName.indexOf(HostNameTail) < 0 && model.Record.MnemonicName !== '@') {
        model.Record.MnemonicName += HostNameTail;
      }

      model.Record.Name = model.Record.HostName.replace(HostNameTail, '');

      //console.log(model.Record);
    }

    this.getActiveRecordValuesComplex = function (data, type, model) {
      model.Record.TypeRecord = type;
      dataArray = Object.keys(data);
      for (var i = 0; i < dataArray.length; i++) {
        model.Record[dataArray[i]] = data[dataArray[i]];
      }
      model.Record.DomainId = $('[name="DomainId"]').val();
      model.Record.DomainName = gloss.domainName;
    }

    this.prepareEditPostObj = function (model, recordHTMLObj) {
      var postObj = {};
      postObj.TypeRecord = model.Record.TypeRecord;
      postObj.HostName = recordHTMLObj.find('input[data-name="HostName"]').val();
      postObj.TTL = recordHTMLObj.find('select[data-name="Ttl"]').val();

      switch (model.Record.TypeRecord) {
        case 'A':
          postObj.IP = recordHTMLObj.find('input[data-name="IP"]').val();
          break;
        case 'AAAA':
          postObj.IP = recordHTMLObj.find('input[data-name="IP"]').val();
          break;
        case 'CNAME':
          postObj.MnemonicName = recordHTMLObj.find('input[data-name="MnemonicName"]').val();
          break;
        case 'NS':
          postObj.ExtHostName = recordHTMLObj.find('input[data-name="ExtHostName"]').val();
          break;
        case 'TXT':
          postObj.Text = recordHTMLObj.find('input[data-name="Text"]').val();
          break;
        case 'MX':
          postObj.ExtHostName = recordHTMLObj.find('input[id="HostName"]').val();
          postObj.HostName = recordHTMLObj.find('input[id="Name"]').val();
          postObj.Priority = recordHTMLObj.find('input[id="Priority"]').val();
          break;
        case 'SRV':
          postObj.HostName = recordHTMLObj.find('input[id="Name"]').val();
          postObj.Proto = recordHTMLObj.find('select[id="Proto"]').val();
          postObj.Service = recordHTMLObj.find('input[id="Service"]').val();
          postObj.Priority = recordHTMLObj.find('input[id="Priority"]').val();
          postObj.Weight = recordHTMLObj.find('input[id="Weight"]').val();
          postObj.Port = recordHTMLObj.find('input[id="Port"]').val();
          postObj.Target = recordHTMLObj.find('input[id="Target"]').val();
          break;
        default:
          break;
      }

      return postObj;
    }
  }

  /*================ EDIT RECORD VIEW =================*/
  objRecord.View = function (model) {
    var view = this;

    this.constructor = function () {
      var addSelectFunc = this.addTTLSelect;
      $('.dns__record').each(function () {
        addSelectFunc($(this));
        replaceTtlNumbersToValues($(this));
      });
    }
    this.addTTLSelect = function (recordHTMLObj, blockToPaste) {
      var ttlId = 'ttl-' + recordHTMLObj.data('record-id'),
        ttlNewSelect = ttlBaseSelect.clone().attr({ 'data-name': 'Ttl' });

      if (blockToPaste == undefined || blockToPaste == null) {
        ttlNewSelect.attr('id', ttlId).appendTo(recordHTMLObj.find('.dns__record-ttl'));
        recordHTMLObj.find('#' + ttlId + ' option[value="' + recordHTMLObj.find('.ttl-replace').data('ttl') + '"]').prop('selected', true);
      } else {
        ttlNewSelect.attr('id', 'TTL').appendTo(blockToPaste);
        blockToPaste.find('#TTL option[value="' + recordHTMLObj.find('.ttl-replace').data('ttl') + '"]').prop('selected', true);
      }

    }
    this.addProtoSelect = function (recordHTMLObj, blockToPaste) {
      var pId = 'Proto',
        pNewSelect = $('#proto-base-select').clone().attr({ 'data-name': 'Proto', 'class': 'select-proto' });

      pNewSelect.attr('id', pId).appendTo(blockToPaste);
      blockToPaste.find('#' + pId + ' option[value="' + recordHTMLObj.find('.dns__record-value input').data('proto') + '"]').prop('selected', true);
    }

    this.checkUnsavedRecord = function (e) {
      e.stopPropagation();
      var curEditedRecordObj = $(recordsContainerSelector).find('.dns__record--editing');
      if (curEditedRecordObj.length > 0 && (curEditedRecordObj.has(e.target).length === 0 || e.target.classList.contains('dns__edit-cancel') || e.target.classList.contains('dns__edit-confirm'))) {
        this.restorePreviousValues(curEditedRecordObj, model);
        $('.dns__record').removeClass('dns__record--editing');
        $(errorSelector).remove();
        hideTTLSelectChosen(curEditedRecordObj.find('.dns__record-ttl'));
      }
    }
    this.restorePreviousValues = function (recordHTMLObj, model) {
      for (var i = 0; i < recordHTMLObj.find('input').length; i++) {
        var input = recordHTMLObj.find('input').eq(i);
        if (input.val() != model.Record[input.attr('data-name')]) {
          input.val(model.Record[input.attr('data-name')]);
        }
      }
      for (var i = 0; i < recordHTMLObj.find('select').length; i++) {
        var select = recordHTMLObj.find('select').eq(i);
        if (select.val() != model.Record[select.attr('data-name')]) {
          select.find('option[value="' + model.Record[select.attr('data-name')] + '"]').prop('selected', true);
          select.trigger('chosen:update');
        }
      }

      // Restore ttl span value
      var ttlValue = model.Record.Ttl;
      $('.ttl-replace', recordHTMLObj).attr('data-ttl', ttlValue).text(ttlBaseSelect.find('option[value=' + ttlValue + ']').text());
    }

    this.addLabelsToInputs = function (recordHTMLObj) {
      if (recordHTMLObj.find('.dns__record-label').length < 1) {
        for (var i = 0; i < recordHTMLObj.find('input').length; i++) {
          var input = recordHTMLObj.find('input').eq(i);
          var label = $('<label/>', {
            'class': 'dns__record-label',
            'text': this.getLabelText(input.attr('data-name'), recordHTMLObj.attr('data-record-type'))
          });
          input.parent().append(label);
          label.offset(); // initializing DOM-object
        }
      }
    }
    this.addLabelsToTtl = function (recordHTMLObj) {
      var ttlBlock = recordHTMLObj.find('.dns__record-ttl');
      if (ttlBlock.find('.dns__record-label').length < 1) {
        ttlBlock.append($('<label/>', { 'class': 'dns__record-label', 'text': 'TTL' })).offset();
      }
    }
    this.getLabelText = function (name, type) {
      switch (name) {
        case 'HostName':
          switch (type) {
            case 'CNAME': return gloss.textLabelCanonical;
            case 'TXT': return gloss.textLabelNameDog;
            case 'NS': return gloss.textLabelNameDog;
            default: return gloss.textLabelNameDogStar;
          }
        case 'IP':
          return gloss.textLabelIp;
        case 'Text':
          return gloss.textLabelText;
        case 'MnemonicName':
          return gloss.textLabelMnemonic;
        case 'ExtHostName':
          return gloss.textLabelName;
        default:
          return '';
      }
    }
    this.leadHostNameToBasicView = function (recordHTMLObj, model) {
      var field = (model.Record.TypeRecord === 'CNAME') ? 'MnemonicName' : 'HostName';
      recordHTMLObj.find('input[data-name=' + field + ']').val(model.Record[field].replace('.' + model.Record.DomainName + '.', ''));
    }
    this.leadHostNameToRealView = function (recordHTMLObj, model) {
      var field = (model.Record.TypeRecord === 'CNAME') ? 'MnemonicName' : 'HostName';
      if (model.Record.TypeRecord !== 'MX') {
        var curHostNameInput = recordHTMLObj.find('input[data-name=' + field + ']');
        if (curHostNameInput.val() !== '@' && curHostNameInput.val().indexOf(model.Record.DomainName) > -1) {
          curHostNameInput.val(curHostNameInput.val() + '.' + model.Record.DomainName + '.');
        }
      }
    }

    this.addEditControls = function (recordHTMLBlock) {
      var actionsBlock = recordHTMLBlock.find('.dns__record-actions'),
        view = this;
      if (actionsBlock.find('.dns__edit-btn').length < 1) {
        actionsBlock.append($('<span/>', {
          class: 'dns__edit-btn dns__edit-confirm',
          'title': gloss.textChangesSave,
          click: function (e) {
            confirmSimpleRecordChanges(e, model, view);
          }
        }));
        actionsBlock.append($('<span/>', {
          class: 'dns__edit-btn dns__edit-cancel',
          'title': gloss.textChangesCancel,
          click: function (e) {
            view.checkUnsavedRecord(e);
          }
        }));
      }
    }

    this.fillModal = function (recordId, type, model) { // Send request and fill modal fields with current values
      var url = (type == 'MX') ? urlToGetMXRecordValues : urlToGetSRVRecordValues,
        modalBlock = $('#modal' + type);
      var addTTLSelectFunc = this.addTTLSelect,
        addProtoSelectFunc = this.addProtoSelect;

      url = url.replace('recordIdMask', recordId);

      $.get(url, function (data) {
        model.getActiveRecordValuesComplex(data, type, model);
        modalBlock.find('.dns__modal-field').each(function () {
          $(this).val(data[$(this).attr('id')]);
          $(this).parent().find('.label-modal').addClass('stay');
        });

        if (modalBlock.find('#TTL').length > 0) {
          modalBlock.find('#TTL option').each(function () {
            if (this.value == data.TTL) {
              $(this).prop('selected', true);
            } else {
              $(this).prop('selected', false);
            }
          });
          modalBlock.find($('#TTL')).trigger('chosen:updated');
        } else {
          addTTLSelectFunc($('.dns__record[data-record-id=' + recordId + ']'), modalBlock.find('.modal-ttl-block'));
          modalBlock.find('#TTL').val(data.TTL).chosen({ disable_search_threshold: 10, width: '100%' });
        }

        if (type == 'SRV') {
          if (modalBlock.find('#Proto').length > 0) {
            modalBlock.find($('#Proto')).trigger('chosen:updated')
          } else {
            addProtoSelectFunc($('.dns__record[data-record-id=' + recordId + ']'), modalBlock.find('.modal-proto-block'));
            modalBlock.find('#Proto').chosen({ disable_search_threshold: 10, width: '100%' });
          }
        }

        modalBlock.find('.btn-primary').attr('data-record-id', recordId);
        modalBlock.modal('show');
      });
    }

    this.completeRecordEditing = function (data) {
      var recordBlock = $('.dns__record[data-record-id="' + data.Dns.Id + '"]'),
        modalOpened = $('.onecloud__modal.in');
      recordBlock.removeClass('dns__record--editing');


      if (modalOpened.length > 0) {
        modalOpened.find('.btn-inprogress').removeClass('btn-inprogress').text(textSendCur);
        modalOpened.modal('hide');
        resetDNSFrom(modalOpened.find('form'), false);
      } else {
        hideTTLSelectChosen(recordBlock.find('.dns__record-ttl'));
      }

      replaceActionWithProgress(data.Task[data.Task.length - 1].ID, recordBlock.data('record-id'));

      var checkTaskCompleted = window.setInterval(function () {
        if (taskList[data.Task[data.Task.length - 1].ID] === 'executed') {
          clearInterval(checkTaskCompleted);

          updateRecordBlock(recordBlock, data);
          highlightEditSuccess(recordBlock);
          changeZoneFile(recordBlock.data('record-id'), data.Dns);
        }
      }, 1000);
    }
    this.showErrors = function (data) {
      if (data.responseJSON != undefined) {
        var errObj = JSON.parse(data.responseJSON),
          errArray = Object.keys(errObj.ModelState);
        for (var i = 0; i < errArray.length; i++) {
          var key = errArray[i];
          if (key == 'Name') {
            key = 'HostName';
          }
          var errElem = $('.dns__record--editing').find('[data-name="' + key + '"]');
          if ($(errElem).parent().find(errorSelector).length > 0) {
            errorMessageRemove($(errElem));
          }
          errorMessageAdd($(errElem), errObj.ModelState[errArray[i]]);
        }
      }
    }

    this.editRecord = function (e, model, view, recordId, recordType) {
      if (!e.currentTarget.classList.contains('dns__record--editing')) {
        view.checkUnsavedRecord(e);

        var recordBlock = $('.dns__record[data-record-id="' + recordId + '"]');

        if (recordBlock.find('.progress').length < 1 && !recordBlock.hasClass('dns__record--no-edit') && recordBlock.find('.popup').length < 1) {
          if (recordType != 'MX' && recordType != 'SRV') {

            if (!recordBlock.hasClass('dns__record--editing')) {
              view.addLabelsToInputs(recordBlock);
              view.addLabelsToTtl(recordBlock);
              view.addEditControls(recordBlock);

              model.getActiveRecordValues(recordBlock, model);

              if (recordBlock.find('.dns__record-ttl select').length < 1) {
                view.addTTLSelect(recordBlock);
              }
              showTTLSelectChosen(recordBlock);

              view.leadHostNameToBasicView(recordBlock, model);
              recordBlock.addClass('dns__record--editing');
            }

          } else if (recordType == 'MX') {
            view.fillModal(recordId, recordType, model);
          } else if (recordType == 'SRV') {
            view.fillModal(recordId, recordType, model);
            $("#EditRecord_SRV_form #Proto").chosen({ disable_search_threshold: 10, width: '100%' })
          }
        }
      }
    }
  }

  /*================ EDIT RECORD CONTROLLER =================*/
  objRecord.Controller = function (model, view) {

    // check click outside domains' list area: restore value if unsaved, then remove decoration of blocks
    $(document).click(function (e) {
      var container = $(recordsContainerSelector);
      if (container.has(e.target).length === 0) {
        view.checkUnsavedRecord(e);
      }
    });

    // check click on record
    $('.dns__record', $(recordsContainerSelector)).click(function (e) {
      e.stopPropagation();
      if (e.originalEvent.target.offsetParent.className !== 'chosen-single') {
        view.editRecord(e, model, view, $(this).data('record-id'), $(this).data('record-type'));
      }
    });

    // Simple record changes cancelled
    $('.dns__edit-cancel').click(function (e) {
      e.stopPropagation();
      view.checkUnsavedRecord(e);
    })

    // Simple record changes confirmed
    $('.dns__edit-confirm').click(function (e) {
      e.stopPropagation();
      confirmSimpleRecordChanges(e, model, view);
    });

    $('.dns__modal-confirm').click(function (e) {
      e.preventDefault();
      var recordId = $(this).data('record-id'),
        form = $(this).closest('form');

      sendAjaxRequest('#' + form.attr('id'), form.attr('action').replace('recordIdMask', recordId), model.prepareEditPostObj(model, $('.modal.in')), view.completeRecordEditing);
    });
  }


  /*================ INITIALIZE ROOT OBJECT =================*/
  var modelRecord = new objRecord.Model(),
    viewRecord = new objRecord.View(modelRecord),
    controllerRecord = new objRecord.Controller(modelRecord, viewRecord);

  viewRecord.constructor();

  function createRecordSuccess(data) {
    var recordData = data,
      newRecordBlock = $('<div/>', {
        'class': 'dns__record',
        'data-record-id': recordData.Dns.Id,
        'data-record-type': recordData.Dns.TypeRecord,
        click: function (e) {
          e.stopPropagation();
          viewRecord.editRecord(e, modelRecord, viewRecord, recordData.Dns.Id, recordData.Dns.TypeRecord);
        }
      }),
      recordValue = getRecordValue(recordData.Dns),
      recordAddress = getRecordAddress(recordData.Dns),
      recordProto = (recordData.Dns.TypeRecord == 'SRV') ? 'data-proto=' + recordData.Dns.Proto : '',
      recordTTL = '<span class="ttl-replace">' + ttlBaseSelect.find('option[value="' + recordData.Dns.Ttl + '"]').text() + '</span>';

    newRecordBlock.append($('<div/>', {
      class: 'dns__record-type dns__record-type--' + recordData.Dns.TypeRecord.toLowerCase(),
      'data-record-id': recordData.Dns.ID,
      'data-record-type': recordData.Dns.TypeRecord,
      'text': recordData.Dns.TypeRecord
    }))
      .append($('<div/>', {
        class: 'dns__record-value',
        'html': '<input readonly type="text" id="value-' + recordData.Dns.Id + '" data-name="' + getRecordInputName(recordData.Dns) + '" value="' + recordValue + '" ' + recordProto + ' />'
      }))
      .append($('<div/>', {
        class: 'dns__record-address',
        'html': '<input readonly type="text" id="address-' + recordData.Dns.Id + '" data-name="' + getRecordInputName(recordData.Dns, 'address') + '" value="' + recordAddress + '" />'
      }))
      .append($('<div/>', {
        class: 'dns__record-ttl',
        'html': recordTTL
      }))
      .append($('<div/>', {
        class: 'dns__record-actions',
        'html': '<div class="progress progress-striped active" id="pending-' + recordData.Task[0].ID + '" title="' + gloss.textRecordCreating + '"><span class="bar"></span></div>'
      }));

    $(recordsContainerSelector).append(newRecordBlock);

    $('.dns__zonefile').append($('<div/>', {
      'id': 'filezone-item-' + recordData.Dns.Id,
      'text': recordData.Dns.CanonicalDescription.replace('@', gloss.domainName)
    }));

    taskList[recordData.Task[0].ID] = window.setInterval(function () {
      checkDNSRecordState(recordData.Task[0].ID, recordData.Dns.Id);
    }, 1000);

    $('#' + activeFormId).find('form')[0].reset();
    $('#' + activeFormId).find('label.stay').removeClass('stay');
    $('#' + activeFormId).find('select').each(function () {
      $(this).trigger("chosen:updated");
    });
    activeFormId = '';
  }
  function getRecordValue(recordObj) {
    switch (recordObj.TypeRecord) {
      case 'SRV':
        return recordObj.Service + recordObj.Proto;
        break;
      default:
        return recordObj.HostName;
    }
  }
  function getRecordAddress(recordObj) {
    switch (recordObj.TypeRecord) {
      case 'SRV':
        return recordObj.Target;
        break;
      case 'MX':
        return recordObj.ExtHostName;
        break;
      case 'CNAME':
        return recordObj.MnemonicName;
        break;
      case 'TXT':
        return recordObj.Text.replace(new RegExp('"', 'g'), '&quot;');
        break;
      case 'NS':
        return recordObj.ExtHostName;
        break;
      default:
        return recordObj.Ip;
    }
  }
  function getRecordInputName(recordObj, recordField) {
    if (recordField !== 'address') {
      if (recordObj.TypeRecord == 'SRV') {
        return 'Proto';
      } else {
        return 'HostName';
      }
    } else {
      switch (recordObj.TypeRecord) {
        case 'SRV':
          return 'Target';
          break;
        case 'MX':
          return 'ExtHostName';
          break;
        case 'CNAME':
          return 'MnemonicName';
          break;
        case 'TXT':
          return 'Text';
          break;
        case 'NS':
          return 'ExtHostName';
          break;
        default:
          return 'IP';
      }
    }
  }
  function checkDNSRecordState(taskId, recordId) {
    $.get(urlGetTaskStatus.replace('-1', taskId), null, function (data) {
      if (data.ProgressPercent > 0) {
        $('#pending-' + taskId + ' .bar').css("width", data.ProgressPercent + "%");
      }
      if (data.TaskIsComplited == true) {
        clearInterval(taskList[taskId]);
        taskList[taskId] = 'executed';
        $('#pending-' + taskId + ' .bar').css("width", "100%");

        setTimeout(function () {
          $('.dns__record[data-record-id=' + recordId + ']').removeClass('dns__record--no-edit');
          replaceProgressWithAction(taskId, recordId);

          // if new record: reset form and show success message
          var dnsBtnProgress = $('#dns-create-record').find('.btn-inprogress');
          if (dnsBtnProgress.length > 0) {
            resetDNSFrom(dnsBtnProgress.closest('form'));
            dnsBtnProgress.removeClass('btn-inprogress').text(textSendCur);

            let notice = new PanelNotice(gloss.textRecordCreatingSuccess, 'success');
          }
        }, 1500);
      }
    }, "json")
      .fail(function (data) {
        clearInterval(taskList[taskId]);
        taskList[taskId] = 'failed';
        handleAjaxErrors(data);
      });
  };

  function replaceProgressWithAction(taskId, recordId) {
    // remove progress bar, add delete button
    var actionsBlock = $('#pending-' + taskId).closest('.dns__record-actions');
    actionsBlock.empty();
    actionsBlock.append($('<span/>', {
      class: 'btn-delete dns__record-delete',
      'data-href': urlToDeleteRecord.replace('-1', recordId),
      'title': gloss.textRecordDelete,
      click: function (e) {
        e.preventDefault();
        e.stopPropagation();

        let recordBlock = $(this).closest('.dns__record');
        let confirm = new ConfirmPopup({
          text: gloss.textRecordConfirmDeleting,
          cbProceed: function () {
            deleteDNSRecord(recordBlock);
          }
        });
      }
    }));

    // remove readonly and disabled attributes
    actionsBlock.parent().find('input').each(function () {
      if (this.readOnly) {
        $(this).removeAttr('readonly');
      }
    });
    actionsBlock.parent().find('select').each(function () {
      if (this.disabled) {
        $(this).removeAttr('disabled');
      }
    });
  }
  function replaceActionWithProgress(taskId, recordId) {
    var actionsBlock = $('.dns__record[data-record-id=' + recordId + ']').find('.dns__record-actions');
    actionsBlock.empty();
    actionsBlock.html('<div class="progress progress-striped active" id="pending-' + taskId + '" title="' + gloss.textRecordCreating + '"><span class="bar"></span></div>');
    taskList[taskId] = window.setInterval(function () {
      checkDNSRecordState(taskId, recordId);
    }, 1000);

    // add readonly and disabled attributes
    actionsBlock.parent().find('input[id*="-' + recordId + '"]').each(function () { $(this).attr('readonly', true) });
    actionsBlock.parent().find('select').each(function () { $(this).attr('disabled', 'disabled') });
  }

  function resetDNSFrom(formObj, isFormModal) {
    formObj.find('input[type!="hidden"]').val('');
    formObj.find('.stay').removeClass('stay');

    formObj.find('.ttl-select option[value=' + ttlBaseSelect.find('option:selected').val() + ']').prop('selected', true);
    formObj.find('.ttl-select').trigger('chosen:updated');

    if (formObj.attr('id').indexOf('SRV') !== -1) {
      $('#srv_service_name').text('');
      formObj.find('#Proto option:first').prop('selected', true);
      formObj.find('#Proto').trigger('chosen:updated');
      setSRVProtocolValue();
    } else {
      if (!isFormModal) {
        formObj.find('.dns__domain-name').prev().text('');
      }
    }

  }
  function deleteDNSRecord(deleteRecordBlock) {
    var deleteLink = deleteRecordBlock.find('.dns__record-delete').attr('data-href');
    deleteRecordBlock.addClass('loading loading--full');

    sendAjaxRequest(recordsContainerSelector, deleteLink, {}, function (data) {
      setTimeout(function () {
        deleteRecordBlock.removeClass('dns__record loading loading--full');
        deleteRecordBlock.children().remove();
        $('#filezone-item-' + deleteRecordBlock.attr('data-record-id')).remove();

        let notice = new PanelNotice(gloss.textRecordDeleted, 'success');
      }, 3000);
    });

  }
  function replaceTtlNumbersToValues(recordObj) {
    var ttlSpan = recordObj.find('.ttl-replace');
    ttlSpan.text(ttlBaseSelect.find('option[value="' + ttlSpan.text() + '"]').text());
  }

  function confirmSimpleRecordChanges(e, model, view) {
    e.stopPropagation();
    var recordBlock = $(e.target).closest('.dns__record');

    sendAjaxRequest(recordsContainerSelector, urlToEditRecord.replace('recordIdMask', recordBlock.data('record-id')), model.prepareEditPostObj(model, recordBlock), function (data) {
      view.completeRecordEditing(data);
      view.leadHostNameToRealView(recordBlock, model);
    }, function (data) {
      view.showErrors(data);
    });
  }
  function highlightEditSuccess(recordHTMLObj) {
    recordHTMLObj.css('background-color', 'rgba(92, 184, 92, 0.7)');
    setTimeout(function () {
      recordHTMLObj.removeAttr('style');
    }, 500);
  }
  function updateRecordBlock(recordBlock, data) {
    var recordId = recordBlock.data('record-id');
    $('#value-' + recordId).val(getRecordValue(data.Dns));
    $('#address-' + recordId).val(getRecordAddress(data.Dns).replace(new RegExp('&quot;', 'g'), '"'));

    recordBlock.find('.ttl-replace').attr('data-ttl', data.Dns.Ttl).text(ttlBaseSelect.find('option[value=' + data.Dns.Ttl + ']').text());
  }
  function changeZoneFile(recordId, data) {
    $('#filezone-item-' + recordId).text(data.CanonicalDescription.replace('@', gloss.domainName));
  }
  function showTTLSelectChosen(ttlBlock) {
    if (ttlBlock.find('.chosen-container').length < 1) {
      ttlBlock.find('.ttl-replace').addClass('hidden');
      ttlBlock.find('select').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
        e.stopPropagation();
        if (params.selected != '') {

          ttlBlock.find('.ttl-replace')
            .attr('data-ttl', params.selected)
            .text(ttlBaseSelect.find('option[value="' + params.selected + '"]').text());
        }
      });
    }
  }
  function hideTTLSelectChosen(ttlBlock) {
    if (ttlBlock.find('.chosen-container').length > 0) {
      ttlBlock.find('select').chosen('destroy').hide();
      ttlBlock.find('.ttl-replace').removeClass('hidden');
    }
  }

});

