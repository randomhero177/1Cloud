/*
* DRAWING TABS
* important to give proper data-id to an element in html. Same as name of an object, which is gonna be used
* @blockDataKey - string. Use in case whith multiple tables with same data-id
*/
(function initTabTables() {

  function drawDetalizationTabTables(data, config, filterConfig, blockDataKey) {
    var tabsBlock = document.getElementById('detalization-tabs');
    Object.keys(config).forEach(function (item) {
      if (tabsBlock.querySelector('[data-id="' + item + '"]') === null) {
        return;
      }
      var curTable = (typeof blockDataKey === 'undefined') ? tabsBlock.querySelector('[data-id="' + item + '"]') : tabsBlock.querySelector('[data-key="' + blockDataKey + '"] [data-id="' + item + '"]');
      
      if (curTable === null || typeof data[item] === 'undefined') {
        return;
      }

      var curTableParent = curTable.parentNode,
        curTableHead = curTable.querySelector('thead'),
        curTableBody = curTable.querySelector('tbody'),
        curTableNoResults = curTableParent.querySelector('.tab-no-results'),
        curTableCheckBoxWrap = curTableParent.querySelector('.checkbox-custom-tabs');

      curTableBody.innerHTML = '';
      curTableHead.innerHTML = '';
      if (curTableNoResults !== null) {
        curTableParent.removeChild(curTableNoResults);
      }

      if (data[item].length === 0) {
        curTableParent.appendChild(getNoResultsBlock());
        if (curTableCheckBoxWrap) {
          curTableCheckBoxWrap.classList.add('hidden');
        };
        
      } else {
        curTableHead.appendChild(drawTableTh(config[item]));
        data[item].forEach(function (dataItem) {
          var curRow = getTableRow(dataItem, config[item]);

          curRow.dataset.state = dataItem['State'];

          if (typeof dataItem['SelfLink'] !== 'undefined') {
            if (item === 'servers') {
              appendSelfLink(dataItem['SelfLink'], curRow, 'instanceid', '&OnlyActive=false');
            } if (item === 'monitoring') {
              appendSelfLink(dataItem['SelfLink'], curRow, 'ipordomain');
            } else {
              appendSelfLink(dataItem['SelfLink'], curRow, 'id');
            }
          }

          curTableBody.appendChild(curRow);
        });

        if (curTable.parentNode.querySelector('.checkbox-custom-tabs') !== null && typeof filterConfig !== 'undefined') {
          initFilterCheckbox(curTable.parentNode, filterConfig);
        }
      }
    });
  }

  function getTableRow(dataObj, configArr) {
    var row = document.createElement('tr');

    configArr.forEach(function (item) {
      var td = document.createElement('td');
      var value = dataObj[item];

      if (typeof value === 'undefined' || value === null) {
        td.textContent = '-';
      } else if (typeof value === 'boolean') {
        td.textContent = window.util.convertBooleanToRussian(value);
      } else if (item.indexOf('Date') > -1) {
        td.classList.add('wh-s-no');
        td.textContent = window.util.formatDate(new Date(value));
      } else if (item.indexOf('Period') > -1) {
        td.innerHTML = value.replace(' ', '&nbsp;');
      } else {
        td.textContent = value;
      }

      td.classList.add(item.toLowerCase());
      row.appendChild(td);
    });
    return row;
  }

  function drawTableTh(arr) {
    let row = document.createElement('tr');
    row.className = 'bg-light';
    arr.forEach(function (item) {
      var th = document.createElement('th');
      th.textContent = window.util.translateToRussian(item);
      row.appendChild(th);
    });
    return row;
  }

  function appendSelfLink(link, row, className, additionalParam) {
    if (row.querySelector('.' + className) === null) {
      return;
    }

    var linkElem = document.createElement('a'),
      cell = row.querySelector('.' + className),
      add = (typeof additionalParam !== 'undefined') ? additionalParam : '';

    linkElem.href = link + add;
    linkElem.textContent = cell.textContent;
    cell.innerHTML = '';
    cell.appendChild(linkElem);
  }

  function initFilterCheckbox(block, filterArr) {
    let checkBoxWrap = block.querySelector('.checkbox-custom-tabs'),
      checkBox = checkBoxWrap.querySelector('[type="checkbox"]');

    if (checkFilterItems()) {
      addFilterCheckbox();
      filterTable(true);
    } else {
      removeFilterCheckbox();
    };

    function checkFilterItems() {
      let isFilterItems = false;
      filterArr.forEach(function (el) {
        isFilterItems = isFilterItems || (block.querySelector('[data-' + el.name + '="' + el.value + '"]') !== null);
      });
      return isFilterItems;
    }

    function addFilterCheckbox() {
      checkBoxWrap.classList.remove('hidden');
      checkBox.checked = true;
      checkBox.addEventListener('change', function (e) {
        filterTable(checkBox.checked);
      })
    }

    function removeFilterCheckbox() {
      checkBoxWrap.classList.add('hidden');
    }

    function filterTable(isChecked) {
      filterArr.forEach(function (el) {
        block.querySelectorAll('[data-' + el.name + '="' + el.value + '"]').forEach(function (item) {
          if (isChecked) {
            item.classList.add('hidden');
          } else {
            item.classList.remove('hidden');
          }
        });
      });
    }
  }

  function getNoResultsBlock() {
    var noResults = document.createElement('div');
    noResults.classList.add('alert', 'alert-info', 'text-center', 'tab-no-results');
    noResults.textContent = 'Нет элементов для отображения';

    return noResults;
  }

  window.drawDetalizationTabTables = drawDetalizationTabTables;
})();