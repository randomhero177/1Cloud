var objCalcTariff = {};
var tariffSelect = 'tariff-os-select',
  tModal = $('#tariff-order-modal'),
  tModalBody = tModal.find('.modal-body'),
  tModalForm = $('#tariff-order-form'),
  tModalMail = '#tariff-order-email',
  tModalBtn = '#tariff-order-btn';

objCalcTariff.Model = function () {
  var model = this;

  model.Tariff = Object.create(null);
  model.Tariff.Family = 'Windows';
  model.Tariff.Config = ["Low", "Medium", "High"];

  model.Tariff.Low = Object.create(null);
  model.Tariff.Low.CPU;
  model.Tariff.Low.RAM;
  model.Tariff.Low.Storage;
  model.Tariff.Low.Price;

  model.Tariff.Medium = Object.create(null);
  model.Tariff.Medium.CPU;
  model.Tariff.Medium.RAM;
  model.Tariff.Medium.Storage;
  model.Tariff.Medium.Price;

  model.Tariff.High = Object.create(null);
  model.Tariff.High.CPU;
  model.Tariff.High.RAM;
  model.Tariff.High.Storage;
  model.Tariff.High.Price;

  model.Order = Object.create(null);
  model.Order.OS;
  model.Order.CPU;
  model.Order.RAM;
  model.Order.Perf;
  model.Order.Storage;

  this.SetDefaultModel = function () {
    var dcNameSelect = $('#dc-select');

    model.DcTitle = config.DefaultValues.Dc;
    model.Performance = config.DefaultValues.Performance;
    model.HDDType = config.DefaultValues.TypeStorage;
    model.Order.isHighPerformance = config.DefaultValues.Performance === 'perfhigh';
    model.DcName = config.DefaultValues.Dc;
     
    if (dcNameSelect.length > 0) {
      var option = dcNameSelect.find('option[value="' + config.DefaultValues.Dc + '"]');

      if (option) {
        model.DcName = option.text().split(',')[0].trim();
      }
    }
  };

  this.GetCurrentModel = function () {
    var selectedOSTariff = $('#' + tariffSelect + ' option:selected');
    if ($(selectedOSTariff).attr('data-os') != null) {
      model.Tariff.Family = $(selectedOSTariff).attr('data-os');
    }
    if (window['filterFamily'] != undefined && filterFamily != null) {
      model.Tariff.Family = filterFamily;
    }
    
    model.Order.OS = $(selectedOSTariff).val();
    
    var dcPerf = initparams[getDefaultDcTitle(model.DcTitle)][model.Performance];
    var preferenceObj = dcPerf.Preferences['PreferenceOn' + model.Tariff.Family];
    var tmpmodel = model.Tariff;

    model.Tariff.Config.forEach(function (item, i, arr) {
      var cpuScale = dcPerf.CPU.scale.split(' ');
      var ramScale = dcPerf.RAM.scale.split(' ');

      tmpmodel[item].CPU = cpuScale[preferenceObj['cpu_' + item.toLowerCase()] - 1];
      tmpmodel[item].RAM = ramScale[preferenceObj['ram_' + item.toLowerCase()] - 1];
      tmpmodel[item].Storage = preferenceObj['hdd_' + item.toLowerCase()];
    });
    model.Tariff = tmpmodel;
  };
  this.GetParamsFromTariff = function (perf) {
    model.Order.Perf = perf;
  };
  this.GetOrderObject = function (modelT) {
    modelT.GetCurrentModel(modelT);

    var postRam = parseInt(modelT.Tariff[modelT.Order.Perf].RAM);

    var postObj = Object.create(null);
    postObj.Email = $(tModalMail).val();
    postObj.Name = 'Server';
    postObj.CPU = modelT.Tariff[modelT.Order.Perf].CPU;
    postObj.HDD = modelT.Tariff[modelT.Order.Perf].Storage;
    postObj.ImageID = modelT.Order.OS;
    postObj.HDDType = modelT.HDDType;
    postObj.isHighPerformance = modelT.Order.isHighPerformance;
    postObj.DCLocation = modelT.DcTitle;
    postObj.isBackupActive = false;
    postObj.ISPSoftID = 0;

    if (postRam > 500 && postRam < 1024) {
      postObj.RAM = postRam;
    } else {
      postObj.RAM = postRam * 1024;
    }

    return postObj;
  }
}

