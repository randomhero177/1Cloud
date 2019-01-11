'use strict';

var Analytics = {
  config: {
    layoutId: 'analytics-layout',
    filterFormId: 'analytics-filter',
    currentCurrency: 'RUB',
    tabsBlockId: 'detalization-tabs'
  },
  filter: {
    obj: {},
    config: {},
    submit: function () {
      Analytics.list.load();
    },
    init: function () {
      this.obj = new Filter(Analytics.config.filterFormId, this.submit);
      this.obj.init();
      this.config.form = document.getElementById(Analytics.config.filterFormId);
      initMonthpicker();

      function initMonthpicker() {
        var form = document.getElementById(Analytics.config.filterFormId),
          inputMonth = form.querySelector('[name="Filter.Month"]'),
          inputYear = form.querySelector('[name="Filter.Year"]'),
          typeBlock = $('#date-and-type-select'),
          filterPeriodType = $('[name="Filter.PeriodType"]'),
          yearTable = $('#custom-year-calendar'),
          yearsToPick = yearTable.find('span.pointer-cursor');
        $("#inlineMenu").monthpicker({
          changeYear: false,
          stepYears: 1,
          dateFormat: 'MM yy',
          prevText: '<i class="fa fa-chevron-left"></i>',
          nextText: '<i class="fa fa-chevron-right"></i>',
          onSelect: function (input, inst) {
            inputMonth.value = inst.selectedMonth + 1;
            inputYear.value = inst.selectedYear;
            $("#monthpicker").val($.monthpicker.formatDate('MM yy', new Date(window.util.getTwoDigitsDate(Number(inputMonth.value)) + '/01/' + inputYear.value)));
            filterPeriodType.val(0);
            typeBlock.addClass('hidden');
          }
        });

        yearsToPick.click(function (e) {
          e.preventDefault();
          var curYear = parseInt($(this).data('year'));

          yearsToPick.removeClass('ui-state-default ui-state-highlight ui-state-active');
          $(this).addClass('ui-state-default ui-state-highlight ui-state-active');
          typeBlock.addClass('hidden');

          inputYear.value = curYear;
          $("#monthpicker").val(curYear);
          filterPeriodType.val(1);
        })

        $('#main-content').click(function (e) {
          typeBlock.addClass('hidden');
        });

        $('#monthpicker-block').click(function (e) {
          e.stopPropagation();
          typeBlock.removeClass('hidden');
        });
      }
    }
  },
  list: {
    load: function (action) {
      var activeSection = (typeof action != 'undefined') ? action : $('#analytics-list-headers .active a').data('action');
      document.getElementById(Analytics.config.tabsBlockId).parentNode.classList.add('loading', 'loading--full');
      $.get(activeSection, Analytics.filter.obj.getFilterObj(), function (data) {
        if (activeSection == 'Consumptions') {
          Analytics.list.drawConsumptionsTabs(data);
        } else {
          Analytics.list.drawCurTables(data);
        }
        document.getElementById(Analytics.config.tabsBlockId).parentNode.classList.remove('loading', 'loading--full');
      }).fail(function (data) {
        console.log('Error getting payments');
        handleAjaxErrors(data, '#' + Analytics.config.filterFormId);
        document.getElementById(Analytics.config.tabsBlockId).parentNode.classList.remove('loading', 'loading--full');
      });
      
    },
    drawCurTables: function (data) {
      var activeParentTab = $('#parent-tabs > .active'),
        tabsToFill = activeParentTab.find('.tab-content .tab-pane'),
        isByMonth = ($('[name="Filter.PeriodType"]').val() == 0) ? true : false;

      tabsToFill.each(function () {
        var curKey = $(this).data('key');

        if (typeof curKey != 'undefined') {
          var curConfig = Analytics.item.itemTabsConfig[curKey];
          var keysConf = Object.keys(curConfig),
            noInfoCounter = 0,
            curBlock = $('[data-key="' + curKey + '"]');

          curBlock.find('.detalization-no-info').addClass('hidden');
          keysConf.forEach(function (el) {
            if (data[curKey] !== null & typeof data[curKey] !== 'undefined' && data[curKey][el] && data[curKey][el].length > 0) {
              curBlock.find('table[data-id="' + el +'"], .detalization-info').removeClass('hidden');
              window.drawDetalizationTabTables(data[curKey], curConfig, null, curKey);
              var aggregatesElem = document.querySelector('[data-key="' + curKey + '"] .aggregates');
              if (aggregatesElem) {
                window.util.fillDetalization('', data[curKey], aggregatesElem);
              }
            } else {
              ///NO DATA
              curBlock.find('table[data-id="' + el + '"]').addClass('hidden');
              noInfoCounter++;
              if (noInfoCounter == keysConf.length) {
                curBlock.find('.detalization-no-info').removeClass('hidden');
                curBlock.find('.detalization-info').addClass('hidden');
              } 
            }
            Analytics.list.roundAllnumbersInNode(document.querySelector('[data-key="' + curKey + '"]'), 'monthpaymentssum');
          })
          
        }
      });
    },
    drawConsumptionsTabs: function (data) {
      var isByMonth = ($('[name="Filter.PeriodType"]').val() == 0) ? true : false,
        tabs = document.querySelectorAll('#tab15_3 .tab-content .tab-pane'),
        tables = document.querySelectorAll('#tab15_3 .tab-content .tab-pane table'),
        blockWrap = document.getElementById('consumption-block');

      [].forEach.call(tables, function (table) {
        table.classList.add('hidden');
      })
      if (isByMonth) {
        drawConsumptionByMonth()
      } else {
        drawConsumptionByYear()
      };

      setCorrectCurrency(blockWrap, data.Currency);
      roundAllnumbersInNode(blockWrap);
      function drawConsumptionByMonth() {
        [].forEach.call(tabs, function (el, i) {
          var curService = el.dataset.key,
            table = el.querySelector('table[data-filter="month"]'),
            tbody = table.querySelector('tbody'),
            row = tbody.querySelectorAll('tr'),
            aggregate = table.querySelector('.aggregates');
          table.classList.remove('hidden');
          row.forEach(function (el) {
            var period = el.dataset.period;
            if (data[period]) {
              el.classList.remove('hidden');
              window.util.fillDetalization('', data[period][curService], el);
            } else {
              el.classList.add('hidden');
            }
          });
          if (aggregate) {
            window.util.fillDetalization('', data['ConsumptionGroupSummary'][curService], aggregate);
          };
        })
      }

      function drawConsumptionByYear() {
        [].forEach.call(tabs, function (el, i) {
          var curService = el.dataset.key,
            table = el.querySelector('table[data-filter="year"]'),
            tbody = table.querySelector('tbody'),
            curType = table.dataset.type,
            aggregate = table.querySelector('.aggregates');
          table.classList.remove('hidden');
          if (curType == 'ConsumptionByMonth') {
            while (tbody.firstChild) {
              tbody.removeChild(tbody.firstChild)
            };
            if (data[curType].length > 0) {
              var itemTemplate = document.getElementById('consumptions-template-year').content;
              data[curType].forEach(function (el) {
                var item = itemTemplate.cloneNode(true),
                  curData = el[curService];
                window.util.fillDetalization('', curData, item);
                tbody.appendChild(item);
              });
              if (aggregate) {
                window.util.fillDetalization('', data['ConsumptionGroupSummary'][curService], aggregate);
              };
            }
          } else {
            var row = tbody.querySelector('tr'),
              period = row.dataset.period;
            window.util.fillDetalization('', data[period][curService], row);
          };

        })
      };
      function roundAllnumbersInNode(node) {
        if (node) {
          let elems = node.querySelectorAll('.price');
          [].forEach.call(elems, function (el) {
            let num = (el.textContent === '') ? 0 : Math.floor(parseFloat(el.textContent));
            el.textContent = num.toLocaleString();
          });
        }
      }
      function setCorrectCurrency(block, currency) {
        let node = (block) ? block : document;
        [].forEach.call(node.querySelectorAll('.price'), function (el) {
          el.removeAttribute('class');
          el.setAttribute('class', 'price price--' + currency.toLowerCase());
        });
      }
    },
    roundAllnumbersInNode: function (node, itemClass) {
      if (node) {
        let elems = node.querySelectorAll('.' + itemClass);
        [].forEach.call(elems, function (el) {
          let num = (el.textContent === '') ? 0 : Math.floor(parseFloat(el.textContent));
          el.textContent = num.toLocaleString();
        });
      }
    }
  },
  item: {
    itemTabsConfig: {
      'Registrations': {
        'Statistics': [
          'Period', 'RegistrationCount', 'TestBalanceCount'
        ]
      },
      'Referrals': {
        'Statistics': [
          'Period', 'ReferralCount'
        ]
      },
      'LeftCustomers': {
        'Customers': [
          'Id', 'Email', 'Channel', 'Balance', 'LeftDate', 'TwoMonthPaymentsSum', 'AllPaymentsSum'
        ],
        'Statistics': ['Period', 'CustomerCount', 'TwoMonthPaymentsSum']
      },
      'NewPayCustomers': {
        'Statistics': ['Period', 'CustomerCount', 'MonthPaymentsSum'],
        'Customers': ['Id', 'Email', 'Channel', 'Balance', 'MonthPaymentsSum', 'RegistrationDate'],
      },
      'ReturnedCustomers': {
        'Customers': [
          'Id', 'Email', 'Channel', 'Balance', 'ReturnDate', 'TwoMonthPaymentsSum', 'AllPaymentsSum'
        ],
        'Statistics': ['Period', 'CustomerCount', 'TwoMonthPaymentsSum']
      },
      'Servers': {
        'Statistics': [
          'Period', 'CreatedCount', 'DeletedCount'
        ]
      },
      'Ssl': {
        'Statistics': [
          'Period', 'CreatedCount', 'ActivatedCount', 'ExpiredCount'
        ]
      },
      'PrivateNetworks': {
        'Statistics': [
          'Period', 'CreatedCount', 'DeletedCount'
        ]
      },
      'PublicNetworks': {
        'Statistics': [
          'Period', 'CreatedCount', 'DeletedCount'
        ]
      },
      'Dns': {
        'Statistics': [
          'Period', 'CreatedCount', 'DelegatedCount', 'DeletedCount'
        ]
      },
      'Storages': {
        'Statistics': [
          'Period', 'ActivatedCount', 'DeactivatedCount'
        ]
      },
      'Monitoring': {
        'Statistics': [
          'Period', 'HostsCreatedCount', 'HostsDeletedCount', 'MetricsCreatedCount', 'MetricsDeletedCount'
        ]
      },

      'CurrentMonth': [
        'Period', 'AvgPerDay', 'AvgPerHour', 'Total'
      ],
      'PreviousMonth': [
        'Period', 'AvgPerDay', 'AvgPerHour', 'Total'
      ]
    },
    buttonsListener: function () {
      var btns = $('.get-analytics-btn');
      btns.click(function (e) {
        Analytics.list.load($(this).find('a').data('action'));
      });
    }
  },
  init: function () {
    this.filter.init();
    this.list.load();
    this.item.buttonsListener();
  }
}

Analytics.init();