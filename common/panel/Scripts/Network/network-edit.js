var netBandSlider = $('#speed-slider');

var itemContainer = $('.network__table'),
  itemSelector = '.network__table-item',
  itemConnectSelector = '.network__table-connection',
  itemDuplicateSelector = '.network__table-btn-duplicate';

var isPageServer = ($('#server-network-tab').length) ? true : false;

var pubNetTypeName = {
  v4: 'PublicShared',
  v6: 'PublicSharedIPv6'
};

var editNameConfig = {
  btnId: '#edit-name-btn',
  input: '[name="Name"]',
  inputsWrap: '#edit-name-inputs',
  blockId: '#edit-name-block',
  cancelBtn: '#edit-cancel-btn'
}

var publicConnectedV4Count = 0;
var publicConnectedV6Count = 0;

$(function () {
  $(itemSelector).each(function () {
    var type = $(this).data('network-type');

    initItem($(this), true);

    if ($(this).find(itemConnectSelector).data('connected') && (type === pubNetTypeName.v4 || type === pubNetTypeName.v6)) {
      if (type === pubNetTypeName.v6) {
        publicConnectedV6Count++;
        return;
      }
      publicConnectedV4Count++;
    }
  });

  if (isPageServer) {
    calculatePriceForServer();
  }

  // variable netPriceObj is defined in the Network view
  if (netBandSlider.length && typeof netPriceObj !== 'undefined') {
    initBandWidthSlider(netPriceObj.BandwidthPriceCalculatorSettings);
  }

  $('.network__table-info-trigger').click(function (e) {
    e.preventDefault();
    $(this).closest(itemSelector).find('.network__table-info--settings').toggleClass('network__table-info--active');
  });

  $('#network-save-btn').click(function (e) {
    e.preventDefault();

    // if we are in a network page or in a the server edit tab
    if (isPageServer) {
      sendAjaxRequest('#server-network-tab', $('#server-network-tab').data('href'), getServerEditNetObj(), null, showErrorsNetworkSave);
    } else {
      if (!checkHtmlInForm()) {
        sendAjaxRequest('#network', $('#network').data('href'), getNetObj(), null, showErrorsNetworkSave);
      }

    }
  });
});

function checkHtmlInForm() {
  var hasHtml = false;
  if (window.util.checkIfHtml($(editNameConfig.input).val())) {
    errorMessageAdd($(editNameConfig.input), 'HTML-теги не допускаются');
    hasHtml = true
  };
  return hasHtml
}

/*
 * Inits "switch connection" plugin server element and adds a click event to the button "Add interface" if it is received from backend
 * @obj itemObj - jQuery object of concrete server row in servers table
 * @bool isPresented - is server row object received from backend (view initialization)
 */
function initItem(itemObj, isPresented) {
  var connectElem = itemObj.find(itemConnectSelector),
    duplicateBtn = itemObj.find(itemDuplicateSelector),
    bandSelect = itemObj.find('.network__table-band-select');

  initItemSwitch(connectElem);
  if (isPresented && duplicateBtn.length) {
    duplicateBtn.click(function (e) {
      e.preventDefault();
      duplicateNetworkItem(itemObj[0]);
    });
  }

  if (bandSelect.length) {
    bandSelect.chosen({ disable_search_threshold: 10, width: '100%' }).change(function (e, params) {
      calculatePriceForServer();
    });
  }
}

/*
 * Run "switch connection" plugin for concrete checkbox
 * @obj checkbox - jQuery object of server connection checkbox
 */
function initItemSwitch(checkbox) {
  checkbox.switchButton({
    width: 40,
    height: 25,
    button_width: 25,
    checked: checkbox.data('connected'),
    on_label: resources.Shared_Delete,
    off_label: resources.Shared_Connect,
    labels_placement: "right",
    clear_after: null,
    on_callback: setConnectionStatus,
    off_callback: setConnectionStatus
  });
}

/*
 * Switches plugin control to appropriate state. If state is "off" and server row is a new instance, then this instance is to be removed from DOM
 */
function setConnectionStatus() {
  var item = $(this).closest(itemSelector),
    isPresented = item.data('presented'),
    id = item.data('id'),
    type = item.data('network-type'),
    btnDuplicate = item.find('.network__table-btn-duplicate');

  if (this[0].classList.contains('checked')) {
    this[0].previousSibling.dataset.connected = true;
    if (btnDuplicate.length) {
      btnDuplicate.removeClass('hidden');
    }
  } else {
    this[0].previousSibling.dataset.connected = false;
    if (btnDuplicate.length) {
      btnDuplicate.addClass('hidden');
    }

    if (!isPresented) {
      item.remove();
      checkItemConnectionDisable(id, type);
    }
  }
  calculatePriceForServer();
}

