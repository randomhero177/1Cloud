var grid = $("#ssl-ordered-list").bootgrid({
  labels: {
    noResults: resources.Server_List_BootGrid_NoResults,
    search: resources.Server_List_BootGrid_Search,
    all: resources.Server_List_BootGrid_All,
    infos: resources.Server_List_BootGrid_Showing + ' {{ctx.start}} ' + resources.Server_List_BootGrid_To + ' {{ctx.end}} ' + resources.Server_List_BootGrid_Of + ' {{ctx.total}} ' + resources.SSL_List_BootGrid_Certificates
  },
  formatters: {
    "image": function (column, row) {
      return '<a href="' + $.trim(row.link) + '" class="' + row.imagefamily + '"></a>';
    },
    "previous": function (column, row) {
      if (row.sslItems > 1) {
        var prevIcon = '<span class="ssl-ordered__previous-btn glyphicon glyphicon-menu-hamburger" title="' + resources.Ssl_previous_certificates + '" data-row-id="' + row.id + '"></span>',
          prevBlock = '<div class="ssl-ordered__details-wrap"><div class="ssl-ordered__details panel panel-default hidden"><ul class="list-group"></ul></div></div>';
        return prevIcon + prevBlock
      }
    },
    "nameWithLink": function (column, row) {
      return '<a href="' + $.trim(row.link) + '">' + row.cert + '</a>';
    },
    "domain": function (column, row) {
      return '<a href="' + $.trim(row.link) + '" title="' + row.cert + '"><span class="ssl__status ssl__status--' + row.state + '" title="' + row.stateTitle + '"></span>' + row.domain + '</a>';
    },
    "datetime": function (column, row) {
      function setLeadingZero(value) {
        var result = (value < 10) ? '0' + value : value;
        return result;
      }
      var dateVal = new Date(Number(row.dateCreate));
      return setLeadingZero(dateVal.getDate()) + '.' + setLeadingZero(dateVal.getMonth() + 1) + '.' + dateVal.getFullYear();
    }, 
    "dateEnd": function (column, row) {
      function setLeadingZero(value) {
        var result = (value < 10) ? '0' + value : value;
        return result;
      };
      if (row.end == '') {
        return 
      } else {
        var dateVal = new Date(Number(row.end));
        return setLeadingZero(dateVal.getDate()) + '.' + setLeadingZero(dateVal.getMonth() + 1) + '.' + dateVal.getFullYear();
      };
    }
  }
}).on("loaded.rs.jquery.bootgrid", function () {
  $('#grid-over-table').removeClass('loading loading--full loading--nontransparent loading--top loading--big');

  grid.find(".ssl-ordered__previous-btn").on("click", function (e) {
    e.stopPropagation();

    var currentId = $(this).data("row-id"),
      parentBlock = $(this).parent(),
      list = parentBlock.find('.list-group'),
      details = parentBlock.find('.ssl-ordered__details'),
      prevCertArr = [];

    if (!details.hasClass('hidden')) {
      details.addClass('hidden');
      return;
    }

    $('.ssl-ordered__details').addClass('hidden');

    if (list.children().length === 0) {
      prevCertArr = modelArr.filter(function (el) {
        return el[el.length - 1].Id == currentId;
    })[0].filter(function (el) {
      return el.Id != currentId;
    });

      drawPrevCerts(currentId, prevCertArr);
    };

    details.removeClass('hidden');
  });
  grid.find('tr').on('click', function (e) {
    $('.ssl-ordered__details').addClass('hidden');
  });
});

$('#container').click(function (e) {
  $('.ssl-ordered__details').addClass('hidden');
});

function drawPrevCerts(curId, arr) {
  var curBlock = $('[data-row-id="' + curId + '"]').find('.ssl-ordered__details .list-group'),
    listHeadlight = $('<div/>', {
      'class': 'panel-heading'
    }),
    boldText = $('<strong/>', {
      text: resources.Ssl_previous_certificates
    });

  listHeadlight.append(boldText);
  curBlock.parent().prepend(listHeadlight);

  arr.forEach(function (el) {
    curBlock.append(getPrevCert(el));
  });
};

function getPrevCert(obj) {
  var dateRegExp = /\(([^)]+)\)/;
  var orderDate = '',
    expireDate = '';
  if (obj.OrderDate !== null) {
    orderDate = dateRegExp.exec(obj.OrderDate);
    orderDate = new Date(parseInt(orderDate[1]));
    orderDate = ("0" + orderDate.getDate()).slice(-2) + '.' + ("0" + (orderDate.getMonth() + 1)).slice(-2) + '.' + orderDate.getFullYear();
  };
  if (obj.ExpireDate !== null) {
    expireDate = dateRegExp.exec(obj.ExpireDate);
    expireDate = new Date(parseInt(expireDate[1]));
    expireDate = ("0" + expireDate.getDate()).slice(-2) + '.' + ("0" + (expireDate.getMonth() + 1)).slice(-2) + '.' + expireDate.getFullYear();
  };

  var curRow = $('<li/>', {
    'class': 'ssl-ordered__previous-row list-group-item'
  }),
    curState = $('<span/>', {
      'class': 'ssl__status ssl__status--' + obj.State
    }),
    curLink = $('<a/>', {
      href: '/ssl/' + obj.Id,
      text: obj.ProductName
    }),
    orderExpireText = (obj.ExpireDate !== null) ? 'дата заказа: ' + orderDate + ', дата окончания: ' + expireDate : 'дата заказа: ' + orderDate,
    orderExpireSmall = $('<small/>', {
      text: orderExpireText
    }),
    orderExpireBlock = $('<div/>', {});
  orderExpireBlock.append(orderExpireSmall);
  curRow.append(curState);
  curRow.append(curLink);
  curRow.append(orderExpireBlock);

  return curRow;
}