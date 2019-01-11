var winLicenseBlock = document.getElementById('win_lic-component'),
  winLicenseTextBlock = document.getElementById('win_lic'),
  ispComponentBlock = document.getElementById('isp-component'),
  cpuDigitVisibleObj = $('#cpu-slider-value .calculator__slider-digit'),
  ramDigitVisibleObj = $('#ram-slider-value .calculator__slider-digit'),
  lang = 'ru',
  ispDefaultText = 'Не устанавливать',
  defaultOSFamily = 'Linux',
  linuxFamily = 'Linux',
  bsdFamily = 'Bsd';

var selectIDs = {},
  calcSelectList = [];

selectIDs.os = 'os-select';
selectIDs.dc = 'dc-select';
selectIDs.isp = 'isp-select';
selectIDs.storage = 'storage-select';
selectIDs.backup = 'backup-select';

var calcForm = $('#order-form'),
  calcElemEmail = '#customer-email',
  calcElemOs = '#' + selectIDs.os,
  calcErrorRequiredFieldsMessage = 'Для того, чтобы создать сервер, Вам необходимо заполнить поля: ',

  calcNewOsId = calcElemOs.substr(1, calcElemOs.length - 1) + '-in-modal',
  calcNewEmailId = calcElemEmail.substr(1, calcElemEmail.length - 1) + '-in-modal',
  calcModalBody = $('#calc-order-modal .modal-body');

var objCalc = {};