/*
 * Creates a new instance of server row from template (for duplicating net interface)
 * @obj elem - DOM object for duplicating
 */
function duplicateNetworkItem(elem) {
  var tpl = document.getElementById('network-item-template'),
    tplContainer = 'content' in tpl ? tpl.content : tpl,
    newItem = tplContainer.querySelector(itemSelector).cloneNode(true),
    newItemName = elem.querySelector('.network__table-name').cloneNode(true);

  newItem.dataset.id = elem.dataset.id;
  newItemName.querySelector('.power-text').innerHTML += '<small>(NEW)</small>';
  newItem.querySelector('.network__table-name').innerHTML = newItemName.innerHTML;

  if (elem.dataset.networkType === pubNetTypeName.v4 || elem.dataset.networkType === pubNetTypeName.v6) {
    newItem = insertBandwidthSelectToItem(newItem, elem.querySelector('.network__table-band-select').value);
  } else {
    newItem.dataset.bandwidth = elem.dataset.bandwidth;
  }

  newItem.dataset.networkType = elem.dataset.networkType;

  itemContainer.append($(newItem));
  initItem($(newItem), false);

  checkItemConnectionDisable(elem.dataset.id, elem.dataset.networkType);

  if (isPageServer) {
    calculatePriceForServer();
  }
}

/*
 * Clones and inserts bandwidth select to network row item // variable netPriceBandObj is defined in the EditConnections View
 * @obj newItem - new node of network element
 * @string band - bandwidth of the duplicated network
 */
function insertBandwidthSelectToItem(newItem, band) {
  var newSelect = document.getElementById('Bandwidth-netId').cloneNode(true),
    itemsCount = document.querySelectorAll('[data-id="' + newItem.dataset.id + '"]').length;

  newSelect.id = newSelect.id.replace('netId', newItem.dataset.id + '-clone' + itemsCount);
  newSelect.value = (band > netPriceBandObj.MaxBandwidth) ? netPriceBandObj.MinBandwidth : band;

  newItem.querySelector('.network__table-band').appendChild(newSelect);
  return newItem;
}

/**
 * Disables/enables connection control for "parent" servers
 * @param {string} id - net id, based on which we will check our list
 * @param {string} type - net type, based on which we will check our list (additionally to server id)
 */
function checkItemConnectionDisable(id, type) {
  var selector = itemSelector + '[data-id="' + id + '"][data-network-type="' + type + '"]',
    allServers = $(selector),
    presentedServers = $(selector + '[data-presented="1"]'),
    presentedConnections = presentedServers.find(itemConnectSelector + '[data-connected="true"]');

  if (presentedConnections.length > 0 && presentedServers.length < allServers.length && presentedConnections.length <= presentedServers.length) {
    presentedServers.each(function () {
      $(this).find(itemConnectSelector).switchButton('option', 'disabled', true);
    });
  } else {
    presentedServers.each(function () {
      $(this).find(itemConnectSelector).switchButton('option', 'disabled', false);
    });
  }
}

/*
 * Inits slider for network bandwidth change
 * @obj bandObj - object with settings for the net
 */
function initBandWidthSlider(bandObj) {
  netBandSlider.slider({
    value: $('#Bandwidth').val(),
    min: bandObj.MinBandwidth,
    max: bandObj.MaxBandwidth,
    step: bandObj.Step,
    range: 'min',

    slide: function (event, ui) {
      var minWidth = bandObj.MinBandwidth;
      if (ui.value < minWidth) {
        netBandSlider.slider('value', minWidth);
        $('#speed').val(minWidth);
        return false;
      }
      $('#speed').val(ui.value);
      $('#Bandwidth').val(ui.value);
      calculateNetwork(ui.value, netPriceObj);
    },
    create: function (event, ui) {
      calculateNetwork($('#Bandwidth').val(), netPriceObj);
    }
  });
}

/*
 * Calculates price for the concrete net
 * @int bandWidth - value of the banwidth
 * @obj priceObj - network settings object 
 */
function calculateNetwork(bandWidth, priceObj) {
  var priceBand = (bandWidth - priceObj.BandwidthPriceCalculatorSettings.FreeBandwidth) * priceObj.BandwidthPriceCalculatorSettings.UnitPrice;
  $('#network-price-per-month').text(priceObj.PricePerMonth + priceBand);
}

/*
 * Calculates price for all server's network interfaces // variable netPriceBandObj is defined in the EditConnections View
 */
