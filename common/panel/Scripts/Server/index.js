function edit() {
  initPrices();
  $('.slider').slider({ range: "min" });

  $('.hdd_form-component select').val($('#HDDType').val());
  $('.hdd_form-component select').trigger("chosen:updated");

  InitSliders();
  init();
  $('#cpu-select').change(function () {
    edit_server();
  });
  $('#ram-select').change(function () {
    edit_server();
  });
  $('#hdd-select').change(function () {
    edit_server();
    snapshot_cost();
    backup_cost();
  });
  $(".backup_selection .radio_select").click(function () {
    backup_on_off($(this));
  });
  $(".backup_period .small_radio_select").click(function () {
    backup_period($(this));
    backup_cost();
  });
  $('#performance_chosen .radio_select ').click(function () {
    PerformanceChange(this);
  });
  //скрывать tooltip о необходимости перевода на оборудование высокой производительности
  $('.slider-wrap .slider').mouseleave(function () {
    HideTooltipOnSlider(this);
  });

  // HACK FOR MINSK DISK TYPE
  if ($('#DcLocation_Val').val() === 'MinskBy') {
    $(".disk_type option").each(function () {
      $(this).prop('disabled', $(this).val() !== 'SSD');
    });
  }
  $(".disk_type").chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
    ChangeDiskType(this);
  });

  function init() {
    edit_server();
    snapshot_cost();
    backup_on_off();
    backup_cost();
    init_backup();
  }

  //инициализация стоимостей
  function initPrices() {
    var performanceObject = getCurrentPerformanceObject();
    price.cpu_price = parseFloat(performanceObject.CPU.price);
    price.hdd_sas_price = (performanceObject.HDD_SAS) ? parseFloat(performanceObject.HDD_SAS.price) : 0;
    price.hdd_ssd_price = (performanceObject.HDD_SSD) ? parseFloat(performanceObject.HDD_SSD.price) : 0;
    price.hdd_sata_price = (performanceObject.HDD_SATA) ? parseFloat(performanceObject.HDD_SATA.price) : 0;
    price.ram_price = parseFloat(performanceObject.RAM.price);
    price.net_bandwidth_price = parseFloat(performanceObject.NetworkBandwidth.price);
    price.backup_price = parseFloat(performanceObject.Backup.price);
    price.snapshot_price = parseFloat(performanceObject.Snapshot_price);
  }

  //Изменение переключателя Производительности оборудования
  function PerformanceChange(e) {
    $("#performance_chosen .radio_select").removeClass("selected");
    $(e).addClass("selected");
    $('#Performance').val($(e).attr('id'));
    onChangeGHzCPU(Number($('#cpu-slider').slider('value')));

    initPrices();
    InitSliders(false);
    price.Calculate();

    visibleTimeMessage(price.current_cpu_val, $('#Performance').val());
  }


  function edit_server() {
    price.current_cpu_val = $('#cpu').val();
    price.current_ram_val = $('#ram').val();
    price.current_hdd_val = $('#hdd').val();

    var performance = $('#Performance').val();
    var serverTotal = price.GetServerPrice();
    $('.server-edit-price #server-edit-price')[0].innerHTML = serverTotal;
    price.ShowNeedPayment('server-edit-price', serverTotal);


    var isEnableLowPool = $('#serviceInstance_DCLocation_IsEnableLowPool').val();
    var isEnableHighPool = $('#serviceInstance_DCLocation_IsEnableHighPool').val();

    if (isEnableLowPool != "True") {
      $('#performance_chosen #perflow').addClass('hidden');
    }
    if (isEnableHighPool != "True") {
      $('#performance_chosen #perfhigh').addClass('hidden');
    }

    onChangeGHzCPU(Number($('#cpu-slider').slider('value')));

    var submitBtn = $($('.edit_serviceInstance input[type="submit"]')[0]);
    var ram = parseInt(price.current_ram_val) >= 500 ? parseInt(price.current_ram_val) : parseInt(price.current_ram_val) * 1024
    if (siDB.cpu != price.current_cpu_val || siDB.ram != ram || siDB.performance != performance) {
      $(submitBtn).val(resources.ChangeAndRebootBtn);
    }
    else {
      $(submitBtn).val(resources.ChangeBtn);
    }
  };
  function snapshot_cost() {
    if (!!$('.snapshot-price #snapshot-price')[0]) {
      price.current_hdd_val = $('#hdd').val();
      var snapshotTotal = price.GetSnapshotPrice();
      $('.snapshot-price #snapshot-price')[0].innerHTML = snapshotTotal;
    }
  };
  function backup_cost() {
    if (document.getElementById('BackupPeriodVAL')) {
      price.current_hdd_val = $('#hdd').val();
      price.current_backup_period = document.getElementById('BackupPeriodVAL').value;
      var backupTotal = price.GetBackupPrice();
      $('.backup-price #backup-price')[0].innerHTML = backupTotal;
    }
  };

  function backup_on_off(e) {
    if (!!e) { //проверка на undefined
      $(".backup_selection .radio_select").removeClass("selected");
      $(e).addClass("selected");
      var backup_state = $(e).attr('id');
      if (backup_state === 'backup_On') {
        $('#backup-param').show();
        $('#backup-param').removeClass('hidden');
        $('.backup_selection #backup').val(true);
      } else {
        $('#backup-param').hide();
        $('#backup-param').addClass('hidden');
        $('.backup_selection #backup').val(false);
        $('#backup-param').addClass('hidden');
        price.current_cpu_val = $('#cpu').val();
        price.current_ram_val = $('#ram').val();
        price.current_hdd_val = $('#hdd').val();
        price.current_isbackupOn = false;
        price.current_backup_period = 0;

        price.Calculate();
      }
    }
  };
  function init_backup() {
    if (price.current_isbackupOn) {
      $('.backup_selection #backup').val(true);
      var backupTotal = price.GetBackupPrice();
      $('.backup-price #backup-price')[0].innerHTML = backupTotal;
    }
  };
  function backup_period(e) {
    $(".backup_period .small_radio_select").removeClass("selected");
    $(e).addClass("selected");
    var backupperiod = (e).attr('id').substr(7);
    $('#BackupPeriodVAL').val(backupperiod);
  };

  //получить объек описывающий параметры слайдеров и типовых конфигураций для 
  function getCurrentPerformanceObject() {
    var dcTechTitle = $("#DcLocation_Val").val();
    var dcLocation = initparams.SPb_SDN;

    for (var key in initparams) {
      if (initparams[key] !== null && dcTechTitle === initparams[key].DCLocationTechTitle) {
        dcLocation = initparams[key];
        break;
      }
    }

    var performanceObject = dcLocation.perflow;
    if ($('#performance_chosen .selected').attr('id') == 'perfhigh') {
      performanceObject = dcLocation.perfhigh;
    };
    if ($('div.order-config #HDDType').val() == 'SSD' || dcTechTitle === 'MinskBy') {
      performanceObject.HDD = performanceObject.HDD_SSD;
    } else {
      performanceObject.HDD = performanceObject.HDD_SAS;
    }
    return performanceObject;
  }

  //инициализация слейдеров
  function InitSliders(isFirst) {
    var performanceObject = getCurrentPerformanceObject(),
      cpuScaleArray = performanceObject.CPU.scale.split(' '),
      ramScaleArray = performanceObject.RAM.scale.split(' ');

    //расчитываем значение по умолчанию, если первая инициализаци тогда ставим стартовые, если не первая, тогда запоминаем что выбрал пользователь. 
    var cpu_start_value = cpuScaleArray.indexOf(cpu_init_value) + 1;
    var ram_start_value = ramScaleArray.indexOf(ram_init_value) + 1;
    var hdd_start_value = hdd_init_value;

    if (typeof isFirst === 'boolean' && !isFirst) {
      cpu_start_value = window.util.checkValueRanges($('#cpu-slider').slider("value"), cpuScaleArray.length);
      ram_start_value = window.util.checkValueRanges($('#ram-slider').slider("value"), ramScaleArray.length);
      hdd_start_value = window.util.checkValueRanges($("#HDD").val(), performanceObject.HDD.max_value, hdd_init_value);
    }

    $('#cpu-slider').slider({
      value: cpu_start_value,
      min: 0,
      max: cpuScaleArray.length,
      step: parseInt(performanceObject.CPU.step),
      slide: function (event, ui) {
        var min = $(this).slider('option', 'min');

        if (ui.value < min + 1) {
          $('#cpu-slider').slider('value', parseInt(cpuScaleArray[min]));
          $("#CPU").val(parseInt(cpuScaleArray[min]));
          $('#cpu').val(parseInt(cpuScaleArray[min]));
          edit_server();
          price.Calculate();
          return false;
        }
        if (ui.value == cpuScaleArray.length && $('#performance_chosen .selected').attr('id') == 'perflow') {
          var tooltips = $('#cpu_tooltip').tooltip({
            content: function () {
              return $(this).prop('title');
            },
            position: {
              my: "left top",
              at: "right+500 bottom+20",
              using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                  .addClass("arrow-box")
                  .addClass(feedback.vertical)
                  .addClass(feedback.horizontal)
                  .appendTo(this);
              }
            }
          });
          tooltips.tooltip("open");
          setTimeout(function () { tooltips.tooltip("close"); }, 2500);
        }
        else {
          var tooltips = $('#cpu_tooltip').tooltip({});
          tooltips.tooltip("close");
        }

        $('#cpu').val(cpuScaleArray[ui.value - 1]);
        $('#CPU').val(cpuScaleArray[ui.value - 1]);

        edit_server();
        price.Calculate();
        onChangeGHzCPU(ui.value);
      }
    });
    $('#ram-slider').slider({
      value: ram_start_value,
      min: 0,
      max: ramScaleArray.length,
      step: parseInt(performanceObject.RAM.step),
      slide: function (event, ui) {
        var ram_low_lin = parseInt(ramScaleArray[0]);
        if ((image_family == 'Linux' || image_family == 'Bsd') && ui.value < 1) {
          $('#ram-slider').slider('value', 1);
          $("#RAM").val(ram_low_lin);
          $('#ram').val(ram_low_lin);
          $('#ram').next('small').html(' ' + resources.Mb);
          edit_server();
          price.Calculate();
          return false;
        }

        var ram_low_win = parseInt(ramScaleArray[2]);
        if (image_family == 'Windows' && ui.value < 3) {
          $('#ram-slider').slider('value', 3);
          $("#RAM").val(ram_low_win * 1024);
          $('#ram').val(ram_low_win);
          $('#ram').next('small').html(' ' + resources.Gb);
          edit_server();
          price.Calculate();
          return false;
        }

        if (ui.value == ramScaleArray.length && $('#performance_chosen .selected').attr('id') == 'perflow') {
          var tooltips = $('#ram_tooltip').tooltip({
            content: function () {
              return $(this).prop('title');
            },
            position: {
              my: "left top",
              at: "right+500 bottom+20",
              using: function (position, feedback) {
                $(this).css(position);
                $("<div>")
                  .addClass("arrow-box")
                  .addClass(feedback.vertical)
                  .addClass(feedback.horizontal)
                  .appendTo(this);
              }
            }
          });
          tooltips.tooltip("open");
          setTimeout(function () { tooltips.tooltip("close"); }, 2000);
        }
        else {
          var tooltips = $('#ram_tooltip').tooltip({});
          tooltips.tooltip("close");
        }

        $('#ram').val(ramScaleArray[ui.value - 1]);

        if (ui.value < 3) {
          $('#RAM').val(ramScaleArray[ui.value - 1]);
          $('#ram').next('small').html(' ' + resources.Mb);
        }
        else {
          $('#RAM').val(ramScaleArray[ui.value - 1] * 1024);
          $('#ram').next('small').html(' ' + resources.Gb);
        }

        edit_server();
        price.Calculate();
      }
    });
    $('#hdd-slider').slider({
      value: hdd_start_value, min: 0, max: performanceObject.HDD.max_value, step: performanceObject.HDD.step,
      slide: function (event, ui) {
        if (ui.value < hdd_init_value) {
          $('#hdd-slider').slider('value', parseInt(hdd_init_value));
          $("#HDD").val(hdd_init_value);
          $('#hdd').val(hdd_init_value);

          edit_server();
          price.Calculate();
          return false;
        }
        if ((image_family == 'Linux' || image_family == 'Bsd') && ui.value < 10) {
          $('#hdd-slider').slider('value', 10);
          $("#HDD").val(performanceObject.HDD.min_value);
          $('#hdd').val(performanceObject.HDD.min_value);

          edit_server();
          price.Calculate();
          return false;
        }
        if (image_family == 'Windows' && ui.value < 40) {
          $('#hdd-slider').slider('value', 40);
          $("#HDD").val(40);
          $('#hdd').val(40);

          edit_server();
          price.Calculate();
          return false;
        }

        $('#hdd').val(ui.value);
        $('#HDD').val(ui.value);

        edit_server();
        price.Calculate();
        snapshot_cost();
        backup_cost();
      }
    });

    $('#cpu').val(cpuScaleArray[cpu_start_value - 1]);
    $('#CPU').val(cpuScaleArray[cpu_start_value - 1]);

    $('#ram').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1]);
    if (ram_start_value < 3) {
      $('#RAM').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1]);
      $('#ram').next('small').html(' ' + resources.Mb);
    }
    else {
      $('#RAM').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1] * 1024);
      $('#ram').next('small').html(' ' + resources.Gb);
    }

    $("#HDD").val(hdd_start_value);
    $('#hdd').val(hdd_start_value);
    edit_server();
    price.Calculate();
  }

  /*
   * Checks current cpu-slider position and performs some actions, e.g. shows corresponding herdware description
   */
  function onChangeGHzCPU(slidervalue) {
    var performanceCPU = getCurrentPerformanceObject().CPU,
      cpuScaleArray = performanceCPU.scale.split(' '),
      cpuBreakpoint = (typeof performanceCPU.breakpoint === 'undefined') ? "8" : performanceCPU.breakpoint,
      indexOfBreak = cpuScaleArray.indexOf(cpuBreakpoint) + 1,
      hardwareDescription = '';

    var cpuindexOf12 = parseInt(cpuScaleArray.indexOf("12")) + 1;

    if ($('#performance_chosen .selected').attr('id') == 'perfhigh') {
      if (slidervalue > indexOfBreak && cpuindexOf12 != 0) {
        hardwareDescription = getHardwareInfo('hi-extra');
      }
      if (slidervalue <= indexOfBreak && cpuindexOf12 != 0) {
        hardwareDescription = getHardwareInfo('hi-base');
      }
    }
    else {
      hardwareDescription = getHardwareInfo();
    }

    $('#cpu-freak').text(hardwareDescription);
    $('#ram-type').text((hardwareDescription.indexOf('B200-M4') > -1 || hardwareDescription.indexOf('B480-M5') > -1) ? 'DDR4' : 'DDR3');

    visibleTimeMessage(slidervalue, $('#Performance').val());
  }

  /*
   * Returns hardware information, corresponding to concrete Data Center. Returns info for low pool by default.
   * @string type - type of performance: hi-base, hi-extra (determines in the onChangeGHzCPU function)
   */
  function getHardwareInfo(type) {
    var dcTitles = Object.keys(initparams);
    var dcTechTitle = $("#DcLocation_Val").val();

    var dcHardwareInfo = {};
    dcTitles.forEach(function (elem, index, dcTitles) {
      if (initparams[elem] && initparams[elem].DCLocationTechTitle == dcTechTitle) {
        dcHardwareInfo = initparams[elem].HardwareDescription;
        return;
      }
    });

    switch (type) {
      case 'hi-base':
        return (dcHardwareInfo.HighBasePoolDescription);
      case 'hi-extra':
        return (dcHardwareInfo.HighExtraPoolDescription);
      default:
        return (dcHardwareInfo.LowPoolDescription);
    }
  }

  function visibleTimeMessage(current_cpu, current_performance) {
    var performanceCPU = getCurrentPerformanceObject().CPU,
      cpuScaleArray = performanceCPU.scale.split(' '),
      cpuBreakpoint = (typeof performanceCPU.breakpoint === 'undefined') ? "8" : performanceCPU.breakpoint,
      indexOfBreak = cpuScaleArray.indexOf(cpuBreakpoint) + 1;

    var cpuindexOf12 = parseInt(cpuScaleArray.indexOf("12")) + 1;
    if (cpuindexOf12 == 0) { cpuindexOf12 = 100; }

    var cpu_init_cur_tmp = 1; if (cpu_init_value > indexOfBreak && cpu_init_value <= cpuindexOf12) { cpu_init_cur_tmp = 2 }; if (cpu_init_value > cpuindexOf12) { cpu_init_cur_tmp = 3 };
    var cpu_cur_tmp = 1; if (current_cpu > indexOfBreak && current_cpu <= cpuindexOf12) { cpu_cur_tmp = 2 }; if (current_cpu > cpuindexOf12) { cpu_cur_tmp = 3 };

    var diskType_current = $('#HDDType').val();

    if (cpu_init_cur_tmp != cpu_cur_tmp || perf_init_value != current_performance || diskType_current != siDB.diskType) {
      $('#edit_time_message').removeClass('hidden');
    }
    else {
      $('#edit_time_message').addClass('hidden');
    }
  }

  //изменение типа диска (SAS - SSD)
  function ChangeDiskType(e) {
    $('div.order-config #HDDType').val($(e).val());

    initPrices();
    InitSliders(false);
    price.Calculate();
  }

  var metricsElem = $('#getMetricsLink'),
    getMetricsUrl = metricsElem.data('url');
  if (metricsElem) {
    sendAjaxGetRequest(getMetricsUrl, function (data) {
      metricsElem.text(data['LinkText']).attr('href', data['HostLink'])
    })
  }

};

