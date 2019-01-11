/********** LIST AND DELETE**********/
var classToDelete = 'network__to-delete';
var deleteNetworkForm = $('#network-delete-form');

$('.network__list-delete').click(function (e) {
  e.preventDefault();
  e.stopPropagation();

  $(this).closest('tr').addClass(classToDelete);
  let confirm = new ConfirmPopup({
    text: resources.textDeleteNetworkConfirm,
    cbProceed: deleteNetwork,
    cbCancel: errorDeleteNetwork
  });
});

$('.network__item-delete').click(function (e) {
  e.preventDefault();
  e.stopPropagation();

  $(this).parent().addClass(classToDelete);
  let confirm = new ConfirmPopup({
    text: resources.textDeleteNetworkConfirm,
    cbProceed: deleteNetwork
  });
});

deleteNetworkForm.submit(function (e) {
  e.preventDefault();
  e.stopPropagation();

  deleteNetworkFromPage();
});

function deleteNetwork() {
  var itemToDelete = $('.' + classToDelete);

  // Check if we are on a NeedMoney view
  if ($('#view-network').length) {
    sendAjaxRequest('#view-network', itemToDelete.find('.network__item-delete').attr('href'), {
      NetworkId: itemToDelete.data('id'),
      NetworkType: itemToDelete.data('type')
    });
  } else {
    sendAjaxRequest('#network-list', itemToDelete.find('.network__list-delete').attr('href'), {
      NetworkId: itemToDelete.data('id'),
      NetworkType: itemToDelete.data('type')
    }, '', errorDeleteNetwork);
  }
}
function errorDeleteNetwork() {
  var itemToDelete = $('.' + classToDelete);
  itemToDelete.removeClass(classToDelete);
}

/********** CREATE **********/