objCalc.Model = function () {
  this.Order = Object.create(null);
  this.Order.DC;
  this.Order.OS;
  this.Order.IsAvailableISP;
  this.Order.Isp;
  this.Order.Performance;
  this.Order.Cpu;
  this.Order.Ram;
  this.Order.TypeStorage;
  this.Order.Storage;
  this.Order.Family;
  this.Order.performanceObject = Object.create(null);
  this.Order.ChooseDcLocation;
  this.Order.Email;

  this.Order.Backup = Object.create(null);

  this.Order.Price = Object.create(null);
  this.Order.Price.Cpu;
  this.Order.Price.Ram;
  this.Order.Price.Storage;
  this.Order.Price.Backup;
  this.Order.Price.Isp;

  this.Order.Cost = Object.create(null);
  this.Order.Cost.Hour;
  this.Order.Cost.Day;
  this.Order.Cost.Month;
  this.Order.Cost.Year;

  this.SetDefaultModel = function () {
    var order = this.Order;
    var typeStorageString = 'HDD_' + defaultValues.TypeStorage;

    order.DC = defaultValues.Dc;
    order.OS = defaultValues.ImageId;
    order.IsAvailableISP = false;
    order.Isp = 0;
    order.Performance = defaultValues.Performance;
    order.Cpu = defaultValues.Cpu || initparams[defaultDcTitle][order.Performance].CPU.start_value;
    order.Ram = defaultValues.Ram || initparams[defaultDcTitle][order.Performance].RAM.start_value;
    order.TypeStorage = defaultValues.TypeStorage;
    order.Storage = defaultValues.Hdd || initparams[defaultDcTitle][order.Performance][typeStorageString].start_value;
    order.Family = defaultOSFamily;
    order.ChooseDcLocation = defaultValues.IsChooseDcLocation;

    order.Backup.Period = defaultValues.BackupPeriod;

    order.performanceObject = initparams[defaultDcTitle][order.Performance];
    order.performanceObject.HDD = order.performanceObject[typeStorageString];

    order.performanceObject = GetCurrentPerformanceObject(this);
    order.Price = GetCurrentPrices(this);
  }

  this.GetCurrentModel = function () {
    this.Order.DC = $('#' + selectIDs.dc).val();
    this.Order.OS = $('#' + selectIDs.os).val();

    if (this.Order.OS == '') {
      this.Order.IsAvailableISP = false;
    }
    else {
      var imageDB = $.grep(imageList, function (e1) { return e1.ID == parseInt(model.Order.OS); })[0];
      this.Order.IsAvailableISP = (imageDB != null && (imageDB.IsISPBusinessEnabled || imageDB.IsISPLiteEnabled));
    }

    this.Order.Performance = $('input[name="performance-input"]:checked').val();
    this.Order.Isp = ($('#' + selectIDs.isp).val()) ? $('#' + selectIDs.isp).val() : '0';
    this.Order.Cpu = $("#CPU_Val").val();
    this.Order.Ram = $("#RAM_Val").val();
    this.Order.TypeStorage = (this.Order.DC !== 'MinskBy') ? $('input[name="storage-type-input"]:checked').val() : 'SSD';
    this.Order.Storage = $('#' + selectIDs.storage).val();

    var selectedOS = $('#' + selectIDs.os + ' option:selected');
    this.Order.Family = ($(selectedOS).attr('data-os') !== null) ? $(selectedOS).attr('data-os') : defaultOSFamily;

    this.Order.IsEnableBackup = this.GetBackupAvailability(this.Order.DC);

    this.Order.Backup.Period = $('#' + selectIDs.backup).val();
    this.Order.Email = $('#customer-email').val();

    this.Order.performanceObject = GetCurrentPerformanceObject(this);
    this.Order.Price = GetCurrentPrices(this);
  };
  this.GetOrderObject = function (model) {
    model.GetCurrentModel(model);

    var postObj = Object.create(null);
    postObj.Email = model.Order.Email;
    postObj.Name = 'Server';
    postObj.CPU = model.Order.Cpu
    postObj.RAM = model.Order.Ram;
    postObj.HDD = model.Order.Storage;
    postObj.ImageID = model.Order.OS;
    postObj.HDDType = model.Order.TypeStorage;
    postObj.ISPSoftID = model.Order.Isp;

    postObj.isHighPerformance = model.Order.Performance === 'perfhigh';

    postObj.DCLocation = model.Order.DC;

    postObj.isBackupActive = model.Order.IsEnableBackup;
    if (postObj.isBackupActive && model.Order.Backup.Period != '0') {
      postObj.BackupPeriod = model.Order.Backup.Period;
    } else {
      postObj.isBackupActive = false;
    }

    return postObj;
  }

  this.GetBackupAvailability = function (dcTitle) {
    return dcLocationList.filter(function (el) {
      return el.TechTitle === dcTitle;
    })[0].IsEnableBackup;
  };

  //инициализируем текущие значения всех выбираемых значений модели
  var GetCurrentPerformanceObject = function (model) {
    var dcDB = $.grep(dcLocationList, function (e1) { return e1.TechTitle == model.Order.DC; })[0];
    var dcLocation;

    for (var d = 0; d < dcTitles.length; d++) {
      if (dcDB.TechTitle == initparams[dcTitles[d]].DCLocationTechTitle) {
        dcLocation = initparams[dcTitles[d]];
        break;
      }
    }
    if (typeof dcLocation === 'undefined') {
      dcLocation = initparams[defaultDcTitle];
    }

    // create and manage performance object
    var performanceObject;
    if (model.Order.Performance === 'perfhigh' && dcLocation.perfhigh !== null) {
      performanceObject = dcLocation.perfhigh;
    } else {
      performanceObject = dcLocation.perflow;
    }

    if (model.Order.TypeStorage === "SSD" || dcDB.TechTitle === 'MinskBy') {
      performanceObject.HDD = performanceObject.HDD_SSD;
    }
    else {
      performanceObject.HDD = performanceObject.HDD_SAS;
    }
    return performanceObject;
  }
  var GetCurrentPrices = function (model) {
    var price = {};
    price.Cpu = model.Order.performanceObject.CPU.price;
    price.Storage = model.Order.performanceObject.HDD.price;
    price.Ram = model.Order.performanceObject.RAM.price;
    price.Backup = model.Order.performanceObject.Backup.price;

    price.Isp = 0;
    var softDB = $.grep(softList, function (e1) { return e1.ID == model.Order.Isp; });
    if (model.Order.IsAvailableISP == true && softDB.length > 0) {
      price.Isp = softDB[0].Amount;
    }

    return price;
  }

}
objCalc.View = function (model) {
  this.VisibleFlag = false;
  this.counter = 0;

  this.constructor = function () {
    $('.calculator__toggle-block').hide();

    this.GenerateImageSelect(model);

    this.GenerateDCSelect(model);

    this.RefreshHDDRadio(model);
    this.GenerateHDDSelect(model, true);
    this.GenerateBackupSelect(model);

    this.SetPerformance($('#' + selectIDs.dc).val(), model);
    this.SetTypeStorage(model);

    this.InitSliders(model, true);

    model.GetCurrentModel(model);
    this.SetBackupSelectVisibility();
  }
  this.collapseAdditionalInfo = function (e, obj) {
    e.preventDefault();
    $(obj).toggleClass('active');
    toggleBlock = $(obj).attr('href');
    $(toggleBlock).slideToggle();
  };

  /*************************** PRICES ***************************/
  this.UpdateCostBlock = function (model) {
    $('#price-sum').attr('data-price-per-hour', model.Order.Cost.Hour);
    $('#price-sum').attr('data-price-per-day', (model.Order.Cost.Day.toString()).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
    $('#price-sum').attr('data-price-per-month', (model.Order.Cost.Month.toString()).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
    $('#price-sum-small').text((model.Order.Cost.Month.toString()).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
    this.ShowPricePer();
  }
  this.ShowPricePer = function () {
    var pricePer = $('input[name="price-per-input"]:checked').attr('id'),
      dataPer = 'data-' + pricePer;
    $('#price-sum').text($('#price-sum').attr(dataPer));
  }

  /*************************** SELECTS ***************************/
  this.GenerateImageSelect = function (model) {
    var imagesSelect = document.getElementById(selectIDs.os);
    for (var i = 0; i < imageList.length; i++) {
      addOption(imagesSelect, imageList[i].ID, imageList[i].DisplayName, {
        'os': imageList[i].Family,
        'hdd': imageList[i].Hdd
      });
    }
    for (var i = 0; i < imagesSelect.length; i++) {
      if (imagesSelect.options[i].value == model.Order.OS) {
        imagesSelect.options[i].selected = true;
        break;
      }
    }
    calcSelectList.push('#' + selectIDs.os);
    initializeBS('#' + selectIDs.os);
    this.initializeBSImages();
  }
  this.initializeBSImages = function () {  // Check Windows family in calculator to check/show license
    if (window.innerWidth > 767) {
      $('#' + selectIDs.os).on('changed.bs.select', this.checkWinLicense)
        .on('loaded.bs.select', this.checkWinLicense);
    } else {
      this.checkWinLicense();
      $('#' + selectIDs.os).on('change', this.checkWinLicense);
    }
  }

  this.checkWinLicense = function () {
    if (checkBonus('#' + selectIDs.os)) {
      if (winLicenseBlock.classList.contains('hidden')) {
        winLicenseTextBlock.innerHTML = licenseWindows;
        winLicenseBlock.classList.remove('hidden');
      }
    } else {
      winLicenseTextBlock.innerHTML = '';
      winLicenseBlock.classList.add('hidden');
    }
  }

  this.SelectChangeValue = function (selectID, val) {
    var curSelect = document.getElementById(selectID);
    for (var i = 0; i < curSelect.length; i++) {
      curSelect.options[i].selected = (curSelect.options[i].value == val);
    }
    if (window.innerWidth > 767) {
      $('#' + selectID).selectpicker('refresh');
    }
  }
  this.GenerateDCSelect = function (model) {
    var dcSelect = document.getElementById(selectIDs.dc);
    if (model.Order.ChooseDcLocation == true) {
      for (var i = 0; i < dcLocationList.length; i++) {
        addOption(dcSelect, dcLocationList[i].TechTitle, dcLocationList[i].Title);
      }
    } else {
      addOption(dcSelect, dcLocationList[model.Order.DC].ID, dcLocationList[model.Order.DC].Title);
    }

    for (var i = 0; i < dcSelect.length; i++) {
      if (dcSelect.options[i].value == model.Order.DC) {
        dcSelect.options[i].selected = true;
        break;
      }
    }
    calcSelectList.push('#' + selectIDs.dc);
    initializeBS('#' + selectIDs.dc);
  }
  this.GenerateHDDSelect = function (model, isFirst) {
    var selectedOsMinHdd = Number($('#' + selectIDs.os + ' option:selected').attr('data-hdd'));

    var hdd = model.Order.performanceObject.HDD,
      min = (selectedOsMinHdd > hdd.min_value) ? selectedOsMinHdd : hdd.min_value,
      chosenHDD = model.Order.Storage;

    $('#' + selectIDs.storage).find('option').remove();
    var hddSelect = document.getElementById(selectIDs.storage);

    for (var i = min; i <= hdd.max_value; i += hdd.step) {
      addOption(hddSelect, i, i + ' ' + resources.Gb);
    }
    for (var i = 0; i < hddSelect.length; i++) {
      if (hddSelect.options[i].value == chosenHDD) {
        hddSelect.options[i].selected = true;
        break;
      }
    }

    //если текущее значение не валидно
    if (parseInt(model.Order.Storage) > parseInt(hdd.max_value)) {
      view.SelectChangeValue(selectIDs.storage, hdd.max_value);
    }
    if (parseInt(model.Order.Storage) < parseInt(min)) {
      view.SelectChangeValue(selectIDs.storage, min);
    }

    if (isFirst) {
      calcSelectList.push('#' + selectIDs.storage);
      initializeBS('#' + selectIDs.storage);
    } else {
      if (window.innerWidth > 767) {
        $('#' + selectIDs.storage).selectpicker('refresh');
      }
    }

  }
  this.GenerateIspSelect = function (model) {
    var ispSelect = document.getElementById(selectIDs.isp);
    addOption(ispSelect, 0, ispDefaultText);

    for (var i = 0; i < softList.length; i++) {
      addOption(ispSelect, softList[i].ID, softList[i].Title);
    }

    calcSelectList.push('#' + selectIDs.isp);
    initializeBS('#' + selectIDs.isp);

    $(ispComponentBlock).removeClass('hidden');
  }
  this.RefreshIspSelect = function (model) {
    var osId = Number(model.Order.OS);
    var ispSelect = $('#' + selectIDs.isp);
    var image = $.grep(imageList, function (el) { return el.ID == osId; })[0];

    checkIspDisabled(5, !image.IsISPLiteEnabled);
    checkIspDisabled(6, !image.IsISPBusinessEnabled);

    ispComponentBlock.classList.remove('hidden');

    if (window.innerWidth > 767) {
      ispSelect.selectpicker('refresh');
    }

    function checkIspDisabled(ispId, isDisabled) {
      var option = ispSelect.find('option[value="' + ispId + '"]');

      if (Number(model.Order.Isp) === ispId) {
        $('#' + selectIDs.isp).find('option:first').prop('selected', true);
      }

      option[(isDisabled) ? 'hide' : 'show']();
    }
  }
  this.GenerateBackupSelect = function (model) {
    var backupSelect = document.getElementById(selectIDs.backup);
    var backupPeriodArr = model.Order.performanceObject.Backup.scale.split(' ');

    for (var i = 0; i < backupPeriodArr.length; i++) {
      if (parseInt(backupPeriodArr[i]) == 21) {
        addOption(backupSelect, parseInt(backupPeriodArr[i]), parseInt(backupPeriodArr[i]) + ' день');
      } else {
        addOption(backupSelect, parseInt(backupPeriodArr[i]), parseInt(backupPeriodArr[i]) + ' дней');
      }
    }
    calcSelectList.push('#' + selectIDs.backup);
    initializeBS('#' + selectIDs.backup);
  }

  this.RefreshImageDependencies = function (osId, model) {
    if (model.Order.IsAvailableISP == true) {
      if (findInArr(calcSelectList, '#' + selectIDs.isp) === -1) {
        this.GenerateIspSelect(model);
      }

      this.RefreshIspSelect(model);
    } else {
      ispComponentBlock.classList.add('hidden');
      $('#' + selectIDs.isp).find('option:first').prop('selected', true);
    }

    //Change min value for ram
    if (model.Order.Ram < 1024 && model.Order.Family == 'Windows') {
      this.SetRam(3);
      this.highlightElementText($('#ram-slider-value'));
    }

    //Change min value for hdd
    var selectedOption = $('#' + selectIDs.os + ' option:selected'),
      selectedHDD = Number(selectedOption.attr('data-hdd')),
      selectedOs = selectedOption.attr('data-os');

    if (model.Order.Storage < selectedHDD) {
      model.Order.Storage = selectedHDD;
      view.SelectChangeValue(selectIDs.storage, model.Order.Storage);

      if (window.innerWidth > 767) {
        view.highlightElementText($('[data-id="' + selectIDs.storage + '"]'));
      } else {
        view.highlightElementText($('#' + selectIDs.storage));
      }
    }
    this.GenerateHDDSelect(model);

    model.GetCurrentModel(model);
  }

  this.ResetBackupSelect = function () {
    $('#' + selectIDs.backup).find('option:first-child').prop('selected', true);
    if (window.innerWidth > 991) {
      $('#' + selectIDs.backup).selectpicker('refresh');
    }
  }
  this.SetBackupSelectVisibility = function () {
    if (model.Order.IsEnableBackup) {
      $('#backup').removeClass('hidden');
    } else {
      $('#backup').addClass('hidden');
    }
  }
  /*************************** SWITCHES ***************************/
  // Show Performance Text Due To Checked Performance Radio buttons
  var perfLow = 'performance-input-low',
    perfHigh = 'performance-input-high',
    perfLowInput = document.getElementById(perfLow),
    perfHighInput = document.getElementById(perfHigh);

  this.SetPerformanceTooltipText = function () {
    var dcTitles = Object.keys(initparams);
    var dcTechTitle = $('#' + selectIDs.dc).val();

    var dcHardwareInfo = {};
    dcTitles.forEach(function (elem, index, dcTitles) {
      if (initparams[elem].DCLocationTechTitle == dcTechTitle) {
        dcHardwareInfo = initparams[elem].HardwareDescription;
      }
    });

    var highPoolText = dcHardwareInfo.HighBasePoolDescription + ((dcHardwareInfo.HighBasePoolDescription === dcHardwareInfo.HighExtraPoolDescription) ? '' : ', ' + dcHardwareInfo.HighExtraPoolDescription);

    $(perfLowInput).next().find('.calculator__tooltip').attr('title', 'Базовый пул построен на базе серверов: ' + dcHardwareInfo.LowPoolDescription);
    $(perfHighInput).next().find('.calculator__tooltip').attr('title', 'Высокопроизводительный пул построен на базе серверов: ' + highPoolText);
  }
  this.GetTooltipText = function (obj) {
    var tText = '';
    if (obj.attr('title') != '') {
      tText = obj.attr('title');
    } else {
      tText = obj.attr('data-original-title');
    }
    if (tText) {
      return tText;
    }
  }
  this.ShowPerformanceInfo = function () {
    var perfText = $('#performance-solution-text');
    var perfTextSource = (perfLowInput.checked) ? perfLowInput : perfHighInput;

    perfText.html(this.GetTooltipText($(perfTextSource).next().find('.calculator__tooltip')));
  }
  this.SetPerformance = function (dcTitle, model) {
    var dcDB = $.grep(dcLocationList, function (e1) { return e1.TechTitle == dcTitle; })[0];

    if ($('[name="performance-input"]:checked').length === 0) {
      $('[name="performance-input"][value="' + model.Order.Performance + '"]').prop('checked', true);
    }

    $(perfLowInput).prop('disabled', !dcDB.IsEnableLowPool);
    $(perfHighInput).prop('disabled', !dcDB.IsEnableHighPool);

    //если текущее значение не валидно

    if ($(perfLowInput).prop('checked') && !dcDB.IsEnableLowPool) {
      $(perfLowInput).prop('checked', false);
      $(perfHighInput).prop('checked', true);
    }
    if ($(perfHighInput).prop('checked') && !dcDB.IsEnableHighPool) {
      $(perfLowInput).prop('checked', true);
      $(perfHighInput).prop('checked', false);
    }

    model.Order.Performance = $('[name="performance-input"]:checked').val();

    this.SetPerformanceTooltipText();
    this.ShowPerformanceInfo();
  }
  this.SetRam = function (value, isPerfChanged) {
    var ramScaleArray = model.Order.performanceObject.RAM.scale.split(' '),
      ramValue = ramScaleArray[value - 1],
      isKzHigh = (model.Order.DC == 'AhKz' && model.Order.Performance == 'perfhigh');

    if (isPerfChanged && model.Order.DC == 'AhKz') {
      var ramValue = (model.Order.Performance == 'perfhigh') ? parseInt(ramScaleArray[0]) : parseInt(ramScaleArray[ramScaleArray.length - 1]),
        value = (model.Order.Performance == 'perfhigh') ? 1 : ramScaleArray.length;
    };
    ramDigitVisibleObj.text(ramValue);

    if (value < 3 && model.Order.DC && !isKzHigh) {
      $('#RAM_Val').val(ramValue);
      ramDigitVisibleObj.next('#ram-measure').text(resources.Mb);
    }
    else {
      $('#RAM_Val').val(ramValue * 1024);
      ramDigitVisibleObj.next('#ram-measure').text(resources.Gb);
    };

    $('#ram-slider').slider('value', value);
  }
  this.SetTypeStorage = function (model) {
    $('input[name="storage-type-input"][value="' + model.Order.TypeStorage + '"]').prop('checked', true);
  }
  this.RefreshHDDRadio = function (model) {
    var radios = $('input[name="storage-type-input"]');
    var isMinsk = model.Order.DC === 'MinskBy';

    radios.each(function () {
      $(this).prop('disabled', isMinsk && $(this).val() !== 'SSD');
      if (isMinsk && $(this).val() === 'SSD') {
        $(this).prop('checked', true)
      }
    });
  }

  /*************************** SLIDERS ***************************/
  this.InitSliders = function (model, isFirst, isPerfChanged) {
    var cpuScaleArray = model.Order.performanceObject.CPU.scale.split(' '),
      ramScaleArray = model.Order.performanceObject.RAM.scale.split(' '),
      image_family = model.Order.Family;
    //расчитываем значение по умолчанию, если первая инициализаци тогда ставим стартовые, если не первая, тогда запоминаем что выбрал пользователь.
    var cpu_start_value = model.Order.Cpu,
      ram_start_value = parseInt(ramScaleArray.indexOf(model.Order.Ram.toString())) + 1;

    if (isFirst == false) {
      cpu_start_value = $("#cpu-slider").slider("value");
      if (cpu_start_value > parseInt(cpuScaleArray.length)) {
        cpu_start_value = parseInt(cpuScaleArray.length);
      }

      ram_start_value = $("#ram-slider").slider("value");
      if (ram_start_value > parseInt(ramScaleArray.length)) {
        ram_start_value = parseInt(ramScaleArray.length);
      }
    }

    $('#cpu-slider').slider({
      value: cpu_start_value,
      min: 0,
      max: parseInt(cpuScaleArray.length),
      range: 'min',
      step: parseInt(model.Order.performanceObject.CPU.step)
    });
    cpuDigitVisibleObj.text(cpuScaleArray[cpu_start_value - 1]);
    $('#CPU_Val').val(cpuScaleArray[cpu_start_value - 1]);
    model.Order.Cpu = cpuScaleArray[cpu_start_value - 1];

    // При смене производительности оборудования в AHost, Казахстан, Алматы задавать ближайшее значении к предыдущему

    if (isPerfChanged && model.Order.DC == 'AhKz') {
      var arrIndex = (model.Order.Performance == 'perfhigh') ? 0 : cpuScaleArray.length - 1,
        sliderIndex = (model.Order.Performance == 'perfhigh') ? 1 : cpuScaleArray.length;

      $('#cpu-slider').slider('value', sliderIndex);
      $("#CPU_Val").val(parseInt(cpuScaleArray[arrIndex]));
      $('#cpu-slider-value .calculator__slider-digit').text(parseInt(cpuScaleArray[arrIndex]));
      model.Order.Cpu = parseInt(cpuScaleArray[arrIndex]);
    };

    $('#ram-slider').slider({
      range: 'min',
      value: ram_start_value,
      min: 0,
      max: parseInt(ramScaleArray.length),
      step: parseInt(model.Order.performanceObject.RAM.step)
    });

    this.SetRam(ram_start_value, isPerfChanged);
    model.Order.Ram = $('#RAM_Val').val();

    $('#cpu-slider, #ram-slider').draggable();
  }

  this.SlideCpu = function (event, ui) {
    var cpuScaleArray = model.Order.performanceObject.CPU.scale.split(' ');


    if (ui.value == 0) {
      $('#cpu-slider').slider('value', 1);
      $("#CPU_Val").val(parseInt(cpuScaleArray[0]));
      $('#cpu-slider-value .calculator__slider-digit').text(parseInt(cpuScaleArray[0]));
      event.preventDefault();
      return false;
    }

    cpuDigitVisibleObj.text(cpuScaleArray[ui.value - 1]);
    $('#CPU_Val').val(cpuScaleArray[ui.value - 1]);


  };
  this.SlideRam = function (event, ui) {
    var ramScaleArray = model.Order.performanceObject.RAM.scale.split(' '),
      image_family = model.Order.Family,
      isKzHigh = (model.Order.DC == 'AhKz' && model.Order.Performance == 'perfhigh');

    var isWindows = image_family == 'Windows';
    var minIndex = (isWindows && !isKzHigh) ? 3 : 1;
    var ramValue = (ui.value < minIndex) ? parseInt(ramScaleArray[minIndex - 1]) : parseInt(ramScaleArray[ui.value - 1]);

    if (ui.value < minIndex) {
      $('#ram-slider').slider('value', minIndex);
      event.preventDefault();
    }

    $("#RAM_Val").val((ramValue < 512) ? ramValue * 1024 : ramValue);
    ramDigitVisibleObj.text(ramValue);
    ramDigitVisibleObj.next('#ram-measure').text((ramValue < 512) ? resources.Gb : resources.Mb);
  };

  this.highlightElementText = function (elemObj) {
    elemObj.css('color', '#f5b244');
    setTimeout(function () {
      elemObj.removeAttr('style');
    }, 2000);
  };
}
objCalc.Controller = function (model, view) {
  this.constructor = function () {
    Calculate(model);
  }

  //Раскрытие блока с дополнительной информацией
  $('.calculator__toggle-trigger').click(function (e) {
    view.collapseAdditionalInfo(e, this);
  });
  // Choose another OS
  $('#' + selectIDs.os).on('change', function () {
    model.GetCurrentModel(model);
    view.RefreshImageDependencies($(this).val(), model);
    Calculate(model);
  });

  // Choose another DC
  $('#' + selectIDs.dc).on('change', function () {
    var dcTitle = $(this).val();
    view.SetPerformance(dcTitle, model);

    if (!model.GetBackupAvailability(dcTitle)) {
      view.ResetBackupSelect();
    };

    model.GetCurrentModel();
    view.RefreshHDDRadio(model);
    view.GenerateHDDSelect(model);
    view.InitSliders(model, false);
    view.SetBackupSelectVisibility();

    Calculate(model);
  });
  // Choose ISP
  $('#' + selectIDs.isp).on('change', function () {
    model.GetCurrentModel(model);
    Calculate(model);
  });
  // Choose Backup
  $('#' + selectIDs.backup).on('change', function () {
    model.GetCurrentModel(model);
    Calculate(model);
  });
  // Choose Storage
  $('#' + selectIDs.storage).on('change', function () {
    model.GetCurrentModel(model);
    Calculate(model);
    view.SelectChangeValue(selectIDs.storage, $(this).val());
  });
  // Switch to another Performance
  $('input[name="performance-input"]').on('change', function (e) {
    if ($('#' + selectIDs.dc).val() == dcLocationList[1].TechTitle && model.Order.Performance == 'perfhigh') {
      $('#performance-input-high').prop('checked', true);
    }
    model.GetCurrentModel();
    view.GenerateHDDSelect(model);
    view.InitSliders(model, false, true);
    view.ShowPerformanceInfo();
    Calculate(model);
  });
  $('.switch__label').click(function () {
    if (!$(this).prev().prop('disabled')) {
      $(this).prev().prop('checked', true);

      model.GetCurrentModel();
      view.GenerateHDDSelect(model);
      view.InitSliders(model, false, $(this).data('change-pool'));

      Calculate(model);
      view.ShowPerformanceInfo();
    }
  });

  // Switch to another Type of Storage
  $('input[name="storage-type-input"]').on('change', function () {
    model.GetCurrentModel();
    view.GenerateHDDSelect(model);

    model.GetCurrentModel();
    Calculate(model);
  });

  // Switch to another Price Period
  $('input[name="price-per-input"]').on('change', view.ShowPricePer);

  // Init Sliders for CPU and RAM
  $('#cpu-slider').slider({
    slide: function (event, ui) {

      view.SlideCpu(event, ui);
      model.GetCurrentModel(model);
      Calculate(model);
    },
    stop: function (event, ui) {
      var cpuScaleArray = model.Order.performanceObject.CPU.scale.split(' ');
      if (cpuScaleArray[ui.value - 1] == parseInt(cpuScaleArray[cpuScaleArray.length - 1]) && model.Order.Performance == 'perflow') {
        $(ui.handle).tooltip({
          trigger: 'click',
          placement: 'top',
          html: true,
          title: '<span>Вы можете увеличить доступное <br>количество ядер процессора, <br>выбрав более высокую <br>производительность оборудования</span>'
        });
        $(ui.handle).tooltip('show');

        setTimeout(function () { $(ui.handle).tooltip('destroy'); }, 4000);
      }
    }
  });
  $('#ram-slider').slider({
    slide: function (event, ui) {
      view.SlideRam(event, ui);
      model.GetCurrentModel(model);
      Calculate(model);
    },
    stop: function (event, ui) {
      var ramScaleArray = model.Order.performanceObject.RAM.scale.split(' ');

      if (ramScaleArray[ui.value - 1] == parseInt(ramScaleArray[ramScaleArray.length - 1]) && model.Order.Performance == 'perflow') {
        $(ui.handle).tooltip({
          trigger: 'click',
          placement: 'top',
          html: true,
          title: '<span>Вы можете увеличить доступное <br>количество памяти, <br>выбрав более высокую <br>производительность оборудования</span>'
        });
        $(ui.handle).tooltip('show');

        setTimeout(function () { $(ui.handle).tooltip('destroy'); }, 4000);
      }
    }
  });

  // Calculate Function
  var Calculate = function (model) {
    var cpu_price = model.Order.Price.Cpu * model.Order.Cpu;
    var ram_price = (model.Order.Price.Ram / 4) * (model.Order.Ram / 256);
    var hdd_price = model.Order.Price.Storage * model.Order.Storage;
    var backup_price = 0;
    if (model.Order.Backup.Period != 0) {
      backup_price = (model.Order.Backup.Period / 7) * (model.Order.Price.Backup * model.Order.Storage);
    }
    var total = Math.round((cpu_price + ram_price + hdd_price + backup_price + model.Order.Price.Isp) * 1000) / 1000;

    model.Order.Cost.Hour = Math.round((total / (30 * 24)) * 10) / 10;
    model.Order.Cost.Day = Math.round(total / 30);
    model.Order.Cost.Month = Math.round(total);
    model.Order.Cost.Year = model.Order.Cost.Month * 12;

    view.UpdateCostBlock(model);
  }

  /* =============== SUBMIT FUNCTIONS =============== */
  var calcValidator = $('#order-form').validate({
    onkeyup: false,
    onfocusin: function (element) {
      errorMessageRemove($(element));
    },
    rules: {
      'os-select': 'required',
      'customer-email': {
        required: true,
        email: true
      }
    },
    messages: {
      'customer-email': {
        email: textEmailInvalid
      }
    },
    errorPlacement: function (error, element) {
      error.insertAfter(element);
      if (element.siblings('.btn').length > 0) {
        element.siblings('.btn').bind('click',
          function () {
            errorMessageRemove(element);
          });
      }
    },
    highlight: function (element) {
      $(element).parent().addClass('error');
    },
    errorElement: 'span',
    errorClass: errorClass
  });

  calcForm.submit(function (e) {
    e.preventDefault();
    $('#order-btn-big').click();
  });
  calcForm.on('click', '#order-btn-big', function (e) {
    e.preventDefault();
    if (calcValidator.form() && !checkFormElemErrorsExist(calcElemOs) && !checkFormElemErrorsExist(calcElemEmail)) {
      var resObj = model.GetOrderObject(model);
      reachCounterGoal('servordercalck', 'submit');
      sendPostRequest('#order-form', urlRegisterServer, resObj, function () {
        window.location.href = successURL;
      }, incorrectPost);
    } else {
      if (window.innerWidth < 992) {
        $('#order-btn-small').click();
      }
    }
  });

  /* =============== FIXED ORDER BLOCK FUNCTIONS =============== */

  calcForm.on('click', '#order-btn-small', function (e) {
    e.preventDefault();

    if (calcValidator.form() && !checkFormElemErrorsExist(calcElemOs) && !checkFormElemErrorsExist(calcElemEmail)) {
      $('#order-btn-big').click();
    } else {
      addInputToModal(calcElemEmail, calcModalBody);
      addSelectToModal(calcElemOs, calcModalBody);

      $('#calc-order-modal').modal();
    }

  });

  /* =============== SUBMIT MODAL FUNCTIONS =============== */
  $('#calc-order-modal').on('hidden.bs.modal', function () {
    $(calcElemOs).val($('#' + calcNewOsId).val());

    if (window.innerWidth > 767) {
      $(calcElemOs).selectpicker('val', $('#' + calcNewOsId).val());
    }
    $(calcElemEmail).val($('#' + calcNewEmailId).val());

    calcModalBody.empty();
    $(calcElemOs).valid();
    $(calcElemEmail).valid();
  });

  $('#calc-order-modal-btn').on('click', function () {
    if (checkFieldInModal($('#' + calcNewOsId), calcModalBody) && checkFieldInModal($('#' + calcNewEmailId), calcModalBody)) {
      $('#calc-order-modal').modal('hide');

      $('#order-btn-big').click();
    }
  });

  function incorrectPost(data) {
    if (data.Email != undefined && data.Email != '') {
      var c = $(calcElemEmail).val();
      $.validator.addMethod('emailerrors', function (value) {
        return value != c;
      }, data.Email);

      $(calcElemEmail).rules('remove', 'emailerrors');
      $(calcElemEmail).rules('add', {
        'emailerrors': true
      });
    }
  }

  /*************************** RESIZE FUNCTIONS ***************************/
  $(window).resize(function () {
    initializeBS(calcSelectList.toString());

    if (window.innerWidth < 992) {
      toggleOcStickyBlock('#calculator-price-small', calcForm);
    }
  });

}


/*************************** FIXED PRICE BLOCK ***************************/
if (window.innerWidth < 992) {
  toggleOcStickyBlock('#calculator-price-small', calcForm);
}

/*
 * Adds an option to concrete select. Supports addition of extra parameters, for example 'data-type'
 * @element selectElem - DOM node for select, to which we want to add an option
 * @string val - string or number to be inserted in attribute "value" of a new option
 * @string text - new option's text
 * @obj extraParams - object of extra parameters to be thrown to an option as data-attributes. Keys must contain only a name,  without "data" prefix
 */
function addOption(selectElem, val, text, extraParams) {
  var option = document.createElement("option");
  option.appendChild(document.createTextNode(text));
  option.setAttribute("value", val);

  if (typeof extraParams !== 'undefined' && Object.keys(extraParams).length > 0) {
    for (var key in extraParams) {
      option.setAttribute('data-' + key, extraParams[key]);
    }
  }
  selectElem.appendChild(option);
}
