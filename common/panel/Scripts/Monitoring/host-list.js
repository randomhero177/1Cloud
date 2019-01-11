

var HostList = {
  config: {
    forceCheckBtn: '.js-force-check',
    listId: '#host-list',
    listItem: '.monitoring__list-item',
    stateIcon: '.monitoring__icon-state',
    itemDate: '.monitoring__item-date',
    switchItem: '.monitoring__item-connection-inp'
  },
  view: {
    initBootgrid: function () {
      var grid = $("#grid").bootgrid({
        selection: false,
        labels: {
          noResults: resources.noResults,
          search: resources.search,
          all: resources.all,
          infos: resources.infos_showing + ' {{ctx.start}} ' + resources.infos_bootGridTo + ' {{ctx.end}} ' + resources.infos_bootGridOf + ' {{ctx.total}} ' + resources.infos_hosts
        },
        formatters: {
          'status': function (column, row) {
            var elem = ($.trim(row.hasFailedMetrics) == 'True') ? '<span class="monitoring__icon-status status status--' + $.trim(row.status) + ' status--warning"></span>' : '<span class="monitoring__icon-status status status--' + $.trim(row.status) + '"></span>';
            return elem;
          },
          'name': function (column, row) {
            var elem = '<a href="' + $.trim(row.link) + '">' + $.trim(row.name) + '</a>';
            return elem
          },
          'refresh': function (column, row) {
            var elem = '<span class="monitoring__icon-state monitoring__icon-state--block monitoring__icon-state--refresh js-force-check pull-right" title="Обновить статус" data-id="' + $.trim(row.hostId) + '" data-url="' + $.trim(row.refreshLink) + '" data-name="' + $.trim(row.name) + '"></span>';
            return elem
          }
        }
      }).on("loaded.rs.jquery.bootgrid", function () {
        var c = HostList.config;
        forceCheck($(c.forceCheckBtn), '.monitoring__icon-status', c.listId.replace('#', ''), 'tr', function (data) {
          console.log(data);
        });
        $('#grid-over-table').removeClass('loading loading--full loading--nontransparent loading--top loading--big');
      });
    },
    enableHost: function (elem) {
      var c = HostList.config,
        input = elem.siblings(c.switchItem);
      sendAjaxRequest(c.listId, input.data('url'), { IsEnabled: input.is(':checked') }, function (data) {
        elem.parents(c.listItem).addClass('loading loading--full');
        setTimeout(function () {
          elem.parents(c.listItem).removeClass('loading loading--full');
          let enabledText = (input.is(':checked')) ? 'подключен к услуге Мониторинг' : 'отключен от услуги Мониторинг',
            showNotice = new PanelNotice('Хост ' + input.data('name') + ' ' + enabledText, 'success');
        }, 3000);
      });
    },
    disableCheck: function (elem) {
      var row = elem.closest(HostList.config.listItem),
        block = row.find(HostList.config.stateIcon),
        input = elem.siblings(HostList.config.switchItem);
      if (input.is(':checked')) {
        block.removeClass('monitoring__form-disabled')
      } else {
        block.addClass('monitoring__form-disabled')
      }
    }
  },
  init: function () {
    var c = HostList.config;
    $(c.switchItem).each(function (i, el) {
      initItemSwitch($(el), 'connected', function () {
        HostList.view.enableHost($(this));
        HostList.view.disableCheck($(this));
      }, '', '');
    });
    HostList.view.initBootgrid();
    
  }
}

HostList.init()