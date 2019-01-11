$(function () {
  var form = $('#action-disks-form');
  var tableDisks = $('#list_disks');
  var tbodyDisks = tableDisks.find('tbody');

  var diskClasses = {
    row: 'add-disk__row',
    type: 'add-disk__type',
    name: 'add-disk__name',
    size: 'add-disk__size',
    delete: 'add-disk__delete'
  };

  updateDiskPriceText(Math.round((price.GetAdditionalDiskPrice()) * 100) / 100);

  $('.' + diskClasses.type).chosen({
    disable_search_threshold: 10,
    width: '100px',
    no_results_text: resources.JS_Choosen_NoResults
  }).change(function (e, params) {
    changeDiskType(this);
  });
  $('.' + diskClasses.size).chosen({
    disable_search_threshold: 10,
    width: '100px',
    no_results_text: resources.JS_Choosen_NoResults,
    placeholder_text_single: resources.JS_Choosen_NoResults, size: 4
  }).change(function (e, params) {
    changeDiskSize(this);
  });

  $('.list_disk_on_si #add_block').click(function () {
    addNewDisk();
  });

  $('.' + diskClasses.delete).click(function () {
    deleteDisk(this);
  });

  form.submit(function (e) {
    e.preventDefault();
    submitDiskChanges();
  });

  function addNewDisk() {
    var isMinsk = $('#DcLocation_Val').val() === 'MinskBy';
    var newTr = $('<tr />', {
      class: diskClasses.row
    });

    newTr
      .append(getTypeSelectCell())
      .append(getNameInputCell())
      .append(getSizeSelectCell())
      .append(getDeleteBtnCell());

    tbodyDisks.append(newTr);

    newTr.find('.' + diskClasses.type).chosen({
      disable_search_threshold: 10,
      width: '100px',
      no_results_text: resources.JS_Choosen_NoResults
    }).change(function (e, params) {
      changeDiskType(this);
    });

    newTr.find('.' + diskClasses.size).chosen({
      disable_search_threshold: 10,
      width: '100px',
      no_results_text: resources.JS_Choosen_NoResults,
      size: 4,
      placeholder_text_single: resources.JS_Choosen_NoResults
    }).change(function (e, params) {
      changeDiskSize(this);
    });

    showNeedPaymentOnDisk(price.GetAdditionalDiskPrice());
    updateCosts();

    function getTypeSelectCell() {
      var td = $('<td />');
      var select = $('<select />', {
        class: diskClasses.type
      });

      if (!isMinsk) { // HACK FOR MINSK - ONLY SSD
        select.append(new Option('SAS', 'SAS'));
        select.append(new Option('SATA', 'SATA'));
      }
      select.append(new Option('SSD', 'SSD'));
      td.append(select);

      return td;
    }

    function getNameInputCell() {
      var td = $('<td />');
      var input = $('<input />', {
        class: diskClasses.name + ' form-control',
        type: 'text',
        size: 20,
        placeholder: 'Название диска',
        value: 'Disk'
      });
      td.append(input);

      return td;
    }

    function getSizeSelectCell() {
      var td = $('<td />');
      var select = $('<select />', {
        class: diskClasses.size
      });
      var hddObject = GetHddPerformanceObject((isMinsk) ? 'SSD' : 'SAS');

      for (var i = hddObject.min_value; i <= hddObject.max_value; i += hddObject.step) {
        select.append(new Option(i, i));
      }

      td.append(select);

      return td;
    }

    function getDeleteBtnCell() {
      var td = $('<td />');
      var btn = $('<span />', {
        class: diskClasses.delete + ' delete-item-list',
        text: resources.Delete,
        click: function () {
          deleteDisk(this);
        }
      });

      td.append(btn);

      return td;
    }
  }

  function deleteDisk(delBtn) {
    $(delBtn).closest('.' + diskClasses.row).remove();
    showNeedPaymentOnDisk(price.GetAdditionalDiskPrice());
    updateCosts();
  }

  function submitDiskChanges() {
    var rows = tbodyDisks.find('.' + diskClasses.row);
    var addDiskObj = getDisksObj();

    if (!addDiskObj.Confirm_Delete) {
      errorMessageAdd(form.find('[name="Confirm_Delete"]'), resources.Shared_Required);
      return;
    }
    
    sendAjaxRequest('#' + form.attr('id'), form.attr('action'), getDisksObj(), null, onErrorDisksSave);

    function getDisksObj() {
      var disks = [];

      rows.each(function () {
        disks.push({
          Id: (typeof $(this).data('id') !== 'undefined') ? $(this).data('id') : '',
          Type: $(this).find('.' + diskClasses.type).val(),
          Name: $(this).find('.' + diskClasses.name).val(),
          Size: $(this).find('.' + diskClasses.size).val()
        });
      });

      return {
        ServiceInstanceId: form.find('[name="ServiceInstanceId"]').val(),
        IsEditable: form.find('[name="IsEditable"]').val().toLocaleLowerCase() === 'true',
        OrderDiskLines: disks,
        Confirm_Delete: form.find('[name="Confirm_Delete"]').prop('checked')
      };
    }

    function onErrorDisksSave(response) {
      console.log(response);
    }
  }

  //получить объек описывающий параметры слайдеров и типовых конфигураций
  function GetCurrentPerformanceObject() {
    var dcTechTitle = $("#DcLocation_Val").val();
    var dcLocation = initparams.SPb_SDN; // default

    for (var key in initparams) {
      if (initparams[key] !== null && dcTechTitle === initparams[key].DCLocationTechTitle) {
        dcLocation = initparams[key];
        break;
      }
    }

    var performanceObject = dcLocation.perflow;
    if ($('#performance_chosen .selected').attr('id') == 'perfhigh') {
      performanceObject = dcLocation.perfhigh;
    }
    if ($('div.order-config #HDDType').val() == "SSD") {
      performanceObject.HDD = performanceObject.HDD_SSD;
    }
    else {
      performanceObject.HDD = performanceObject.HDD_SAS;
    }

    return performanceObject;
  }

  function GetHddPerformanceObject(diskType) {
    var perfObject = GetCurrentPerformanceObject();

    return (typeof perfObject['HDD_' + diskType] !== 'undefined') ? perfObject['HDD_' + diskType] : perfObject.HDD_SAS;
  }

  function changeDiskType(typeSelect) {
    var tr = $(typeSelect).closest('.' + diskClasses.row);
    var isFromServer = (typeof tr.data('size') !== 'undefined');
    var newType = $(typeSelect).val();
    var curDiskSizeSelect = tr.find('.' + diskClasses.size);
    var curDiskSizeValue = Number(curDiskSizeSelect.val());
    var hddObject = GetHddPerformanceObject(newType);
    var minDiskValue = (isFromServer) ? Number(tr.data('size')) : hddObject.min_value;

    minDiskValue = (minDiskValue % hddObject.step > 0) ? Math.ceil(minDiskValue / hddObject.step) * hddObject.step : minDiskValue;

    curDiskSizeSelect.find('option').each(function () {
      $(this).remove();
    });

    curDiskSizeValue = getCorrectSizeValue(curDiskSizeValue, newType, isFromServer);

    for (var i = (isFromServer) ? minDiskValue : hddObject.min_value; i <= hddObject.max_value; i += hddObject.step) {
      curDiskSizeSelect.append(new Option(i, i));
    }

    if (minDiskValue > hddObject.max_value) {
      curDiskSizeValue = minDiskValue;
      curDiskSizeSelect.append(new Option(minDiskValue, minDiskValue));
    }

    curDiskSizeSelect.val(curDiskSizeValue);
    curDiskSizeSelect.trigger("chosen:updated");

    showNeedPaymentOnDisk(price.GetAdditionalDiskPrice());
    updateCosts();
  }
  function changeDiskSize(sizeSelect) { // ???
    showNeedPaymentOnDisk(price.GetAdditionalDiskPrice());
    updateCosts();
  }

  function getCorrectSizeValue(size, type, isOrdered) {
    var diskObject = GetHddPerformanceObject(type),
      curDiskSizeValue = Number(size);

    if (curDiskSizeValue < diskObject.min_value) {
      return diskObject.start_value;
    } else if (curDiskSizeValue > diskObject.max_value) {
      return diskObject.max_value;
    } else if (curDiskSizeValue % diskObject.step > 0) {
      return Math.ceil(curDiskSizeValue / diskObject.step) * diskObject.step;
    }

    return curDiskSizeValue;
  }

  function showNeedPaymentOnDisk(total) {
    var user_balance = parseInt($('#user-balance').data("balance-money"));
    var byweek = parseInt(Math.round((total / 4) * 100) / 100);
    var monthPay = Math.round((total) * 100) / 100;

    updateDiskPriceText(monthPay);

    if (total > 3000 && user_balance < byweek) {
      $('.server-add-disk-price #need-money-count').text(byweek);
      $('.server-add-disk-price .need-add-money').removeClass('hidden');
    }
    else {
      $('.server-add-disk-price .need-add-money').addClass('hidden');
    }
  }
  function updateDiskPriceText(monthPay) {
    $('.server-add-disk-price #server-add-disk-price').text(monthPay);
  }

  function updateCosts() {
    snapshot_cost();
    backup_cost();
  }
  function snapshot_cost() {
    if (!!$('.snapshot-price #snapshot-price')[0]) {
      price.current_hdd_val = $('#hdd').val();
      var snapshotTotal = price.GetSnapshotPrice();
      $('.snapshot-price #snapshot-price')[0].innerHTML = snapshotTotal;
    }
  };
  function backup_cost() {
    var backupElem = document.getElementById("BackupPeriodVAL");

    if (backupElem !== null) {
      price.current_hdd_val = $('#hdd').val();
      price.current_backup_period = backupElem.value;
      $('.backup-price #backup-price').html(price.GetBackupPrice());
    }
  };
});