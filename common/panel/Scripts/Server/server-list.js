$(function () {
  var gridStorageTestId = $('#grid th').eq(0).attr('data-column-id');

  if (localStorage[gridStorageTestId] == undefined) {
    $('#grid th').each(function () {
      localStorage.setItem($(this).attr('data-column-id'), ($(this).attr('data-visible') == 'false') ? 'false' : 'true');
    });
  } else {
    $('#grid th').each(function () {
      $(this).attr('data-visible', localStorage[$(this).attr('data-column-id')]);
    });
  }

  var grid = $("#grid").bootgrid({
    selection: false,
    labels: {
      noResults: resources.noResults,
      search: resources.search,
      all: resources.all,
      infos: resources.infos_showing + ' {{ctx.start}} ' + resources.infos_bootGridTo + ' {{ctx.end}} ' + resources.infos_bootGridOf + ' {{ctx.total}} ' + resources.infos_servers
    },
    formatters: {
      "image": function (column, row) {
        return '<a href="' + $.trim(row.link) + '" title="' + $.trim(row.image) + '"><span class="server__icon server__icon--' + $.trim(row.osfamily) + '"></span></a>';
      },
      "addInfo": function (column, row) {
        var result = "";
        if (row.isHigh == 1) {
          result = "<div class='text-center small-text badge badge--high'><span>HIGH</span></div>";
        } else {
          result = "<div class='text-center small-text badge'><span>BASE</span></div>";
        };
        if (row.isSsd == 1) {
          result = "<div class='text-center small-text badge badge--high'><span>SSD</span></div>";
        };
        if (row.isSsd == 1 && row.isHigh == 1) {
          result = "<div class='text-center small-text badge badge--high'><span>HIGH</span>, <span>SSD</span></div>";
        };
        if (row.ActionOn == 1) {
          result += '<div class="server-action"><p class="server-action__txt">АКЦИЯ</p><p class="server-action__hid-txt">Этот сервер участвует в акции «Высокопроизводительный пул по цене базового». Подробности уточняйте в службе поддержки.</p></div>';
        }
        return result;
      },
      "name": function (column, row) {
        var ispower = "power-true";
        if (row.isPowerOn == 0) {
          ispower = "power-false";
        }
        
        return "<div class=\"server-name with-sup-text\"><span class='" + ispower + "'><a class='power-text' href=\"" + $.trim(row.link) + "\">" + $.trim(row.name) + "</a></span></div>";
      },
      "datetime": function (column, row) {
        function setLeadingZero(value) {
          var result = (value < 10) ? '0' + value : value;
          return result;
        }
        var dateVal = new Date(Number(row.dateCreate));
        return setLeadingZero(dateVal.getDate()) + '.' + setLeadingZero(dateVal.getMonth() + 1) + '.' + dateVal.getFullYear() + ' ' + setLeadingZero(dateVal.getHours()) + ':' + setLeadingZero(dateVal.getMinutes()) + ':' + setLeadingZero(dateVal.getSeconds());
      },
      "disk": function (column, row) {
        return (row.disk).toLocaleString() + ' ' + resources.infos_GB;
      },
      "ram": function (column, row) {
        var ramVal = Number(row.ram);
        if (ramVal < 1000) {
          return ramVal + ' ' + resources.infos_MB;
        } else {
          return ramVal / 1024 + ' ' + resources.infos_GB;
        }
      },
      "state": function (column, row) {
        var state = '<div class="instance__state">' + row.state + '</div>';
        return state
      },
      "ip": function (column, row) {
        var ip = row.ip,
          ipHtml = ip.replace(/,/gi, '<br />').replace('#startstrong#', '<strong>').replace('#endstrong#', '</strong>');
        return ipHtml
      }
    }
  })
    .on('loaded.rs.jquery.bootgrid', function () {
      $('#grid-over-table').removeClass('loading loading--full loading--nontransparent loading--top loading--big');
    });

  $('#grid-header').find('.actions .dropdown:last-of-type .dropdown-menu li').each(function () {
    var checkbox = $(this).find('[type=checkbox]'),
      name = checkbox.attr('name');
    checkbox.on('change', function () {
      localStorage.setItem(name, checkbox.prop('checked'));
      checkedItems($('.actions .dropdown:last-of-type .dropdown-menu input:checkbox:checked'), $('#grid'));

    });
  });

  if (localStorage.getItem('activeDropNum')) {
    $('.actions .dropdown:first-child .dropdown-menu').find('[data-action="' + localStorage.getItem('activeDropNum') + '"]').click();
  };
  $('.actions .dropdown:first-child .dropdown-menu li').on('click', function (e) {
    var dataAction = $(this).find('a').attr('data-action');
    localStorage.setItem('activeDropNum', dataAction);
  });
  function checkedItems(checkedInput, table) {
    if (checkedInput.length > 7) {
      table.addClass('layout-init');
      $('#grid-over-table').addClass('overflow-auto');
    } else {
      table.removeClass('layout-init');
      $('#grid-over-table').removeClass('overflow-auto');
    }
  }
  checkedItems($('.actions .dropdown:last-of-type .dropdown-menu input:checkbox:checked'), $('#grid'));
});