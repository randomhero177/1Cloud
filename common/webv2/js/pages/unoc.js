initRegistrationForm('#topblock-form', 'regtop', '1c-head-register');
initMessageForm('#consult-form', null, null, '1c-ask-question');

/* =============== TOPBLOCK SECTION =============== */
var topForm = $('#topblock-form'),
  topFormTrigger = $('.topblock__form-trigger'),
  topFormClose = $('.topblock__form-close');

if (topForm && topFormTrigger && topFormClose) {
  topFormTrigger.click(function (e) {
    e.preventDefault();
    document.body.classList.add('topblock--opened');
  });

  topFormClose.click(function (e) {
    e.preventDefault();
    document.body.classList.remove('topblock--opened');
  });
}

/* =============== CONFIG MODAL =============== */
var $configModal = $('#config-order-modal'),
  $modalTitle = $('#config-title'),
  $modalPrice = $('#config-price'),
  postObj = Object.create(null),
  $tariffItems = $('.unoc-config__item');

$tariffItems.each(function () {
  var $item = $(this);

  setTariffOsId();

  $item.click(function (e) {
    e.preventDefault();

    var curTitle = $(this).find('.unoc-config__item-title').text(),
      curPrice = $(this).find('.unoc-config__item-price').text();

    $modalTitle.text(curTitle);
    $modalPrice.text(curPrice);
    $configModal.modal('show');

    fillOrderObject($item);
  });

  function setTariffOsId() {
    var $osElem = $item.find('[data-image-id]');
    var osText = $osElem.text();
    var id = imageList[0].ID; // default os

    var filteredValues = imageList.filter(function (os) {
      return os.DisplayName.indexOf(osText) > -1;
    });

    if (filteredValues.length === 1) {
      id = filteredValues[0].ID;
    }

    if (filteredValues.length > 1) {
      for (var i = 0; i < filteredValues.length; i++) {
        if (filteredValues[i].DisplayName.indexOf(' Ru') > -1) {
          id = filteredValues[i].ID;
          break;
        } else if (i === filteredValues.length - 1) {
          id = filteredValues[0].ID;
        }
      }
    }

    $osElem.data('image-id', id);
  }
});


$('#tariff-order-form').submit(function (e) {
  e.preventDefault();
  postObj.Email = $('#tariff-order-email').val();

  sendPostRequest('#tariff-order-form', urlRegisterServer, postObj, function () {
    reachCounterGoal('1c-recomended-order');
  });
})

function fillOrderObject(block) {
  var dcTitle = block.find('[data-dc]').data('dc');
  var postRam = parseInt(block.find('[data-ram]').data('ram'));

  var isHigh = !config.DcLocationList.filter(function (el) {
    return el.TechTitle === dcTitle;
  })[0].IsEnableLowPool;

  postObj.Name = 'Server';
  postObj.CPU = block.find('[data-cpu]').data('cpu');
  postObj.HDD = block.find('[data-hdd]').data('hdd');
  postObj.ImageID = block.find('[data-image-id]').data('image-id');
  postObj.HDDType = block.find('[data-hdd-type]').data('hdd-type');
  postObj.isHighPerformance = isHigh;
  postObj.DCLocation = dcTitle;
  postObj.isBackupActive = false;

  postObj.RAM = (postRam > 500 && postRam < 1024) ? postRam : postRam * 1024;

  return postObj;
}