$(function () {
  var date = new Date();
  var month = date.getMonth() + 1;
  var monthBilling = Number($('.bd__trigger').eq(0).attr('data-onecloud-month'));

  $('[data-toggle="tooltip"]').tooltip();

  $('body').on('click', '.bd__trigger', function (e) {
    e.preventDefault();
    var url,
      queryPrefix = (urlDay.indexOf('?') > -1) ? '&' : '?',
      defaultQuery = 'year=' + $(this).attr('data-onecloud-year') + '&month=' + $(this).attr('data-onecloud-month') + '&day=' + $(this).attr('data-onecloud-day'),
      level = $(this).attr('data-onecloud-level'),
      blockCollapse = $(this).parentsUntil('.bd__row').parent().find('[class*="-list"]:first'),
      trigger = $(this);

    if ($(blockCollapse).children().length != 0) {
      toggleAction(trigger, blockCollapse);
    } else {
      $(blockCollapse).html('<img alt="" src="/Content/img/progress.gif" class="bd__progress">');
      toggleAction(trigger, blockCollapse);

      switch (level) {
        case '1':
          url = urlDay + queryPrefix + defaultQuery;
          break;
        case '2':
          url = getUrlForEntity(trigger);
          break;
      }

      if (typeof url !== 'undefined' && url != '') {
        $.get(url)
          .done(function (data) {
            if (data != '') {
              $(blockCollapse).html(data);
              if ($(blockCollapse).find('.bd__hours-list').length > 0 && month - monthBilling > 1) {
                removeHoursDetalization($(blockCollapse));
              }
            } else {
              $(blockCollapse).html('<span class="text-danger">' + resources.ErrorMsg_NoInfo + '</span>');
            }
          })
          .fail(function () {
            $(blockCollapse).html('<span class="text-danger">' + resources.ErrorMsg_RequestCantProcess + '</span>');
          });
      } else {
        $(blockCollapse).html('<span class="text-danger">' + resources.ErrorMsg_NoInfo + '</span>');
      }
    }

    function getUrlForEntity(trig) {
      var resultUrl = 'entityPath&entityParamId=';
      var resultId = 0;
      var resultObj = {};
      var prefix = '';


      for (var key in billingConfig) { // billingConfig is defined in BillingDetalization view
        if (trig.data('onecloud-' + key) !== 0) {
          resultId = trig.data('onecloud-' + key);
          resultObj = billingConfig[key];
          break;
        }
      }

      if (resultId === 0) {
        return '';
      }

      resultUrl = resultUrl.replace('entityPath', resultObj.link).replace('entityParam', resultObj.getParam);
      resultUrl += resultId;
      prefix = (resultUrl.indexOf('?') > -1) ? '&' : '?';
      resultUrl += (prefix + defaultQuery);
      return resultUrl;
    }

    function toggleAction(toggleTrigger, toggleBlock) {
      $(toggleTrigger).toggleClass('bd__trigger--active');
      $(toggleBlock).slideToggle();
    }
    function removeHoursDetalization(block) {
      block.find('.bd__trigger--daily').remove();
      block.find('.bd__hours-list').remove();
      block.find('.bd__trigger[data-onecloud-imid != 0]').css('visibility', 'hidden');
    }

  });
});