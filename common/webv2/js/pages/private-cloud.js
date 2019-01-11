// different variables
var lang = 'ru',
  controlASC = $('<span/>', {
    'class': 'private__control private__control--asc'
  }),
  controlDESC = $('<span/>', {
    'class': 'private__control private__control--desc'
  });

// make variables for future workObject
var initparams = {},
  model = {},
  view = {},
  controller = {};

// max Values of number inputs
var maxValue = {};
maxValue.Cpu = 500;
maxValue.Ram = 2000;
maxValue.SATA = 40000;
maxValue.SSD = 20000;
maxValue.SAS = 20000;

// IDs of number inputs that we use
var inputIDs = {};
inputIDs.spbLowCpu = '#spb-low-cpu';
inputIDs.spbHighCpu = '#spb-high-cpu';
inputIDs.mskHighCpu = '#msk-high-cpu';
inputIDs.spbLowRam = '#spb-low-ram';
inputIDs.spbHighRam = '#spb-high-ram';
inputIDs.mskHighRam = '#msk-high-ram';
inputIDs.SATA = '#private-sata';
inputIDs.SAS = '#private-sas';
inputIDs.SSD = '#private-ssd';

// HACK FOR CORRELATION OF DC-NAME IN DB AND DC-NAME IN INITPARAMS
var spbDcTitle = 'SPb_SDN',
  spb2DcTitle = 'SPb2_SDN',
  mskDcTitle = 'MSk_DS',
  kzDcTitle = 'Kz_Ah';

var objCalc = {};

/*************************** MODEL CONFIG ***************************/
function initCalc(obj) {
  initparams = obj.Initparams;
  imageList = obj.ImageList;

  if (window['filterFamily'] != undefined && filterFamily != null) {
    imageList = $.grep(imageList, function (e1) { return e1.Family == filterFamily; });
  }
  softList = obj.IspSoftList;
  dcLocationList = obj.DcLocationList;
  defaultValues = obj.DefaultValues;

  getCalcObject();
}


objCalc.Model = function () {

  this.spbLow = Object.create(null);
  this.spbLow.Performance = initparams[spbDcTitle]['perflow'];
  this.spbLowCpu = this.spbLow.Performance.CPU;
  this.spbLowRam = this.spbLow.Performance.RAM;

  this.spbHigh = Object.create(null);
  this.spbHigh.Performance = initparams[spbDcTitle]['perfhigh'];
  this.spbHighCpu = this.spbHigh.Performance.CPU;
  this.spbHighRam = this.spbHigh.Performance.RAM;

  this.mskHigh = Object.create(null);
  this.mskHigh.Performance = initparams[mskDcTitle]['perfhigh'];
  this.mskHighCpu = this.mskHigh.Performance.CPU;
  this.mskHighRam = this.mskHigh.Performance.RAM;

  this.SATA = this.spbLow.Performance.HDD_SATA;
  this.SAS = this.spbLow.Performance.HDD_SAS;
  this.SSD = this.spbLow.Performance.HDD_SSD;

  this.Price = Object.create(null);
  this.Price.spbLowCpu;
  this.Price.spbLowRam;
  this.Price.spbHighCpu;
  this.Price.spbHighRam;
  this.Price.mskHighCpu;
  this.Price.mskHighRam;
  this.Price.SATA;
  this.Price.SAS;
  this.Price.SSD;

  this.Result = Object.create(null);
  this.Result.spbLowCpu;
  this.Result.spbLowRam;
  this.Result.spbHighCpu;
  this.Result.spbHighRam;
  this.Result.mskHighCpu;
  this.Result.mskHighRam;
  this.Result.SATA;
  this.Result.SAS;
  this.Result.SSD;

  this.Result.Cost;

  this.SetDefaultModel = function () {
    this.Result.spbLowCpu = this.spbLowCpu.start_value;
    this.Result.spbLowRam = this.spbLowRam.start_value;

    this.Result.spbHighCpu = this.spbHighCpu.start_value;
    this.Result.spbHighRam = this.spbHighRam.start_value;

    this.Result.mskHighCpu = this.mskHighCpu.start_value;
    this.Result.mskHighRam = this.mskHighRam.start_value;

    this.Result.SATA = this.SATA.start_value;
    this.Result.SAS = this.SAS.start_value;
    this.Result.SSD = this.SSD.start_value;

    this.Price = GetCurrentPrices(this);
  }

  this.GetCurrentModel = function () {
    this.Result.spbLowCpu = $(inputIDs.spbLowCpu).val();
    this.Result.spbLowRam = $(inputIDs.spbLowRam).val();

    this.Result.spbHighCpu = $(inputIDs.spbHighCpu).val();
    this.Result.spbHighRam = $(inputIDs.spbHighRam).val();

    this.Result.mskHighCpu = $(inputIDs.mskHighCpu).val();
    this.Result.mskHighRam = $(inputIDs.mskHighRam).val();

    this.Result.SATA = $(inputIDs.SATA).val();
    this.Result.SAS = $(inputIDs.SAS).val();
    this.Result.SSD = $(inputIDs.SSD).val();
  }
  var GetCurrentPrices = function (model) {
    var price = {};
    price.spbLowCpu = model.spbLowCpu.price;
    price.spbLowRam = model.spbLowRam.price;

    price.spbHighCpu = model.spbHighCpu.price;
    price.spbHighRam = model.spbHighRam.price;

    price.mskHighCpu = model.mskHighCpu.price;
    price.mskHighRam = model.mskHighRam.price;

    price.SATA = model.SATA.price;
    price.SAS = model.SAS.price;
    price.SSD = model.SSD.price;

    return price;
  }
}

