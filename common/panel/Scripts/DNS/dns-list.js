var grid = $("#dns-ordered-list").bootgrid({
  labels: {
    noResults: resources.Server_List_BootGrid_NoResults,
    search: resources.Server_List_BootGrid_Search,
    all: resources.Server_List_BootGrid_All,
    infos: resources.Server_List_BootGrid_Showing + ' {{ctx.start}} ' + resources.Server_List_BootGrid_To + ' {{ctx.end}} ' + resources.Server_List_BootGrid_Of + ' {{ctx.total}} ' + resources.Dns_List_BootGrid_domain
  },
  formatters: {
    "htmlLink": function (column, row) {
      return '<a href="' + $.trim(row.link) + '">' + $.trim(row.htmlLink) + '</a>';
    },
    "icon": function (column, row) {
      return '<span class="' + $.trim(row.iconEl) + '" title="' + $.trim(row.iconTitle) + '"></span>';
    },
    "actions": function (column, row) {
      var elem = ($.trim(row.actions) == "New") ? '<text><span class="dns__item-inprogress">' + resources.DNS_List_StateCreateion + '</span></text>' : '<a class="btn-delete dns__domain-delete" title="' + resources.DNS_BtnDelete + '" href="' + $.trim(row.deleteLink) + '"></a>';
      return elem
    }
  }
}).on("loaded.rs.jquery.bootgrid", function () {
  $('#grid-over-table').removeClass('loading loading--full loading--nontransparent loading--top loading--big');

  grid.find(".dns__domain-delete").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    let domainBlock = $(this).parent();
    let confirm = new ConfirmPopup({
      text: gloss.textDomainConfirmDeleting,
      cbProceed: function () {
        deleteDNSDomain(domainBlock);
      }
    });

    function deleteDNSDomain(deleteDomainBlock) {
      var deleteDomainLink = deleteDomainBlock.find('.dns__domain-delete').attr('href');
      deleteDomainBlock.addClass('loading loading--full');

      sendAjaxRequest('#domains-list', deleteDomainLink, {}, function (data) {
        setTimeout(function () {
          deleteDomainBlock.parent().removeClass('dns__domain loading loading--full');
          deleteDomainBlock.parents('tr').remove();

          let notice = new PanelNotice(gloss.textDomainDeleted, 'success');

          if (grid.find('tbody tr').length < 1) {
            setTimeout(function () {
              $('#dns-ordered-list, #dns-ordered-list-footer, #dns-ordered-list-header').remove();
              $('#dns__no-domains').removeClass('hidden');
            }, 3000);
          }
        }, 3000);
      });
    }
  });
});