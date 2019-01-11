var formId = '#create-server-form';

var dcTitles = Object.keys(initparams);

var ispSelect = $('#ISPSoftID'),
  networkSelect = $('#NetworkId'),
  confirmCheckbox = $('#confirm');
var curPerformance = $('[name="Performance"]:checked').val();

var serverCountInput = $('#server-count-input'),
  serverBaseNamePrev = $('#server-name-first').val();

var sshBlock = $('.server__ssh'),
  isSshBlockPresented = (sshBlock.length > 0);

var selectIDs = {};
selectIDs.dc = 'DcLocationId';
selectIDs.backup = 'BackupPeriod';
selectIDs.hdd = 'HDDType';

var spbDcTitle = 'SPb_SDN',
  mskDcTitle = 'MSk_DS',
  kzDcTitle = 'Kz_Ah';

const MAX_SERVER_COUNT = Number($('#server-count-input').attr('max')),
  MIN_SERVER_COUNT = Number($('#server-count-input').attr('min'));

$(function () {
  var image_family = 'Linux';
  var image_hdd_size = 0;

  firstInit();
  refreshInput();
  $('.radio-wrap input').click(function () {
    $('.radio-wrap').removeClass('checked');
    $(this).parent().parent().parent().addClass('checked');
    if ($(this).attr('id') == "free") { $("#Support_Val").val(false); } else { $("#Support_Val").val(true); }
  });

  $('.server__config').click(function () {
    refreshConfiguration(this);
  });

  //скрывать tooltip о необходимости перевода на оборудование высокой производительности
  /*
      $('.slider-wrap .slider').mouseleave(function () {
          HideTooltipOnSlider(this);
      });
  */
  // Manage servers' names, based on the name of first
  $('#server-name-first')
    .on('keyup change', function () {
      if ($(this).val() === '') {
        errorMessageAdd($(this), resources.Required);
      }
      changeServerNames(serverBaseNamePrev, $(this).val());
      serverBaseNamePrev = $(this).val();
    });

  // Manage servers' count
  $('.server__count-control').click(function (e) {
    e.preventDefault();
    if ($(this).attr('id') === 'server-count-increase') {
      increaseServersCount();
    } else {
      decreaseServersCount();
    }
  })

  // Refresh form information, when clicking OS icon
  $('.server__images-title').click(function (e) {
    refreshImageInfo(null, $(this).closest('.server__images-item'));
  });

  // Close chosen dropdown, when leaving OS block
  $('.server__images-item').on('mouseleave', function () {
    $(this).find('.server__images-select').trigger('chosen:close');
  });

  //смена типовой конфигурации 
  function refreshConfiguration(e) {
    $(".server__config").removeClass("selected");
    $(e).addClass("selected");

    var performanceObject = getCurrentPerformanceObject();

    var preferenceObject = performanceObject.Preferences.PreferenceOnLinux;
    if (image_family == 'Windows') {
      preferenceObject = performanceObject.Preferences.PreferenceOnWindows;
    }
    var cpu = 0; var ram = 0; var hdd = 0;

    var pref = $(e).attr('id');
    switch (pref) {
      case 'high':
        cpu = preferenceObject.cpu_high; ram = preferenceObject.ram_high; hdd = preferenceObject.hdd_high;
        break;
      case 'medium':
        cpu = preferenceObject.cpu_medium; ram = preferenceObject.ram_medium; hdd = preferenceObject.hdd_medium;
        break;
      case 'low':
        cpu = preferenceObject.cpu_low; ram = preferenceObject.ram_low; hdd = preferenceObject.hdd_low;
        break;
      default:
        cpu = performanceObject.CPU.start_value; ram = performanceObject.RAM.start_value; hdd = performanceObject.HDD.start_value;
        break;
    }
    if (hdd < image_hdd_size) {
      hdd = image_hdd_size;
    }

    $('#cpu-slider').slider('value', cpu);
    $('#ram-slider').slider('value', ram);
    $('#hdd-slider').slider('value', hdd);

    refreshInput();
    onChangeGHzCPU(Number($('#cpu-slider').slider('value')));
  };

  //Инициализация слайдеров и скрытых ключей
  function firstInit() {

    if (disk_type_init_value && $('#' + selectIDs.hdd).find('option[value="' + disk_type_init_value + '"]').length > 0) {
      $('#' + selectIDs.hdd).val(disk_type_init_value);
    }

    initSelects();
    initRadios();
    initPrices();
    $('.slider').slider({ range: "min" });
    initSliders();
    refreshDcInfo($('#' + selectIDs.dc).val());

    if (image_init_value != "") {
      refreshImageInfo(image_init_value, $('.server__images-select option[value="' + image_init_value + '"]').closest('.server__images-item'));
    }
    refreshBackupInfo($('#BackupPeriod').val());

    $(formId).submit(function (e) {
      e.preventDefault();
      reachCounterGoal('tryingcreateserv', 'try');

      if (confirmCheckbox.length > 0 && !confirmCheckbox.prop('checked')) {
        errorMessageAdd(confirmCheckbox, resources.ConfirmRequired);
      } else {
        if ($(formId).valid()) {
          if (!checkHtmlInForm()) {
            reachCounterGoal('creatingserv', 'submit');
            sendAjaxRequest(formId, $(formId).attr('action'), getPostObject());
          }
        } else {
          var validator = $(formId).validate();
          $('.order-config').scrollTo();
        }
      }
    });
  };

  function checkHtmlInForm() {
    var hasHtml = false;
    $('.server__name-list input[type="text"]').each(function () {
      if (window.util.checkIfHtml($(this).val())) {
        errorMessageAdd($(this), resources.HtmlTagNotAvaliable);
        hasHtml = true
      }
    });
    return hasHtml
  }

  //если параметры слайдеров совпадают с конфигурацией Low она устанавливается автоматически
  function change2LowConfiguration() {
    var performanceObject = getCurrentPerformanceObject();
    performanceObject.CPU.scaleArray = performanceObject.CPU.scale.split(' ');
    performanceObject.RAM.scaleArray = performanceObject.RAM.scale.split(' ');

    if ((image_family == 'Linux' || image_family == 'Bsd') && $("#RAM").val() == performanceObject.RAM.scaleArray[0] && $("#CPU").val() == performanceObject.CPU.scaleArray[0] && $("#HDD_Val").val() == performanceObject.HDD.min_value) {
      $(".server__config").removeClass("selected");
      $('#low').addClass("selected");
    }
    if (image_family == 'Windows' && $("#RAM").val() == performanceObject.RAM.scaleArray[2] && $("#CPU").val() == performanceObject.CPU.scaleArray[0] && $("#HDD").val() == 40) {
      $(".server__config").removeClass("selected");
      $('#low').addClass("selected");
    }
  }

  //Установка текущих значений глобальных параметров
  function setGlobalparam() {
    price.current_cpu_val = $('#cpu').val();
    price.current_ram_val = $('#ram').val();
    price.current_hdd_val = $('#hdd').val();
    price.current_NetworkBandwidth_val = $('#speed').val();

    var selectedBackupPeriod = $('[name="BackupPeriod"]').find('option:selected').val();
    if (selectedBackupPeriod !== '') {
      price.current_isbackupOn = true;
    } else {
      price.current_isbackupOn = false;
    }
    price.current_backup_period = selectedBackupPeriod;
  };

  //получить объек описывающий параметры слайдеров и типовых конфигураций для 
  function getCurrentPerformanceObject() {
    var dcId = $("#DcLocationId").val(),
      dcDB = $.grep(dcLocationList, function (e1) { return e1.ID == dcId; })[0],
      hddElem = $('#HDDType');

    var dcLocation = {};
    dcTitles.forEach(function (elem, index, arr) {
      if (initparams[elem] && initparams[elem].DCLocationTechTitle == dcDB.TechTitle) {
        dcLocation = initparams[elem];
      }
    });
    // create and manage performance object
    var performanceObject;
    if (curPerformance == 'perfhigh') {
      if (dcDB.IsEnableHighPool) {
        performanceObject = dcLocation.perfhigh;
      } else {
        curPerformance == 'perflow';
        performanceObject = dcLocation.perflow;
      }
    } else {
      if (dcDB.IsEnableLowPool) {
        performanceObject = dcLocation.perflow;
      } else {
        curPerformance == 'perfhigh';
        performanceObject = dcLocation.perfhigh;
      }
    }

    if (hddElem.val() === 'SSD' || dcDB.TechTitle === 'MinskBy') { // Extra hack for DC in Minsk - only SSD provided
      performanceObject.HDD = performanceObject.HDD_SSD;
    }
    else {
      performanceObject.HDD = performanceObject.HDD_SAS;
    }

    return performanceObject;
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

    if (curPerformance == 'perfhigh') {
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
  }

  /*
   * Returns hardware information, corresponding to concrete Data Center. Returns info for low pool by default.
   * @string type - type of performance: hi-base, hi-extra (determines in the onChangeGHzCPU function)
   */
  function getHardwareInfo(type) {
    var dcDB = $.grep(dcLocationList, function (e1) { return e1.ID == $("#DcLocationId").val(); }),
      dcTechTitle = dcDB[0]['TechTitle'];

    var dcHardwareInfo = {};
    dcTitles.forEach(function (elem, index, dcTitles) {
      if (initparams[elem] && initparams[elem].DCLocationTechTitle == dcTechTitle) {
        dcHardwareInfo = initparams[elem].HardwareDescription;
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

  //инициализация селектов
  function initSelects() {
    $('.server__images-select').each(function () {
      if ($(this).find('option').length <= 1) {
        $(this).closest('.server__images-item').addClass('hidden');
      } else {
        $(this).find('option:first').attr('selected', 'selected').prop('disabled', true);
        $(this)
          .chosen({ disable_search_threshold: 10, width: '100%' })
          .change(function (e, params) {
            refreshImageInfo(params.selected, $(this).closest('.server__images-item'));
          });

        if (window.innerWidth < 1200) {
          $(this).closest('.server__images-item').find('.chosen-results').on('touchend', function (e) {
            $(e.target).trigger('click');
          });
        }
      }
    });
    $('#DcLocationId').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
      refreshDcInfo(params.selected);
    });
    $('#BackupPeriod').chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
      refreshBackupInfo(params.selected);
    });
    $("#HDDType").chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
      changeDiskType(params.selected);
    });

    if (networkSelect.length) {
      refreshNetworkSelect($('#DcLocationId').val());
      networkSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
        refreshNetworkInfo(params.selected);
      });
    }
  }

  //инициализация слайдеров
  function initSliders(isFirst, isPerfChanged) {
    var performanceObject = getCurrentPerformanceObject(),
      cpuScaleArray = performanceObject.CPU.scale.split(' '),
      ramScaleArray = performanceObject.RAM.scale.split(' ');
    var dcTitle = $('#' + selectIDs.dc).find('option:selected').attr('data-techtitle');

    //расчитываем значение по умолчанию, если первая инициализаци тогда ставим стартовые, если не первая, тогда запоминаем что выбрал пользователь. 
    var cpu_start_value = cpuScaleArray.indexOf(cpu_init_value) + 1;
    var ram_start_value = ramScaleArray.indexOf(ram_init_value) + 1;
    var hdd_start_value = hdd_init_value;
    var bandwidth_start_value = NetworkBandwidth_init_value;
    var bandwidth = performanceObject.NetworkBandwidth;

    if (typeof isFirst === 'boolean' && !isFirst) {
      cpu_start_value = window.util.checkValueRanges($('#cpu-slider').slider("value"), cpuScaleArray.length);
      ram_start_value = window.util.checkValueRanges($('#ram-slider').slider("value"), ramScaleArray.length);
      hdd_start_value = window.util.checkValueRanges($('#hdd-slider').slider("value"), performanceObject.HDD.max_value, image_hdd_size);
      bandwidth_start_value = window.util.checkValueRanges($('#speed-slider').slider("value"), bandwidth.max_value, bandwidth.min_value);
    }

    if (isPerfChanged && dcTitle == 'AhKz') {
      cpu_start_value = (curPerformance == 'perfhigh') ? 1 : cpuScaleArray.length;
      ram_start_value = (curPerformance == 'perfhigh') ? 1 : ramScaleArray.length;
    }
    $('#cpu-slider').slider({
      value: cpu_start_value, min: 0, max: cpuScaleArray.length, step: parseInt(performanceObject.CPU.step),
      slide: function (event, ui) {
        var min = $(this).slider('option', 'min');
        $(".server__config").removeClass("selected");

        if (ui.value < min + 1) {  // HACK FOR VISUAL NON-ZERO SLIDER POSITION
          $('#cpu-slider').slider('value', min + 1);
          $("#CPU").val(parseInt(cpuScaleArray[min]));
          $('#cpu').val(parseInt(cpuScaleArray[min]));
          change2LowConfiguration();
          price.Calculate();
          return false;
        }
        if (ui.value == cpuScaleArray.length && curPerformance == 'perflow') {
          var tooltips = $('#cpu_tooltip').tooltip({
            content: function () {
              return $(this).prop('title');
            },
            position: {
              my: "right top",
              at: "right bottom+20",
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
          setTimeout(function () { tooltips.tooltip("close"); }, 4000);
        }
        else {
          var tooltips = $('#cpu_tooltip').tooltip({});
          tooltips.tooltip("close");
        }

        $('#cpu').val(cpuScaleArray[ui.value - 1]);
        $('#CPU').val(cpuScaleArray[ui.value - 1]);

        change2LowConfiguration();
        setGlobalparam();
        onChangeGHzCPU(ui.value);
        price.Calculate();
      }
    });
    $('#ram-slider').slider({
      value: ram_start_value, min: 0, max: ramScaleArray.length, step: parseInt(performanceObject.RAM.step),
      slide: function (event, ui) {
        $(".server__config").removeClass("selected");

        var ram_low_lin = parseInt(ramScaleArray[0]);
        if ((image_family == 'Linux' || image_family == 'Bsd') && ui.value < 1) {
          $('#ram-slider').slider('value', 1);
          $("#RAM").val(ram_low_lin);
          $('#ram').val(ram_low_lin);
          $('#ram-measure').html(resources.Mb);
          setRamMeasurmentKz();
          change2LowConfiguration();
          setGlobalparam();
          price.Calculate();
          return false;
        }

        var ram_low_win = parseInt(ramScaleArray[2]);
        if (image_family == 'Windows' && ui.value < 3) {
          $('#ram-slider').slider('value', 3);
          $("#RAM").val(ram_low_win * 1024);
          $('#ram').val(ram_low_win);
          $('#ram-measure').html(resources.Gb);
          change2LowConfiguration();
          setGlobalparam();
          price.Calculate();
          return false;
        }
        if (ui.value == ramScaleArray.length && curPerformance == 'perflow') {
          var tooltips = $('#ram_tooltip').tooltip({
            content: function () {
              return $(this).prop('title');
            },
            position: {
              my: "right top",
              at: "right bottom+20",
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
          setTimeout(function () { tooltips.tooltip("close"); }, 4000);
        }
        else {
          var tooltips = $('#ram_tooltip').tooltip({});
          tooltips.tooltip("close");
        }

        $('#ram').val(ramScaleArray[ui.value - 1]);

        if (ui.value < 3) {
          $('#RAM').val(ramScaleArray[ui.value - 1]);
          $('#ram-measure').html(resources.Mb);
        }
        else {
          $('#RAM').val(ramScaleArray[ui.value - 1] * 1024);
          $('#ram-measure').html(resources.Gb);
        }
        setRamMeasurmentKz();
        change2LowConfiguration();
        setGlobalparam();
        price.Calculate();
      }
    });

    $('#hdd-slider').slider({
      value: hdd_start_value, min: 0, max: performanceObject.HDD.max_value, step: performanceObject.HDD.step,
      slide: function (event, ui) {
        $(".server__config").removeClass("selected");

        //Если выбранное пользователем значение меньше. чем значение из образа
        if (ui.value < image_hdd_size) {
          $('#hdd-slider').slider('value', image_hdd_size);
          $("#HDD").val(image_hdd_size);
          $('#hdd').val(image_hdd_size);

          change2LowConfiguration();
          setGlobalparam();
          price.Calculate();
          return false;
        }
        if ((image_family == 'Linux' || image_family == 'Bsd') && ui.value < 10) {
          $('#hdd-slider').slider('value', 10);
          $("#HDD").val(performanceObject.HDD.min_value);
          $('#hdd').val(performanceObject.HDD.min_value);

          change2LowConfiguration();
          setGlobalparam();
          price.Calculate();
          return false;
        }
        if (image_family == 'Windows' && ui.value < 40) {
          $('#hdd-slider').slider('value', 40);
          $("#HDD").val(40);
          $('#hdd').val(40);

          change2LowConfiguration();
          setGlobalparam();
          price.Calculate();
          return false;
        }

        $('#hdd').val(ui.value);
        $('#HDD').val(ui.value);

        change2LowConfiguration();
        setGlobalparam();
        price.Calculate();
      }
    });
    $('#speed-slider').slider({
      value: bandwidth_start_value, min: 0, max: 100, step: 10,

      slide: function (event, ui) {
        if (ui.value < bandwidth.min_value) {
          $('#speed-slider').slider('value', bandwidth.min_value);
          $('#speed').val(bandwidth.min_value);
          return false;
        }

        $('#speed').val(ui.value);
        $('#NetworkBandwidth').val(ui.value);
        if (ui.value == bandwidth.max_value) {
          var tooltips = $('#speed_tooltip').tooltip({
            content: function () {
              return $(this).prop('title');
            },
            position: {
              my: "right top",
              at: "right bottom+20",
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
          setTimeout(function () { tooltips.tooltip("close"); }, 4000);
        }
        else {
          var tooltips = $('#speed_tooltip').tooltip({});
          tooltips.tooltip("close");
        }
        setGlobalparam();
        price.Calculate();
      }
    });

    $('#cpu').val(cpuScaleArray[cpu_start_value - 1]);
    $('#CPU').val(cpuScaleArray[cpu_start_value - 1]);

    $('#ram').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1]);
    if (ram_start_value < 3) {
      $('#RAM').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1]);
      $('#ram-measure').html(resources.Mb);
    }
    else {
      $('#RAM').val(performanceObject.RAM.scale.split(' ')[ram_start_value - 1] * 1024);
      $('#ram-measure').html(resources.Gb);
    }
    setRamMeasurmentKz();
    $('#HDD').val(hdd_start_value);
    $('#hdd').val(hdd_start_value);

    $('#speed').val(bandwidth_start_value);
    $('#NetworkBandwidth').val(bandwidth_start_value);

    setGlobalparam();
    onChangeGHzCPU(Number($('#cpu-slider').slider('value')));
    price.Calculate();
  }

  //Пересчет стоимости после изменения параметров слайдеров
  function refreshInput() {
    var performanceObject = getCurrentPerformanceObject();
    var cpu = $('#cpu-slider').slider("value");
    var cpu_scale = performanceObject.CPU.scale.split(' ');
    var cpu_value = cpu_scale[cpu - 1];
    $("#CPU").val(cpu_value);
    $('#cpu').val(cpu_value);

    var ramindex = parseInt($("#ram-slider").slider("value"));
    var ram_scale = performanceObject.RAM.scale.split(' ');
    var ram_value = ram_scale[ramindex - 1];
    $('#ram').val(ram_value);
    if (ramindex < 3) {
      $('#RAM').val(ram_value);
      $('#ram-measure').html(resources.Mb);
    }
    else {
      $('#RAM').val(ram_value * 1024);
      $('#ram-measure').html(resources.Gb);
    }
    setRamMeasurmentKz();
    var hdd = $("#hdd-slider").slider("value");
    $("#HDD").val(hdd);
    $('#hdd').val(hdd);

    setGlobalparam();
    price.Calculate();
  }

  //инициализация радио баттонов
  function initRadios() {
    $('[name="Performance"]').change(function () {
      refreshPerfInfo($('[name="Performance"]:checked').val(), true);
    });

    if (isSshBlockPresented) {
      $('[name="AuthType"]').change(function (e) {
        if ($(this).val() == 2) {
          $('#ssh-server').removeClass('hidden');
          initSshViewServer();
        } else {
          $('#ssh-server').addClass('hidden');
          clearSshMultiSelect();
        }
      });
    }
  }

  //инициализация стоимостей
  function initPrices() {
    var performanceObject = getCurrentPerformanceObject();
    var dcTitle = $('#' + selectIDs.dc).find('option:selected').attr('data-techtitle');

    price.cpu_price = parseFloat(performanceObject.CPU.price);
    price.hdd_sas_price = (performanceObject.HDD_SAS) ? parseFloat(performanceObject.HDD_SAS.price) : 0;
    price.hdd_ssd_price = (performanceObject.HDD_SSD) ? parseFloat(performanceObject.HDD_SSD.price) : 0;
    price.ram_price = parseFloat(performanceObject.RAM.price);
    price.net_bandwidth_price = parseFloat(performanceObject.NetworkBandwidth.price);
    price.backup_price = (!GetBackupAvailability(dcTitle)) ? 0 : parseFloat(performanceObject.Backup.price);
    CheckBackupSelectPrice();
  }

  /*
   * Corrects form values due to selected Image. By default, shows info for selected image in model.
   * @number imageId - id of a chosen Image. Can be null, if user clicked on family pic on a view
   * @obj imageItem - jQuery object of a image family block, corresponding to selected Image
   */
  function refreshImageInfo(imageId, imageItem) {
    // Visual part - selecting image
    var imageSelects = $('.server__images-select'),
      defaultImageOption = imageItem.find('.server__images-select option:last-child'),
      selectedOption;

    $('.server__images-item').removeClass('server__images-item--active');
    imageItem.addClass('server__images-item--active');

    imageSelects.each(function () {
      $(this).find('option:first').prop('selected', true);
    });

    if (imageId === null) {
      imageId = defaultImageOption.attr('value');
      selectedOption = defaultImageOption;
    } else {
      selectedOption = imageItem.find('.server__images-select option[value="' + imageId + '"]');
    }

    $("#ImageID").val(imageId);
    selectedOption.prop('selected', true);
    imageSelects.trigger('chosen:updated');

    // Visual part - access type block
    if (isSshBlockPresented) {
      var sshPartFull = $('#server-ssh-full'),
        sshPartChooseOnly = $('#server-ssh-simple');

      if (selectedOption.attr('data-image-type') === 'GoldServer' && selectedOption.attr('data-addsshkey') === 'true') {
        sshBlock.removeClass('hidden');
        sshPartFull.removeClass('hidden');
        sshPartChooseOnly.addClass('hidden');

        $('#ssh-server-keys').trigger('chosen:updated');

      } else if (selectedOption.attr('data-image-type') === 'Client' && selectedOption.attr('data-addsshkey') === 'true') {
        sshBlock.removeClass('hidden');
        sshPartFull.addClass('hidden');
        clearSshMultiSelect();

        sshPartChooseOnly.removeClass('hidden');
        sshPartChooseOnly.find('[id*=sshkeys-]').addClass('hidden');
        sshPartChooseOnly.find('#sshkeys-' + imageId).removeClass('hidden');
      } else {
        sshBlock.addClass('hidden');
        clearSshMultiSelect();
      }
    }

    // Logical part

    image_hdd_size = selectedOption.attr('data-hdd-size');

    var imageDB = $.grep(imageList, function (e1) { return e1.ID == imageId; })[0];
    image_family = imageDB.Family;

    if (image_family == 'Windows') {
      $('#win_lic_component').removeClass('hidden');
      $('#win_sysprep_component').removeClass('hidden');
    } else {
      $('#win_lic_component').addClass('hidden');
      $('#win_sysprep_component').addClass('hidden');
    }

    if (imageDB != null && (imageDB.IsIspBusinessEnabled || imageDB.IsIspLiteEnabled)) {
      setEnabledIspSoft(imageDB);

      $('#isp-component').removeClass('hidden');
    }
    else {
      $('#isp-component').addClass('hidden');
    }

    // refresh DC select after choosing an image
    if (imageDB.DCLocationID != null) {
      $('#DcLocationId option').prop('disabled', true);
      $('#DcLocationId option[value="' + imageDB.DCLocationID + '"]').prop({ 'disabled': false, 'selected': true });;
    }
    else {
      $('#DcLocationId option').prop('disabled', false);
    }
    $('#DcLocationId').trigger('chosen:updated');
    refreshDcInfo($('#DcLocationId').val());

    // refresh sliders select after choosing an image
    if ($('#RAM').val() < 1024 && image_family == 'Windows') {
      $('#ram-slider').slider('value', 3);
      $("#RAM").val("1024");
    }
    if ($('#HDD').val() < 40 && image_family == 'Windows') {
      $('#hdd-slider').slider('value', 40);
      $("#HDD").val("40");
    }
    if (parseInt($('#HDD').val()) < parseInt(image_hdd_size)) {
      $('#hdd-slider').slider('value', image_hdd_size);
      $("#HDD").val(image_hdd_size);
    }

    $(".server__config").removeClass("selected");
    refreshInput();
    setGlobalparam();
    price.Calculate();

    function setEnabledIspSoft(imageObj) {
      checkIspDisabled(5, !imageObj.IsIspLiteEnabled);
      checkIspDisabled(6, !imageObj.IsIspBusinessEnabled);
      
      if (ispSelect.next('.chosen-container').length == 0) {
        ispSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
          refreshIspInfo(params.selected);
        });
      } else {
        ispSelect.trigger('chosen:updated');
      }
      refreshIspInfo(ispSelect.val());

      function checkIspDisabled(ispId, isDisabled) {
        var option = ispSelect.find('option[value="' + ispId + '"]');
        if (isDisabled) {
          ispSelect.find('option:first').prop('selected', true);
        }
        option.prop('disabled', isDisabled);
      }
    }
  }

  /*
   * Corrects form values due to selected Isp version. By default, shows info for selected Isp version in model.
   * @number ispId - id of a chosen Isp version
   */
  function refreshIspInfo(ispId) {
    if (ispSelect.find('option[value="' + ispId + '"]').prop('disabled'))
      return;

    var softDB = $.grep(softList, function (e1) { return e1.ID == ispId; });
    if (ispId == "0") {
      price.current_image_license = 0;
    }
    else {
      price.current_image_license = softDB[0].Price.Amount;
    }

    setGlobalparam();
    price.Calculate();
  }

  /*
   * @number dcId - id of a chosen DC
   */
  function refreshDcInfo(dcId) {
    if (typeof dcId === 'undefined') return;

    var perflowOption = $('[name="Performance"][value="perflow"]'),
      perfhighOption = $('[name="Performance"][value="perfhigh"]')
    dcDB = $.grep(dcLocationList, function (e1) { return e1.ID == dcId; })[0];

    perflowOption.prop('disabled', !dcDB.IsEnableLowPool);
    perfhighOption.prop('disabled', !dcDB.IsEnableHighPool);

    //если текущее значение не валидно

    if (perflowOption.prop('checked') && !dcDB.IsEnableLowPool) {
      perflowOption.prop('checked', false);
      perfhighOption.prop('checked', true);
    }
    if (perfhighOption.prop('checked') && !dcDB.IsEnableHighPool) {
      perflowOption.prop('checked', true);
      perfhighOption.prop('checked', false);
    }
    // Hack for DC Minsk for SSD
    refreshDiskInfo();

    refreshPerfInfo($('[name="Performance"]:checked').val());

    if (networkSelect.length) {
      refreshNetworkSelect(dcId);
      networkSelect.trigger('chosen:updated');
    }
  }

  /*
   * Corrects form values due to selected Performance. By default, shows info for selected Performance in model.
   * @string perf - name of a chosen performance
   */
  function refreshPerfInfo(perf, isPerfChanged) {
    curPerformance = perf;
    onChangeGHzCPU(Number($('#cpu-slider').slider('value')));

    initPrices();
    setGlobalparam();
    initSliders(false, isPerfChanged);
    price.Calculate();
  }

  /*
   * Corrects form values due to selected Backup Period. By default, shows info for selected BP in model.
   * @number backupPeriod - name of a chosen BP
   */
  function refreshBackupInfo(backupPeriod) {
    var isBackupOn = (backupPeriod === '') ? false : true;
    $('[name="isBackupActive"]').val(isBackupOn);

    if (isBackupOn) {
      price.current_cpu_val = $('#cpu').val();
      price.current_ram_val = $('#ram').val();
      price.current_hdd_val = $('#hdd').val();
    } else {

      setGlobalparam();
    }
    CheckBackupSelectPrice();
    price.Calculate();
  }

  function CheckBackupSelectPrice() {
    var dcTitle = $('#' + selectIDs.dc).find('option:selected').attr('data-techtitle'),
      isBackupEnabled = GetBackupAvailability(dcTitle),
      backupVal = $('#' + selectIDs.backup).val();

    if (isBackupEnabled && backupVal !== '') {
      $('[name="isBackupActive"]').val(true);
      price.current_backup_period = backupVal;
    } else {
      $('#' + selectIDs.backup).find('option:first-child').prop('selected', true);
      price.current_backup_period = 0,
        $('[name="isBackupActive"]').val(false);
    }
    price.current_isbackupOn = $('[name="isBackupActive"]').val();
  }

  /*
   * Manage information about network due to its type
   * @string id - id of a selected network
   */
  function refreshNetworkInfo(id) {
    var option = $('option[value="' + id + '"]'),
      type = option.data('type'),
      link = option.data('link');
    var netGlobal = $('#server-network-pub-global'),
      netClient = $('#server-network-client');

    if (typeof type === 'undefined') {
      netGlobal.removeClass('hidden');
      netClient.addClass('hidden');
    } else {
      $('#network-link').attr('href', link);
      netGlobal.addClass('hidden');
      netClient.removeClass('hidden');
    }
  }

  /*
   * Adds disabled attribute to options in network select, depending on selected Dc
   * @string dcId - id of a selected dc
   */
  function refreshNetworkSelect(dcId) {
    var options = networkSelect.find('option[value!="0"]'),
      dcLocation = dcLocationList.filter(function (el) { return el.ID == dcId });

    for (var i = 0; i < options.length; i++) {
      options[i].disabled = (options[i].dataset.dc !== dcLocation[0].TechTitle);
    }

    if (networkSelect.find('option:selected').data('dc') !== dcLocation[0].TechTitle) {
      networkSelect.find('option[value=0]').prop('selected', true);
    }
  }

  /**
   * Function for Minsk diskType hack
   */
  function refreshDiskInfo() {
    var options = $('#' + selectIDs.hdd + ' option');
    var isMinsk = $('#' + selectIDs.dc + ' option:selected').data('techtitle') == 'MinskBy';

    options.each(function () {
      $(this).prop('disabled', isMinsk && $(this).val() !== 'SSD');

      if (isMinsk && $(this).val() === 'SSD') {
        $(this).prop('selected', true);
      }
    });

    $('#' + selectIDs.hdd).trigger('chosen:updated');
  }

  /*
   * Corrects form values due to selected diskType. By default, shows info for selected SAS.
   * @string diskType - name of a chosen diskType
   */
  function changeDiskType(diskType) {
    initPrices();
    initSliders(false);
    price.Calculate();
  }

  /*
   * Corrects server name with current base server name
   * @string prevName - pname of a chosen diskType
   */
  function changeServerNames(prevName, curName) {
    $('.server__name-item').each(function () {
      var input = $(this).find('input[type="text"]');
      if (input.val().indexOf(prevName + '-') > -1 && input.attr('id') !== 'server-name-first') {
        input.val(input.val().replace(prevName + '-', curName + '-'));
      }
    });
  }
  /*
   * Increases amount of servers to be created. Maximum - constant MAX_SERVER_COUNT
   */
  function increaseServersCount() {
    var curServerCount = Number(serverCountInput.val()),
      newServerCount = curServerCount + 1;

    if (newServerCount <= MAX_SERVER_COUNT) {
      serverCountInput.val(newServerCount);
      drawNewServerCountItem(newServerCount);

      $('#server-count-decrease').prop('disabled', false);
      if (newServerCount === MAX_SERVER_COUNT) {
        $('#server-count-increase').prop('disabled', true);
        $('#server-count-maximum').removeClass('hidden');
      }
    }
    price.Calculate();
  }

  /*
   * Creates new server name input with the name, indexed with i
   * @number i - index of server name
   */
  function drawNewServerCountItem(i) {
    var serverNameItem = $('<div class="server__name-item" />');
    serverNameItem
      .append($('<input />', {
        class: 'form-control server__AdditionalNames',
        'type': 'text',
        'name': 'AdditionalNames[' + (Number(i) - 2) + ']',
        'value': serverBaseNamePrev + '-' + i
      }));
    $('.server__name-list').append(serverNameItem);
  }

  /*
   * Decreases amount of servers to be created. Minimum - constant MIN_SERVER_COUNT
   */
  function decreaseServersCount() {
    var curServerCount = Number(serverCountInput.val()),
      newServerCount = curServerCount - 1;

    $('#server-count-maximum').addClass('hidden');

    if (newServerCount >= MIN_SERVER_COUNT) {
      $('.server__name-list .server__name-item:last-child').remove();
      serverCountInput.val(newServerCount);

      $('#server-count-increase').prop('disabled', false);
      if (newServerCount === MIN_SERVER_COUNT) {
        $('#server-count-decrease').prop('disabled', true);
      }
    }

    price.Calculate();
  }

  // Choose another DC
  $('#' + selectIDs.dc).on('change', function () {
    SetBackupSelectVisibility();
  });
  $('#' + selectIDs.backup).on('change', function () {
    CheckBackupSelectPrice();
  });

  /*
   * Returns isEnableBackup value from concrete DC in dcLocationList
   */
  function GetBackupAvailability(dcTitle) {
    return dcLocationList.filter(function (el) {
      return el.TechTitle === dcTitle;
    })[0].IsEnableBackup;
  };

  function SetBackupSelectVisibility() {
    var dcTitle = $('#' + selectIDs.dc).find('option:selected').attr('data-techtitle');
    if (!GetBackupAvailability(dcTitle)) {
      $('#backup').addClass('hidden');
    } else {
      $('#backup').removeClass('hidden');
    }
    $('#BackupPeriod').trigger('chosen:updated');
  };

  function setRamMeasurmentKz() {
    var dcTitle = $('#' + selectIDs.dc).find('option:selected').attr('data-techtitle');
    if (dcTitle == 'AhKz' && curPerformance == 'perfhigh') {
      $('#ram-measure').text(resources.Gb);
    }
  };

  function getPostObject() {
    postObj = {};
    postObj.ImageID = $('[name="ImageID"]').val();
    postObj.DcLocationId = $('[name="DcLocationId"]').val();
    postObj.ISPSoftID = $('[name="ISPSoftID"]').val();
    postObj.Performance = $('[name="Performance"]:checked').val();
    postObj.BackupPeriod = $('[name="BackupPeriod"]').val();
    postObj.isBackupActive = $('[name="isBackupActive"]').val();
    postObj.CPU = $('[name="CPU"]').val();
    postObj.RAM = $('[name="RAM"]').val();
    postObj.HDDType = $('[name="HDDType"]').val();
    postObj.HDD = $('[name="HDD"]').val();
    postObj.Name = $('[name="Name"]').val();
    postObj.AdditionalNames = [];

    if (image_family === 'Windows') {
      postObj.IsNeedSysprep = $('[name="IsNeedSysprep"]').prop('checked');
    }

    if ($('.server__AdditionalNames').length > 0) {
      $('.server__AdditionalNames').each(function () {
        postObj.AdditionalNames.push($(this).val());
      });
    }
    if (isSshBlockPresented) {
      if ($('#ssh-server').is(':visible')) {
        postObj.SshKeys = $('[name="SshKeys"]').val();
      }
    }

    postObj.NetworkBandwidth = $('[name="NetworkBandwidth"]').val();
    if (networkSelect.length && networkSelect.val() != 0) {
      postObj.NetworkId = networkSelect.val();
    }
    return postObj;
  }

});
