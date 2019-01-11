

/*
 * Run "switch connection" plugin for concrete checkbox, via switchButton jQuery plugin
 * @obj checkbox - jQuery object of server connection checkbox
 * @string option - name of data-option to change value when switched
 * @func cb - callback function to process switch
 */
function initItemSwitch(checkbox, option, cb, onLabel, offLabel) {
  checkbox.switchButton({
    width: 50,
    height: 25,
    button_width: 25,
    checked: (typeof option !== 'undefined') ? checkbox.data(option) : checkbox.data('checked'),
    on_label: (typeof onLabel !== 'undefined') ? onLabel : resources.TurnOn,
    off_label: (typeof offLabel !== 'undefined') ? offLabel : resources.TurnOff,
    labels_placement: "right",
    clear_after: null
  });

  if (typeof cb === 'function') {
    checkbox.switchButton('option', 'on_callback', cb);
    checkbox.switchButton('option', 'off_callback', cb);
  }
}


/*
 * Run "chosen" plugin for concrete select, via chosen jQuery plugin
 * @itemClass - string. Send class name with a period (.) character
 */
function initSelect(itemClass) {
  let items = $(itemClass);
  items.each(function () {
    $(this).chosen({ disable_search_threshold: 110, width: '100%' });
  })
}

/*
* @blockId - string. Define block in which function toggle checkbox value
* @checkboxClass - string
* @allCheckboxId - string
*/
function toggleAllCheckbox(blockId, checkboxClass, allCheckboxId) {
  var checkbox = $('#' + allCheckboxId),
    items = $('#' + blockId).find('.' + checkboxClass);

  checkbox.prop('checked', checkItems());

  checkbox.on('change', function (e) {
    items.prop('checked', $(this).is(':checked'));
  });

  items.on('change', function () {
    checkbox.prop('checked', checkItems());
  });
  function checkItems() {
    var isCheckedAll = true;
    items.each(function () {
      if (!$(this).is(':checked')) {
        isCheckedAll = false;
        return
      };
    });
    return isCheckedAll
  };
}

function forceCheck(btns, iconClass, blockId, blockedRowClass, successFunction) {
  btns.click(function (e) {
    e.preventDefault();
    let row = $(this).parents('tr'),
      el = row.find(iconClass),
      obj = {};
    obj.hostId = $(this).data('id');
    if (typeof $(this).data('metric-id') !== 'undefined') {
      obj.metricId = $(this).data('metric-id');
    };

    row.addClass('monitoring__form-disabled');
    sendAjaxRequest(blockId, $(this).data('url'), obj, function (data) {
      row.closest(blockedRowClass).removeClass('monitoring__form-disabled');
      setStatus(data, el);
      setDate(data, row);
      setTimeout(function () {
        let noticeName = (typeof $(this).data('name') !== 'undefined') ? $(this).data('name') : '',
          noticeType = (typeof obj.metricId !== 'undefined') ? 'метрики' : 'хоста';
        showNotice = new PanelNotice('Состояние ' + noticeType + ' ' + noticeName + ' обновлено', 'success');
      }, 3000);
      if (typeof successFunction === 'function') {
        successFunction(data, row);
      };
    }, function (data) {
      let showNotice = new PanelNotice('Ошибка в ходе выполнения запроса');
      el.closest(blockedRowClass).removeClass('monitoring__form-disabled');
    });
  });
};

function setStatus(data, el) {
  var failedMetrics = (typeof data['HasFailedMetrics'] !== 'undefined' && data['HasFailedMetrics']) ? 'status--warning' : '';
  el.attr('class', 'monitoring__icon-status status status--' + data['Status'].toLowerCase() + ' ' + failedMetrics);
};
function setDate(data, row) {
  var elem = row.find('.check-date'),
    curDate = new Date(data['Timestamp']),
    curMonth = (curDate.getMonth() + 1 > 9) ? curDate.getMonth() + 1 : '0' + (curDate.getMonth() + 1),
    curHour = (curDate.getHours() > 9) ? curDate.getHours() : '0' + curDate.getHours(),
    curMin = (curDate.getMinutes() > 9) ? curDate.getMinutes() : '0' + curDate.getMinutes(),
    date = curDate.getDate() + '.' + curMonth + '.' + curDate.getFullYear() + ' ' + curHour + ':' + curMin;
  elem.text(date);
}

resources.hostUp = 'Хост доступен';
resources.hostPartiallyUp = 'Хост доступен не по всем метрикам';
resources.hostDown = 'Хост не доступен';
resources.metricUp = 'Хост отвечает';
resources.metricDown = 'Хост не отвечает';

function addStatusTitle() {
  $('.status').each(function () {
    if ($(this).hasClass('monitoring__icon-state--Up')) {
      $(this).attr('title', ($(this).data('ismetric')) ? resources.metricUp : resources.hostUp);
    } else if ($(this).hasClass('monitoring__icon-state--PartiallyUp')) {
      $(this).attr('title', resources.hostPartiallyUp)
    } else if ($(this).hasClass('monitoring__icon-state--Down')) {
      $(this).attr('title', ($(this).data('ismetric')) ? resources.metricDown : resources.hostDown)
    }
  })
};
addStatusTitle();

var DrawOptions = function (actions, commandUrl, selectCommandId, commandBlockId, formId, cb) {
  var block = $(commandBlockId),
    blockWrap = block.parents('.monitoring__form-extra--bg');
  var optionsView = {
    getAdditionalOptions: function () {
      var select = $(selectCommandId);
      select.on('change', '', function () {
        var curOption = $(this).find('option:selected').val(),
          curUrl = commandUrl[curOption];
        if (curUrl) {
          sendAjaxGetRequest(curUrl, function (data) {
            optionsView.drawAdditionalOptions(data);
            optionsView.setDifferentId();
            if (typeof cb == 'function') {
              cb();
            };
          });
        } else {
          blockWrap.addClass('hidden');
        }
        optionsView.setFormAction(curOption);
      });
      
    },
    drawAdditionalOptions: function (data) {
      block.html(data);
      if (data.length == 0) {
        blockWrap.addClass('hidden')
      } else {
        blockWrap.removeClass('hidden')
      };
      initSelect(commandBlockId + ' .chosen-select');
    },
    setDifferentId: function () {
      var checkboxes = block.find('input[type="checkbox"]'),
        inputs = block.find('input[type="text"]');
      checkboxes.each(function () {
        var curId = $(this).attr('id'),
          curLabel = block.find('label[for="' + curId + '"]');
        $(this).attr('id', curId + commandBlockId.replace('#', ''));
        curLabel.attr('for', curId + commandBlockId.replace('#', ''));
      });
      inputs.each(function () {
        var curId = $(this).attr('id');
        $(this).attr('id', curId + '-' + commandBlockId.replace('#', ''));
      });
    },
    setFormAction: function (key) {
      var form = $(formId);
      form.attr('action', actions[key]);
    },
    init: function () {
      optionsView.getAdditionalOptions();
    }
  }
  optionsView.init();
}

function showErrorsWithObjName(data, blockId) {
  var names = Object.keys(data);
  names.forEach(function (el) {
    var curEl = $(blockId).find('[name="' + el + '"]');
    if (curEl.length == 0) {
      var split = el.split('.'),
        fixName = split[split.length - 1],
        fixElem = $(blockId).find('[name="' + fixName + '"]');
      if (fixElem.length > 0) {
        errorMessageAdd(fixElem, data[el]);
      }
    }
  })
}