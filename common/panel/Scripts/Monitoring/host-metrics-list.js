

var HostMetrics = {
  config: {
    forceCheckBtn: '.js-metrics-check',
    stateIcon: '.monitoring__icon-state',
    switchItem: '.monitoring__item-connection-inp',
    btnId: '#get-metrics-btn',
    containerId: '#monitoring-metrics-container',
    metrcisRow: '.monitoring__metrics-row',
    metrcisRowClass: 'monitoring__metrics-row',
    tplId: 'monitoring-metrics-tpl'
  },
  list: {
    load: function () {
      $(HostMetrics.config.btnId).click(function () {
        var curUrl = $(this).data('url');
        sendAjaxGetRequest(curUrl, function (data) {
          HostMetrics.list.drawMetrics(data);
          var hostEdit = new EditMetricsInit();
        });
      });
    },
    drawMetrics: function (data) {
      var c = HostMetrics.config,
        list = $(c.containerId),
        items = list.find('.monitoring__metrics-item');
      items.each(function () {
        $(this).remove();
      });
      if (data.length > 0) {
        for (var i = 0; i < data.length; i++) {
          list.append(HostMetrics.list.drawSingleMetric(i, data[i]));
        }
        var availableQuant = 10 - data.length;
        if (availableQuant > 0) {
          $('#metrics-available-free').removeClass('hidden');
          $('#metrics-available-quant').text(availableQuant);
        };
        if (!isHostEnabled) {
          $(HostMetrics.config.forceCheckBtn).addClass('hidden');
        };
      } else {
        $('#metrics-no-results').removeClass('hidden');
        $(c.containerId).addClass('hidden');
      };
      addStatusTitle();
    },
    drawSingleMetric: function (index, metric) {
      var c = HostMetrics.config,
        tpl = document.getElementById(HostMetrics.config.tplId),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector(c.metrcisRow).cloneNode(true),
        hostId = $(c.containerId).data('host');
      elem.dataset.id = metric.Id;
      window.util.fillDetalization('', metric, elem);
      elem.querySelector('.monitoring__metrics-selflink').href = metric.SelfLink;

      var date = window.util.formatDate(new Date(metric.LastCheckTime));

      elem.querySelector('.monitoring__list-date').textContent = date;
      elem.addEventListener('click', function () {
        $(c.metrcisRow).removeClass(c.metrcisRowClass + '--focus');
        $(this).addClass(c.metrcisRowClass + '--focus');
      });
      var stateBlock = elem.querySelector('.monitoring__icon-status');
      stateBlock.classList.add('status--' + metric.Status.toLowerCase());

      var removeBlock = $(elem).find('.monitoring__list-delete'),
        removeBtn = $('<span />', {
          'class': 'monitoring__icon-state monitoring__icon-state--remove',
          'data-id': metric.Id
        }).click(function () {
          HostMetrics.list.removeMetric($(this), metric.Id, hostId);
        })
      removeBlock.append(removeBtn);
      var refreshBlock = $(elem).find('.metrics-refresh-state'),
        refreshBtn = $('<span />', {
          'class': 'monitoring__icon-state monitoring__icon-state--refresh js-metrics-check',
          'title': 'Обновить статус',
          'data-url': hostId + '/metric/' + metric.Id + '/forcecheck',
          'data-id': hostId,
          'data-metric-id': metric.Id
        });

      refreshBlock.find(c.stateIcon).attr('data-name', metric.Name);
      forceCheck(refreshBtn, '.monitoring__icon-status', c.containerId, c.metrcisRow);
      refreshBlock.append(refreshBtn);

      return elem;
    },
    removeMetric: function (elem, metricId, hostId) {
      var url = elem.parent().data('url'),
        obj = {};
      obj.hostId = hostId;
      obj.metricId = metricId;
      let confirm = new ConfirmPopup({
        text: resources.deleteMetric,
        cbProceed: function () {
          sendAjaxRequest('#monitoring-metrics', hostId + '/metric/' + metricId, obj, function (data) {
            console.log(data);
          }, null, 'DELETE');
          $(HostMetrics.config.metrcisRow + '--focus').remove();
        }
      });
    }
  },
  view: {

  },
  model: {},
  init: function () {
    HostMetrics.list.load();
  }
}

HostMetrics.init();
