var imageList = {},
  softList = {},
  dcLocationList = {},
  defaultValues = {},
  model = {},
  view = {},
  controller = {},
  modelT = {},
  viewT = {},
  controllerT = {},
  dcTitles = [],
  defaultDcTitle = '';

var resources = {
  'ru': {
    'Mb': 'МБ',
    'Gb': 'ГБ',
    'GHz': 'ГГц'
  },
  'en': {
    'Mb': 'MB',
    'Gb': 'GB',
    'GHz': 'GHz'
  }
};
resources = (lang == 'en') ? resources.en : resources.ru;

// HACK FOR CORRELATION OF DC-NAME IN DB AND DC-NAME IN INITPARAMS
var spbDcTitle = 'SPb_SDN',
  spb2DcTitle = 'SPb2_SDN',
  mskDcTitle = 'MSk_DS',
  kzDcTitle = 'Kz_Ah';

initCalc();

/*************************** MODEL CONFIG ***************************/
function initCalc() {
  if (typeof config !== 'undefined') {
    initparams = config.Initparams;
    softList = config.IspSoftList;
    dcLocationList = config.DcLocationList;
    defaultValues = config.DefaultValues;
    imageList = config.ImageList;
    dcTitles = Object.keys(config.Initparams);
    defaultDcTitle = dcTitles.filter(function (el) { return initparams[el].DCLocationTechTitle === defaultValues.Dc; })[0];

    if (window['filterFamily'] != undefined && filterFamily != null) {
      imageList = $.grep(imageList, function (e1) { return e1.Family.toString() == filterFamily; });
    }
    if (window['filterIsp'] != undefined && filterIsp != null) {
      imageList = $.grep(imageList, function (e1) { return e1.IsAvailableISP == filterIsp; });
    }

    getCalcObject();
  }

  if ($('#tariff-os-select').length > 0) {
    getTariffObject();
  }
}

function getCalcObject() {
  var modelNew = new objCalc.Model();
  modelNew.SetDefaultModel();
  model = modelNew;

  var viewNew = new objCalc.View(model);
  viewNew.constructor();
  view = viewNew;

  var controllerNew = new objCalc.Controller(model, view);
  controllerNew.constructor();
  controller = controllerNew;
}
function getTariffObject() {
  var modelT = new objCalcTariff.Model();
  var viewT = new objCalcTariff.View(modelT);

  viewT.GenerateImageTariffSelect(modelT);

  var controllerTNew = new objCalcTariff.Controller(modelT, viewT);
  controllerTNew.constructor();
  controllerT = controllerTNew;
}