function calculatePriceForServer() {
  var publicConnectedCount = publicConnectedV4Count + publicConnectedV6Count,
    connectionV4Selector = itemSelector + '[data-network-type="' + pubNetTypeName.v4 + '"] ' + itemConnectSelector + '[data-connected="true"]',
    connectionV6Selector = itemSelector + '[data-network-type="' + pubNetTypeName.v6 + '"] ' + itemConnectSelector + '[data-connected="true"]',
    itemsToConnectV4 = $(connectionV4Selector).length,
    itemsToConnectV6 = $(connectionV6Selector).length,
    itemsToConnect = itemsToConnectV4 + itemsToConnectV6,
    result = (itemsToConnectV4 > 1) ? (itemsToConnectV4 - 1) * pricePerIp : 0, // 1 - is for free
    resultPerOnce = 0;

  result += ((itemsToConnectV6 > 1) ? (itemsToConnectV6 - 1) * pricePerIpV6 : 0);

  $(itemSelector + ' .network__table-band-select').each(function () {
    if ($(this).closest(itemSelector).find(itemConnectSelector + '[data-connected="true"]').length) {
      result += ($(this).val() - netPriceBandObj.FreeBandwidth) * netPriceBandObj.UnitPrice;
    }
  });

  $('#server-network-price-elem').text(result);

  // PRICE PER ONCE PART
  if (itemsToConnectV4 - publicConnectedV4Count > 0) {
    resultPerOnce = (itemsToConnectV4 - publicConnectedV4Count) * pricePerIp;
  }
  if (itemsToConnectV6 - publicConnectedV6Count > 0) {
    resultPerOnce += (itemsToConnectV6 - publicConnectedV6Count) * pricePerIpV6;
  }

  if (resultPerOnce > 0) {
    $('#network-price-extra-ipv4 strong').text(resultPerOnce);
    $('#network-price-extra-ipv4').removeClass('hidden');
  } else {
    $('#network-price-extra-ipv4').addClass('hidden');
  }

  $('#network-price-full').parent().css('display', (result > 0 || resultPerOnce > 0) ? 'block' : 'none');
}


/*
 * Returns post object for net settings (Network edit page)
 */
function getNetObj() {
  var netObj = {};

  netObj.Name = $(editNameConfig.input).val();
  netObj.Bandwidth = $('[name="Bandwidth"]').val();
  netObj.NetworkId = $('[name="NetworkId"]').val();
  netObj.NetworkType = $('[name="NetworkType"]').val();
  netObj.ServerLinks = [];

  $(itemSelector).each(function () {
    var serverObj = {};
    serverObj.ServerId = $(this).data('id');
    serverObj.LinkId = $(this).data('link-id');
    serverObj.IsConnected = $(this).find(itemConnectSelector)[0].dataset.connected;

    netObj.ServerLinks.push(serverObj);
  });

  return netObj;
}

/*
 * Returns post object for net settings (Server edit page)
 */
function getServerEditNetObj() {
  var netObj = {};

  netObj.ServiceInstanceId = $('[name="ServiceInstanceId"]').val();
  netObj.NetworkLinks = [];

  $(itemSelector).each(function () {
    var networkObj = {};
    networkObj.NetworkId = $(this).data('id');
    networkObj.NetworkType = $(this).data('network-type');
    networkObj.LinkId = $(this).data('link-id');
    networkObj.Bandwidth = $(this).data('bandwidth');
    networkObj.IsConnected = $(this).find(itemConnectSelector)[0].dataset.connected;

    var type = $(this).data('network-type');

    if (type === pubNetTypeName.v4 || type === pubNetTypeName.v6) {
      networkObj.Bandwidth = $(this).find('.network__table-band-select').val();
      if (!$(this).data('presented')) {
        networkObj.NetworkId = 0;
      }
    }

    netObj.NetworkLinks.push(networkObj);
  });

  return netObj;
}

/*
 * Displays error for network & connected servers
 */
function showErrorsNetworkSave(data) {

  for (var i = 0; i < $(itemSelector).length; i++) {
    var errorMessage = '',
      errArr = (isPageServer) ? data['NetworkLinks[' + i + ']'] : data['ServerLinks[' + i + ']'],
      item = $(itemSelector).eq(i);

    errorMessage += getErrorsFromNetworkData(errArr);

    if (errorMessage) {
      item.find('.network__table-info--active.alert').remove();
      item.append($('<div />', {
        class: 'network__table-info network__table-info--active alert alert-danger',
        html: errorMessage
      }));
    }
  }
}

/*
 * Returns an error string message from array of all mistakes for net item
 * @array arrErr - array of errors
 */
function getErrorsFromNetworkData(arrErr) {
  var result = '';
  if (arrErr && arrErr.length) {
    arrErr.forEach(function (el, i, arr) {
      result += el;
      if (i !== arr.length - 1) {
        result += '<br/>';
      }
    });
  }
  return result;
}
