

var HostHistory = {
  config: {
    blockId: '#monitoring-history',
    btnId: 'get-history-btn',
    containerId: 'monitoring-history-container',
    tplId: 'monitoring-history-tpl',
    filterBlockId: '#monitoring-filter',
    fakeSelectId: '#fake-select',
    fakeSelectOptions: '#history-locations',
    filterItems: '.history-send-request',
    filterCheckbox: '#history-locations'
  },
  list: {
    load: function () {
      var curUrl = $('#' + HostHistory.config.btnId).data('url'),
        obj = {};
      obj.Filter = HostHistory.model.getFilterObj();
      sendAjaxRequest(HostHistory.config.filterBlockId, curUrl, obj, function (data) {
          
        HostHistory.list.drawList(data.Points);
      }, null);
    },
    drawList: function (data) {
      var noResults = container.querySelector('.monitoring__metrics--no-results'),
        list = document.getElementById(HostHistory.config.containerId),
        items = $(list).find('.monitoring__history-row');
      items.each(function () {
        $(this).remove();
      });
      if (data.length > 0) {
        $('#history-no-results').addClass('hidden');
        $('#monitoring-history-container').removeClass('hidden');
        for (var i = 0; i < data.length; i++) {
          list.appendChild(HostHistory.list.drawSingleMetric(i, data[i]));
        }
        var availableQuant = 10 - data.length;
        if (availableQuant > 0) {
          $('#metrics-available-free').removeClass('hidden');
          $('#metrics-available-quant').text(availableQuant);
        }
        
      } else {
        $('#history-no-results').removeClass('hidden');
        $('#monitoring-history-container').addClass('hidden');
      };
      addStatusTitle();
    },
    drawSingleMetric: function (index, metric) {
      var tpl = document.getElementById(HostHistory.config.tplId),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('.monitoring__history-row').cloneNode(true),
        hostId = $('#monitoring-metrics-container').data('host');
      elem.dataset.id = metric.Id;
      window.util.fillDetalization('', metric, elem);
      var stateBlock = elem.querySelector('.monitoring__icon-status');
      if (metric.MetricStatus) {
        stateBlock.classList.add('status--' + metric.MetricStatus.toLowerCase());
      } else {
        stateBlock.classList.add('status--' + metric.HostStatus.toLowerCase());
      };

      elem.querySelector('.monitoring__metrics-selflink').href = metric.SelfLink;
      var date = window.util.formatDate(new Date(metric.Timestamp));
      elem.querySelector('.monitoring__list-date').textContent = date;

      elem.querySelector('.monitoring__metrics-selflink').textContent = (!metric['MetricId']) ? metric.CommandType + ' (Хост)' : ((metric.MerticName) ? metric.MerticName + ' (' + metric.CommandType + ')' : 'метрика ' + ' (' + metric.CommandType + ')' );
      return elem
    },
  },
  model: {
    refreshFilter: function () {
      var c = HostHistory.config,
          form = $(c.filterBlockId);
        form.addClass('loading loading--full');
        HostHistory.list.load();
      setTimeout(function () {
        form.removeClass('loading loading--full');
      }, 3000);
    },
    getFilterObj: function () {
      var c = HostHistory.config,
        locationItem = $(c.filterCheckbox + ' ' + c.filterItems + ':not(#checkbox-all-filter)'),
        command = $('[name="command"]'),
        period = $('[name="period"]'),
        state = $('[name="historyCheckState"]'),
        count = $('[name="count"]'),
        metric = $('[name="metric"]'),
        obj = {};
      obj.Locations = [];
      locationItem.each(function () {
        if ($(this).is(':checked')) {
          obj.Locations.push($(this).data('value'));
        };
      });
      obj.hostId = $('#monitoring-edit-tabs').data('hostid');
      obj.CommandType = command.find('option:selected').val();
      obj.Period = period.find('option:selected').val();
      obj.State = state.find('option:selected').val();
      obj.Count = count.find('option:selected').val();
      obj.MetricId = metric.find('option:selected').val();
      return obj
    }
  },
  view: {
    initSelect: function () {
      initSelect(HostHistory.config.blockId + ' .chosen-select')
    },
    fakeSelect: function () {
      var select = $(HostHistory.config.fakeSelectId),
        selectBlock = $(HostHistory.config.fakeSelectOptions),
        items = selectBlock.find('input:checkbox');

      select.click(function (e) {
        e.stopPropagation();
        selectBlock.toggleClass('hidden');
        select.toggleClass('monitoring__fake-select--focus');
      });

      $('#container').click(function () {
        selectBlock.addClass('hidden');
        select.removeClass('monitoring__fake-select--focus');
      });
      items.click(function (e) {
        HostHistory.view.showSelectedVal();
        if (!$(this).is(':checked')) {
          $('#checkbox-all-filter').prop('checked', false);
        };
      });
    },
    showSelectedVal: function() {
      var checked = $(HostHistory.config.fakeSelectOptions).find('.history-send-request:not(#checkbox-all-filter):checked'),
        textBlock = $('#fake-select-text');
      textBlock.text('');
      checked.each(function (i) {
        if (i > 0 && checked.length - 1 >= i) {
          textBlock.append(', ');
        };
        textBlock.append($(this).attr('name'));
      });
    },
    selectAllCheckbox: function (checkbox) {
      var selectBlock = $(HostHistory.config.fakeSelectOptions),
        items = selectBlock.find('.history-send-request'),
        isChecked = checkbox.is(':checked');
        items.each(function (i) {
          $(this).prop('checked', isChecked);
        });
    },
    init: function () {
      HostHistory.view.initSelect();
      HostHistory.view.fakeSelect();
    }
  },
  actions: {
    hostForceCheck: function () {
      var btns = $(hostList.config.forceCheckBtn);
      btns.click(function () {
        let el = $(this).siblings(hostList.config.stateIcon);
        sendAjaxRequest('#' + hostList.config.listId, $(this).data('url'), $(this).data('id'), function (data) {
          hostList.actions.setStatus(data['Points'], el)
        });
      })
    },
    setStatus: function (data, el) {
      el.attr('class', 'monitoring__icon-status status status--' + data['Status'].toLowerCase());
    },
  },
  init: function () {
    var c = HostHistory.config,
      items = $(c.filterItems);
    $('#' + c.btnId).click(function () {
      HostHistory.list.load();
    });

    HostHistory.view.init();
    
    items.on('change', function () {
      if ($(this).attr('id') == 'checkbox-all-filter') {
        HostHistory.view.selectAllCheckbox($(this));
        HostHistory.view.showSelectedVal();
      };
      HostHistory.model.refreshFilter();
    });
    
  }
}

HostHistory.init();