if ($('#network-create').length) {
  initNetworkCreation();
}
function initNetworkCreation() {
  var $netBlock = $('#network-create'),
    $networkDescriptions = $('.network__description-item'),
    $networkBlocks = $('.network__block'),
    $netOrderFinal = $('#network-order-final'),
    $netOrderPrice = $netOrderFinal.find('.network__price-amount'),
    $addressBlocks = $('.network__address')
  $netCreateBtn = $('#network-create-btn');

  $addressBlocks.each(function () {
    initAddressBlock($(this));
  });

  showNetworkBlock();
  $('[name="NetworkType"]').change(function () {
    showNetworkBlock();
  });
  $('[name="DcLocation"]').change(function () {
    showNetworkBlock();
  });

  $netCreateBtn.click(function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $activeInput = $('[name="NetworkType"]:checked');
    var type = $activeInput.data('type');
    var $activeForm = $('.network__block[data-type="' + type + '"]');

    $activeForm.data("validator").settings.ignore = "";

    if ($activeForm.valid()) {
      sendAjaxRequest('#' + $activeForm.attr('id'), $activeForm.attr('action'), getPostObject(type), function () {
        reachCounterGoal('creatingnet', 'submit');
      });
    }

    function getPostObject(type) {
      var postObj = {};

      postObj.DcLocation = $netBlock.find('[name="DcLocation"]:checked').val();
      postObj.Name = $activeForm.find('[name="Name"]').val();

      switch (type) {
        case 'private':
          postObj.IsDHCP = $activeForm.find('[name="IsDHCP"]').prop('checked');
          postObj.Address = $activeForm.find('[name="Address"]').val();
          break;
        case 'public':
          postObj.NetworkCapacity = $activeForm.find('[name="NetworkCapacity"]').val();
          postObj.Bandwidth = $activeForm.find('[name="Bandwidth"]').val();
          break;
        case 'routed':
          postObj.IsDHCP = $activeForm.find('[name="IsDHCP"]').prop('checked');
          postObj.Bandwidth = $activeForm.find('[name="Bandwidth"]').val();
          postObj.Address = $activeForm.find('[name="Address"]').val();
          break;
      }

      return postObj;
    }
  });

  function showNetworkBlock() {
    var $activeInput = $('[name="NetworkType"]:checked');
    var type = $activeInput.data('type');
    var $activeForm = $('.network__block[data-type="' + type + '"]');

    $networkDescriptions.each(function () {
      var $descr = $(this);
      $descr[($descr.data('type') === type) ? 'removeClass' : 'addClass']('hidden')
    });

    $networkBlocks.addClass('hidden');
    $activeForm.removeClass('hidden');

    if (type === 'public' || type === 'routed') {
      initNetworkParamsBlock(type);
      $netOrderPrice.removeClass('hidden');
    } else {
      $netOrderFinal.removeClass('hidden');
      $netOrderPrice.addClass('hidden');
    }

    function toggleNetworksAvailable($block, isAvailable) {
      $block.find('.network__available')[(isAvailable) ? "removeClass" : "addClass"]('hidden');
      $block.find('.network__unavailable')[(isAvailable) ? "addClass" : "removeClass"]('hidden');
      $netOrderFinal[(isAvailable) ? "removeClass" : "addClass"]('hidden');
    }

    function initNetworkParamsBlock(type) {
      var dcId = Number($('[name="DcLocation"]:checked').val()),
        $netBandSlider = $activeForm.find('.slider'),
        $netBandInput = $activeForm.find('[name="Bandwidth"]'),
        netPricesAll = [],
        netPriceObj = {};

      if (type === 'public') {
        initPublicBlock();
      } else if (type === 'routed') {
        initRoutedBlock();
      }

      function initPublicBlock() {
        var $netCapSelect = $activeForm.find('[name="NetworkCapacity"]');

        if (priceList && netCapOptions) {
          netPricesAll = priceList.filter(function (el) {
            return el.DcLocation == dcId
          });

          if (netPricesAll.length > 0) {
            toggleNetworksAvailable($activeForm, true);
            drawPublicSelect(dcId, $netCapSelect);

            if ($netCapSelect.next('.chosen-container').length > 0) {
              $netCapSelect.trigger('chosen:updated');
            } else {
              $netCapSelect.chosen({ disable_search_threshold: 10 }).change(function (e, params) {
                refreshPublicSettings(params.selected);
                calculateNetwork($netBandSlider.slider('option', 'value'), netPriceObj);
              });
            }

            refreshPublicSettings($netCapSelect.val());
            initBandWidthSlider(netPriceObj.BandwidthPriceCalculatorSettings);
            $netBandInput.val($netBandSlider.slider('option', 'value'));
          } else {
            toggleNetworksAvailable($activeForm, false);
          }
        } else {
          toggleNetworksAvailable($activeForm, false);
        }

        function drawPublicSelect(dcId, $selectObj) {
          $selectObj.find('option').remove();

          for (var i = 0; i < netPricesAll.length; i++) {
            $selectObj.append($('<option />', {
              'value': netPricesAll[i].NetworkCapacity,
              'text': netCapOptions[netPricesAll[i].NetworkCapacity]
            }));
          }
        }
        function refreshPublicSettings(netCapId) {
          var netCapArr = netPricesAll.filter(function (el) {
            return (el.NetworkCapacity == netCapId);
          });
          netPriceObj = netCapArr[0];
        }
      }

      function initRoutedBlock() {
        if (priceListRouted) {
          netPricesAll = priceList.filter(function (el) {
            return el.DcLocation == dcId
          });


          if (netPricesAll.length > 0) {
            netPriceObj = netPricesAll[0];
            toggleNetworksAvailable($activeForm, true);

            initBandWidthSlider(netPriceObj.BandwidthPriceCalculatorSettings);
            $netBandInput.val($netBandSlider.slider('option', 'value'));
          } else {
            toggleNetworksAvailable($activeForm, false);
          }
        } else {
          toggleNetworksAvailable($activeForm, false);
        }
      }

      function initBandWidthSlider(bandObj) {
        var $displayInput = $activeForm.find('.server__slider-input .smallinput');

        $netBandSlider.slider({
          value: ($netBandInput.val() > bandObj.FreeBandwidth) ? $netBandInput.val() : bandObj.FreeBandwidth,
          min: bandObj.MinBandwidth,
          max: bandObj.MaxBandwidth,
          step: bandObj.Step,
          range: 'min',

          slide: function (event, ui) {
            var minWidth = bandObj.MinBandwidth;
            if (ui.value < minWidth) {
              $netBandSlider.slider('value', minWidth);
              $displayInput.val(minWidth);
              return false;
            }

            $displayInput.val(ui.value);
            $netBandInput.val(ui.value);

            calculateNetwork(ui.value, netPriceObj);
          },
          create: function (event, ui) {
            calculateNetwork(bandObj.FreeBandwidth, netPriceObj);
          }
        });
      }
    }

    function calculateNetwork(bandWidth, netPriceObj) {
      var priceBand = ((bandWidth - netPriceObj.BandwidthPriceCalculatorSettings.FreeBandwidth) * netPriceObj.BandwidthPriceCalculatorSettings.UnitPrice) + netPriceObj.PricePerMonth;
      $netOrderFinal.find('#network-price-per-month').text(priceBand.toLocaleString('ru-RU'));
    }

  }

  function initAddressBlock($block) {
    var $input = $block.find('[name="Address"]'),
      $inputFake = $block.find('[name="AddressFake"]');

    $inputFake.on('input change', function () {
      $input.val($inputFake.val() + '.0/24');
    });
  }

}

/********** DELETE **********/
function deleteNetworkFromPage() {
  var confirm = deleteNetworkForm.find('#network-delete-confirm');

  if (!confirm.prop('checked')) {
    errorMessageAdd(confirm, resources.ConfirmRequired);
    return;
  }

  sendAjaxRequest('#' + deleteNetworkForm.attr('id'), deleteNetworkForm.attr('action'), {
    NetworkId: deleteNetworkForm.find('[name="NetworkId"]').val(),
    NetworkType: deleteNetworkForm.find('[name="NetworkType"]').val()
  });
}