objCalc.OrderController = function (model, view) {
  this.constructor = function () {
    model.GetCurrentModel();
    Calculate(model);
  }
  // Toggle extra info block
  $('.private__toggle-trigger').click(function (e) {
    view.CollapseAdditionalInfo(e, this);
  });

  // Change inputs value via mouse/touch

  var pressTimeout = null,
    pressInterval = null;

  if (isMobile) {
    document.addEventListener('touchstart', function (e) {
      if ($(e.target).hasClass('private__control')) {
        view.numberInputChange(e);
        pressTimeout = setTimeout(function () {
          pressInterval = setInterval(function () { view.numberInputChange(e); }, 50);
        }, 200);
      }
    }, false);
    document.addEventListener('touchend', function (e) {
      if ($(e.target).hasClass('private__control')) {
        clearTimeout(pressTimeout);
        clearInterval(pressInterval);

        model.GetCurrentModel();
        Calculate(model);
        view.changeBonus();
        return false;
      }
    }, false);
  } else {
    $('.private__control').on('mouseup', function () {
      clearTimeout(pressTimeout);
      clearInterval(pressInterval);

      model.GetCurrentModel();
      Calculate(model);
      view.changeBonus();
      return false;
    });

    $('.private__control').mousedown(function (e) {
      view.numberInputChange(e);
      pressTimeout = setTimeout(function () {
        pressInterval = setInterval(function () { view.numberInputChange(e); }, 50);
      }, 200);
    });
  }

  $('input[type="number"]').change(function (e) {
    view.numberInputChange(e);
    model.GetCurrentModel();
    Calculate(model);
    view.changeBonus();
  });

  var Calculate = function (model) {
    var cpu_spbLow_price = model.Price.spbLowCpu * model.Result.spbLowCpu,
      ram_spbLow_price = model.Price.spbLowRam * model.Result.spbLowRam,
      cpu_spbHigh_price = model.Price.spbHighCpu * model.Result.spbHighCpu,
      ram_spbHigh_price = model.Price.spbHighRam * model.Result.spbHighRam,
      cpu_mskHigh_price = model.Price.mskHighCpu * model.Result.mskHighCpu,
      ram_mskHigh_price = model.Price.mskHighRam * model.Result.mskHighRam,
      sata_price = model.Price.SATA * model.Result.SATA,
      sas_price = model.Price.SAS * model.Result.SAS,
      ssd_price = model.Price.SSD * model.Result.SSD;


    var total = Math.round((
      cpu_spbLow_price +
      ram_spbLow_price +
      cpu_spbHigh_price +
      ram_spbHigh_price +
      cpu_mskHigh_price +
      ram_mskHigh_price +
      sata_price +
      sas_price +
      ssd_price) * 1000) / 1000;

    model.Result.Cost = Math.round(total);

    view.UpdateCostBlock(model);
  }

  /* =============== FORM FUNCTIONS =============== */
  var privateForm = $('#order-private-form'),
    privateElemEmail = '#customer-email',
    privateNewEmailId = privateElemEmail.substr(1, privateElemEmail.length - 1) + '-in-modal',
    privateModalBody = $('#private-order-modal .modal-body');

  var privateValidator = privateForm.validate({
    onkeyup: false,
    onfocusin: function (element) {
      errorMessageRemove($(element));
    },
    rules: {
      'customer-email': {
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
  privateForm.submit(function (e) {
    $('#order-btn-big').click();
    return false;
  });

  privateForm.on('click', '#order-private-btn-big', function (e) {
    e.preventDefault();
    if (privateValidator.form() && !checkFormElemErrorsExist(privateElemEmail)) {
      var resObj = JSON.parse('{"' + $(privateElemEmail).attr('data-db-name') + '": "' + $(privateElemEmail).val() + '"}');
      sendPostRequest('#order-private-form', urlRegister, resObj, function () {
        window.location.href = successURL;
      }, incorrectPost);
    } else {
      if (window.innerWidth < 992) {
        $('#order-private-btn-small').click();
      }
    }
  });

  /* =============== FIXED ORDER BLOCK FUNCTIONS =============== */

  privateForm.on('click', '#order-private-btn-small', function (e) {
    e.preventDefault();

    if (privateValidator.form() && !checkFormElemErrorsExist(privateElemEmail)) {
      $('#order-private-btn-big').click();
    } else {
      addEmailInputToModal();

      $('#' + privateNewEmailId).change(function () {
        checkFieldInModal($(this));
      });

      $('#private-order-modal').modal();
    }

  });

  /* =============== SUBMIT MODAL FUNCTIONS =============== */
  $('#private-order-modal').on('hidden.bs.modal', function () {
    $(privateElemEmail).val($('#' + privateNewEmailId).val());

    privateModalBody.empty();
    $(privateElemEmail).valid();
  });

  $('#private-order-modal-btn').on('click', function () {
    if (checkFieldInModal($('#' + privateNewEmailId))) {
      $('#private-order-modal').modal('hide');

      $('#order-private-btn-big').click();
    }
  });

  function addEmailInputToModal() {
    modalElemEmail = $('<div/>', {
      'class': 'form-group'
    }).append($('<input/>', {
      id: privateNewEmailId,
      class: 'form-control input-sm',
      'name': privateNewEmailId,
      'val': $(privateElemEmail).val(),
      'placeholder': $(privateElemEmail).prop('placeholder')
    }));
    privateModalBody.prepend(modalElemEmail);
    isValidFieldToModal(privateElemEmail);
  }

  function isValidFieldToModal(objId) {
    if (!$(objId).valid() || ($(objId).next(errorElemSelector).length > 0 && $(objId).next(errorElemSelector).text() != '')) {
      var errText = $(objId).next(errorElemSelector).html(),
        errTitle = $(objId).attr('data-modal-title'),
        errId = 'err-' + objId.substr(1, objId.length - 1),
        errBlock = checkModalErrorBlockExists();

      $(objId).parent().addClass('error');
      errBlock.append($('<p/>',
        {
          id: errId,
          'html': '<strong>' + errTitle + ':</strong> ' + errText
        })
      );

    }
  }
  function checkModalErrorBlockExists() {
    var modalErrBlock = privateModalBody.find('.form-message');
    if (modalErrBlock.length < 1) {
      privateModalBody.append($('<div/>', { class: 'form-message bg-danger text-left' }));
      modalErrBlock = privateModalBody.find('.form-message');
    }
    return modalErrBlock;
  }
  function checkFieldInModal(obj) {
    var realElemId = obj.attr('id').replace('-in-modal', ''),
      errModalBlock = checkModalErrorBlockExists();
    errModalMsgId = 'err-' + realElemId,
      errModalElem = errModalBlock.find('#' + errModalMsgId),
      errModalTitle = $('#' + realElemId).attr('data-modal-title'),
      result = false;

    //errorMessageRemove($('#' + realElemId));
    $('#' + realElemId).val(obj.val());
    if ($('#' + realElemId).valid()) {
      errModalElem.remove();
      $('#' + realElemId).parent().removeClass('error');

      if (privateModalBody.find('.form-message').html() == '') {
        privateModalBody.find('.form-message').remove();
      }
      if ($('#' + realElemId).hasClass('form-select')) {
        $('#' + realElemId).change();
      }

      result = true;
    } else {
      if (errModalElem.length < 1) {
        errModalBlock.append($('<p/>', {
          id: errModalMsgId
        }));
        errModalElem = errModalBlock.find('#' + errModalMsgId);
      }
      errModalElem.html('<strong>' + errModalTitle + ':</strong> ' + $('#' + realElemId).next(errorElemSelector).html());
    }
    return result;
  }

  function checkFormElemErrorsExist(obj) {
    var checkErrorelem = $(obj).next(errorElemSelector);
    if (checkErrorelem.length < 1 || checkErrorelem.text() == '') {
      return false;
    } else {
      return true;
    }
  }
  function incorrectPost(data) {
    if (data.Email != undefined && data.Email != '') {
      var c = $(privateElemEmail).val();
      $.validator.addMethod('emailerrors', function (value) {
        return value != c;
      }, data.Email);

      $(privateElemEmail).rules('remove', 'emailerrors');
      $(privateElemEmail).rules('add', {
        'emailerrors': true
      });
    }
  }
}

objCalc.View = function (model) {

  this.constructor = function () {
    $('.private__toggle-block').hide();

    this.initCpuInputs(model);
    this.initRamInputs(model);
    this.numberInputInit(
      inputIDs.SATA, 0, 0, maxValue.SATA, model.SATA.step
    );
    this.numberInputInit(
      inputIDs.SAS, 0, 0, maxValue.SAS, model.SAS.step
    );
    this.numberInputInit(
      inputIDs.SSD, 0, 0, maxValue.SSD, model.SSD.step
    );

  }
  this.CollapseAdditionalInfo = function (e, obj) {
    e.preventDefault();
    $(obj).toggleClass('active');
    toggleBlock = $(obj).attr('href');
    $(toggleBlock).slideToggle();
  };
  this.UpdateCostBlock = function (model) {
    $('#price-sum-big, #price-sum-small').text((model.Result.Cost.toString()).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
  }

  /*************************** NUMBERS ***************************/
  this.initCpuInputs = function (model) {
    var cpuInputs = {};
    cpuInputs.spbLowCpu = inputIDs.spbLowCpu;
    cpuInputs.spbHighCpu = inputIDs.spbHighCpu;
    cpuInputs.mskHighCpu = inputIDs.mskHighCpu;

    var arrInputs = Object.keys(cpuInputs);
    for (var i = 0; i < arrInputs.length; i++) {
      this.numberInputInit(
        cpuInputs[arrInputs[i]],
        0,
        0,
        maxValue.Cpu,
        model[arrInputs[i]].step
      );
    }
  }
  this.initRamInputs = function (model) {
    var ramInputs = {};
    ramInputs.spbLowRam = inputIDs.spbLowRam;
    ramInputs.spbHighRam = inputIDs.spbHighRam;
    ramInputs.mskHighRam = inputIDs.mskHighRam;

    var arrInputs = Object.keys(ramInputs);
    for (var i = 0; i < arrInputs.length; i++) {
      this.numberInputInit(
        ramInputs[arrInputs[i]],
        0,
        0,
        maxValue.Ram,
        model[arrInputs[i]].step,
        arrInputs[i]
      );
    }
  }

  this.numberInputInit = function (id, val, min, max, step) {
    $(id).val(val);
    $(id).prop('min', min);
    $(id).prop('max', max);
    $(id).attr('data-step', step);
    this.numberInputAddControls($(id));
  }
  this.numberInputAddControls = function (obj) {
    controlDESC.clone().appendTo(obj.parent());
    controlASC.clone().appendTo(obj.parent());
  }
  this.numberInputChange = function (e) {
    var parent = $(e.target).parent(),
      input = $('input[type="number"]', parent),
      step = parseInt(input.attr('data-step')),
      min = parseInt(input.attr('min')) - step,
      max = parseInt(input.attr('max')) + step,
      val = (isNaN(parseInt(input.val()))) ? (min + step) : parseInt(input.val()),

      dc = input.attr('data-dc');

    if ($(e.target).hasClass('private__control--asc')) {
      if ((val + step) < max) {
        input.val(val + step);
      }
    } else if ($(e.target).hasClass('private__control--desc')) {
      if ((val - step) > min) {
        input.val(val - step);
      }
    } else if ($(e.target).is(input)) {
      if (val % step != 0) {
        var closestVal = Math.round(val / step);
        input.val(step * closestVal);
      }
      if (val > max) {
        input.val(max - step);
      } else if (val < min || val == min + step) {
        input.val(min + step);
      }
    }
  }


  this.changeBonus = function () {
    var price = parseInt($('#price-sum-big').text().replace(/\s+/g, '')),
      resTextDefault = 'этой суммы',
      resText = '',
      resSum = 0;

    if (price < 4999) {
      resText = '<strong>5 000 рублей</strong>';
      resSum = 500;
    } else if (price >= 5000 && price < 7000) {
      resText = resTextDefault;
      resSum = price * 0.1;
    } else if (price >= 7000 && price < 10000) {
      resText = '<strong>10 000 рублей</strong>';
      resSum = 2000;
    } else if (price >= 10000 && price < 30000) {
      resText = resTextDefault;
      resSum = price * 0.2;
    } else if (price >= 30000 && price < 100000) {
      resText = '<strong>100 000 рублей</strong>';
      resSum = 25000;
    } else if (price >= 100000) {
      resText = resTextDefault;
      resSum = price * 0.25;
    }

    $('#private-bonus-text').html(resText);
    $('#private-bonus-present').text(resSum);
  }

}

if (typeof config !== 'undefined') {
  initCalc(config);
}

function getCalcObject() {
  var modelNew = new objCalc.Model();
  modelNew.SetDefaultModel();
  model = modelNew;

  var viewNew = new objCalc.View(model);
  viewNew.constructor();
  view = viewNew;

  var controllerNew = new objCalc.OrderController(model, view);
  controllerNew.constructor();
  controller = controllerNew;
}


// ==================== STICKY SUM =====================

if (window.innerWidth < 992) {
  toggleOcStickyBlock('#private-price-small', '#order-private-form');
}

$(window).resize(function () {
  if (window.innerWidth < 992) {
    toggleOcStickyBlock('#private-price-small', '#order-private-form');
  }
});