objCalcTariff.View = function (modelT) {

  this.GenerateImageTariffSelect = function (model) {
    var imagesSelectTariff = document.getElementById(tariffSelect);
    for (var i = 0; i < imageList.length; i++) {
      addOption(imagesSelectTariff, imageList[i].ID, imageList[i].DisplayName, {
        'os': imageList[i].Family
      });
    }
    initializeBS('#' + tariffSelect);
    this.initializeBSTariffs();
  }
  var checkTariffsBonus = function () {
    if (checkBonus('#' + tariffSelect)) {
      $('#tariff-bonus').text('Лицензия ' + licenseWindows);
    } else {
      $('#tariff-bonus').text('');
    }
  }

  this.initializeBSTariffs = function () {  // Tariffs Bootstrap Selectpicker
    if (window.innerWidth > 767) {
      $('#' + tariffSelect).on('changed.bs.select', function (e) {
        checkTariffsBonus();
      }).on('loaded.bs.select', function (e) {
        checkTariffsBonus();
      });
    } else {
      checkTariffsBonus();
      $('#' + tariffSelect).on('change', function () {
        checkTariffsBonus();
      });
    }
  }

  this.SetDefaultBlockParams = function (modelT) {
    var dcTitleElems = $('.tariff__table-dctitle'),
      hddTypeElems = $('.tariff__table-hddtype');

    dcTitleElems.each(function () {
      $(this).text(modelT.DcName);
    });
    hddTypeElems.each(function () {
      $(this).text(modelT.HDDType);
    });
  };

  this.UpdateTariffBlock = function (modelT) {
    modelT.Tariff.Config.forEach(function (item, i, arr) {
      $('#tariff-' + item.toLowerCase() + '-price').html(numberWithThousands(modelT.Tariff[item].Price));
      $('#tariff-' + item.toLowerCase() + '-cpu').text(modelT.Tariff[item].CPU);
      $('#tariff-' + item.toLowerCase() + '-ram').text(modelT.Tariff[item].RAM);
      if (modelT.Tariff[item].RAM < 500) {
        $('#tariff-' + item.toLowerCase() + '-ram-unit').text(' ' + resources.Gb);
      } else {
        $('#tariff-' + item.toLowerCase() + '-ram-unit').text(' ' + resources.Mb);
      }
      $('#tariff-' + item.toLowerCase() + '-storage').text(modelT.Tariff[item].Storage);
      $('#tariff-' + item.toLowerCase() + '-storage-unit').text(' ' + resources.Gb);
    });
  }
}

objCalcTariff.Controller = function (modelT, viewT) {
  this.constructor = function () {
    modelT.SetDefaultModel();
    modelT.GetCurrentModel(modelT);
    modelT = Calculate(modelT);

    viewT.SetDefaultBlockParams(modelT);
    viewT.UpdateTariffBlock(modelT);
  }

  // Choose another OS in tariff
  $('#' + tariffSelect).on('change', function () {
    modelT.GetCurrentModel(modelT);
    modelT = Calculate(modelT);
    viewT.UpdateTariffBlock(modelT);
  });

  var Calculate = function (modelT) {
    var dcPerf = initparams[getDefaultDcTitle(modelT.DcTitle)][modelT.Performance];
    var typeStorageString = 'HDD_' + modelT.HDDType;

    modelT.Tariff.Config.forEach(function (item, i, arr) {
      var cpu_price = dcPerf.CPU.price * modelT.Tariff[item].CPU;
      var ram = modelT.Tariff[item].RAM;
      if (modelT.Tariff[item].RAM < 500) {
        ram = modelT.Tariff[item].RAM * 1024;
      }
      var ram_price = (dcPerf.RAM.price / 4) * (ram / 256);
      var hdd_price = dcPerf[typeStorageString].price * modelT.Tariff[item].Storage;
      modelT.Tariff[item].Price = Math.round((cpu_price + ram_price + hdd_price) * 1) / 1;
    });
    return modelT;
  }

  /* =============== TARIFF MODAL =============== */
  // fill modal with tariff data
  $('.tariff__item').on('click', '.tariff__btn', function (e) {
    e.preventDefault();

    // model part
    var perf;
    var perfId = $(this).closest('.tariff__item').attr('id');
    switch (perfId) {
      case 'tariff-low':
        perf = 'Low';
        break;
      case 'tariff-medium':
        perf = 'Medium';
        break;
      default:
        perf = 'High';
    }
    modelT.GetParamsFromTariff(perf);

    // view part
    var tObj = $(this).parentsUntil('.tariff__item').parent(),
      tId = tObj.find('.tariff__title').attr('data-tariff-id'),
      tTitle = tObj.find('.tariff__title').html(),
      tPrice = tObj.find('.tariff__price').html();

    tModal.find('#tariff-id').val(tId);
    tModal.find('#tariffModalLabel').html(tTitle);
    tModal.find('.tariff__price').html(tPrice);

    tModal.modal('show');
  });

  var tariffValidator = tModalForm.validate({
    onkeyup: false,
    onfocusin: function (element) {
      errorMessageRemove($(element));
    },
    rules: {
      'tariff-order-email': {
        required: true,
        email: true
      }
    },
    errorPlacement: function (error, element) {
      error.insertAfter(element);
    },
    highlight: function (element) {
      $(element).parent().addClass('error');
    },
    errorElement: 'span',
    errorClass: errorClass
  });

  tModalForm.submit(function (e) {
    $(tModalBtn).click();
    return false;
  });

  // validate tariff order form
  tModalForm.on('click', tModalBtn, function (e) {
    e.preventDefault();
    if (tariffValidator.form() && !checkFormElemErrorsExist(tModalMail)) {
      modelT.GetCurrentModel(modelT);
      var resObjT = modelT.GetOrderObject(modelT);
      if (urlRegisterServer.indexOf('tag=') !== -1) {
        urlRegisterServer += '-Popular';
      }
      reachCounterGoal('vdsconfigorder', 'submit');
      sendPostRequest('#tariff-order-form', urlRegisterServer, resObjT, function () {
        window.location.href = successURL;
      });
    }
  });
}
/* =============== RESIZE FUNCTIONS =============== */
$(window).resize(function () {
  initializeBS('#' + tariffSelect);
});

function getDefaultDcTitle(techTitle) {
  var title = '';
  for (var item in initparams) {
    if (initparams[item].DCLocationTechTitle === techTitle) {
      title = item;
      break;
    }
  }
  return (title === '') ? spbDcTitle : title; // default value in 1cloud is Spb sdn
}