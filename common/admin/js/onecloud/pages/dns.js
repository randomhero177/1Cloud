'use strict';

var Dns = {
  config: {
    filterFormId: 'dns-filter',
    monitoringContainerId: 'dns-list-container',
    monitoringListId: 'dns-table',
    monitoringListUrl: 'list'
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Dns.item.curmonitoring = {};
      Dns.item.monitoringBlock.classList.remove('main-list__info--active');
      Dns.list.load();
    },
    init: function () {
      Dns.filter.obj = new Filter(Dns.config.filterFormId, Dns.filter.submit);
      Dns.filter.obj.init();
    }
  },
  list: {
    /*
     * Loads monitoring list due to filter values
     */
    load: function () {
      $.get(window.util.makeCorrectUrl(Dns.config.monitoringListUrl), Dns.filter.obj.getFilterObj(), function (data) {
        Dns.list.drawDnsList(data);
      }).fail(function (data) {
        handleAjaxErrors(data);
        console.log('Error getting monitoring');
      });
    },
    /*
     * Draw monitoring table due to server's response
     * @obj data - object from server with monitoring object list
     */
    drawDnsList: function (data) {
      var container = document.getElementById(Dns.config.monitoringContainerId),
        table = document.getElementById(Dns.config.monitoringListId),
        noResults = container.querySelector('.table--no-results'),
        list = table.querySelector('.dns__row-list');

      container.parentNode.classList.add('loading', 'loading--full');
      setTimeout(function () {
        while (list.firstChild) {
          list.removeChild(list.firstChild);
        }
        if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            list.appendChild(Dns.list.drawSingleDns(i, data[i]));
          }
          table.classList.remove('hidden');
          noResults.classList.add('hidden');

          if (data.length === 1) {
            Dns.item.load(data[0].ProjectId);
            list.firstChild.classList.add('active');
          }
        } else {
          table.classList.add('hidden');
          noResults.classList.remove('hidden');
        }

        container.parentNode.classList.remove('loading', 'loading--full');
      }, 400);

    },
    /*
        * Returns DOM object of a single monitoring item
        * @number index - index of a single monitoring object in a tickets list
        * @obj monitoring - object of a single monitoring data
    */
    drawSingleDns: function (index, dns) {
      var tpl = document.getElementById('dns-row-template'),
        tplContainer = 'content' in tpl ? tpl.content : tpl,
        elem = tplContainer.querySelector('tr').cloneNode(true),
        dateCreate = new Date(dns.DateCreate);
      elem.dataset.id = dns.ZoneId;
      
      window.util.fillDetalization('', dns, elem);
      elem.querySelector('.status').classList.add('status--' + dns.State);

      elem.addEventListener('click', function () {
        if (dns.ZoneId !== Dns.item.curmonitoring.monitoringId) {
          var rows = document.querySelectorAll('.dns__row');
          for (var i = 0; i < rows.length; i++) {
            rows[i].classList.remove('active');
          }
          
          this.classList.add('active');
          Dns.item.load(dns.ZoneId);
        }
      });
      if (dns.ZoneId === Dns.item.curmonitoring.monitoringId) {
        elem.classList.add('active');
      };
      return elem;
    }
  },
  item: {
    interval: false,
    curmonitoring: {},
    monitoringBlock: document.getElementById('dns-info'),
    filterControl: document.getElementById('collapse-filter-btn'),
    summaryBlock: document.getElementById('dns-summary'),

    load: function (id) {
      var item = Dns.item;
      item.monitoringBlock.classList.add('loading', 'loading--full');

      $.get(window.util.makeCorrectUrl(id), function (data) {
        item.curmonitoring = data;
        item.fillDnsInfo(data);
      }).fail(function (data) {
        console.log('Error loading monitoring');
        handleAjaxErrors(data);
        item.monitoringBlock.classList.remove('loading', 'loading--full');
      });

    },
    fillMetricsInfo: function (metrics) {
      var t = Dns.item.tabs;
      window.drawDetalizationTabTables({ metrics : metrics }, t.config, t.filterConfig);
    },
    fillDnsInfo: function (dnsInfo) {
      var monitoringBlock = Dns.item.monitoringBlock,
        t = Dns.item.tabs;

      var linkTomonitoringTasksElem = monitoringBlock.querySelector('[data-rel="monitoring-tasks"]');
      setTimeout(function () {
        // FILL TEXT INFO
        window.util.fillDetalization('dns-summary', dnsInfo);
        window.util.fillDetalizationLinks('dns-summary', [dnsInfo.ZoneFileLink]);
        window.drawDetalizationTabTables( dnsInfo, t.config, t.filterConfig);
        if (linkTomonitoringTasksElem) {
          linkTomonitoringTasksElem.href += '&StateTask=';
        }

        monitoringBlock.classList.add('main-list__info--active');
        monitoringBlock.classList.remove('loading', 'loading--full');
      }, 100);
    },
    tabs: {
      config: {
        Records: ['Type', 'Description', 'StateTitle', 'TTL']
      },
      filterConfig: [
        { name: 'state', value: 'New' },
        { name: 'state', value: 'Busy' },
        { name: 'state', value: 'Deleted' },
        { name: 'state', value: 'Deleting' }
      ],
      limit: 50, // number of items to show. If more, we show button "To all results"
    },
    
  },
  
  init: function () {
    window.util.makeCorrectUrl('');
    this.filter.init();
    this.list.load();
  }
}
Dns.init();