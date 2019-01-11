/*
** Requires an outer variables:
** 1) @string sslLinkBasic - base ssl-order url, to which we will add an ID of a product
** 2) @obj sslProductList - object with all of our certificates
*/

$(function() {
  if ($('#helper').length > 0) {
    var helper = new Helper({
      delay: 1000,
      cb: initializeSslGuide
    });
    helper.init();
  }

  function initializeSslGuide() {
    var guide = new Guide({
      arrows: 'only-backward',
      altNextClass: '.guide__choose',
      altNextEqualHeights: true,
      altNextFunction: storeSslOption,
      result: true,
      resultContainerClass: '.guide__result',
      resultFunction: showSslHelperResult
    });
    guide.init();

    var resultGuideBlock = document.querySelector('.guide__result'),
      resultTitle = resultGuideBlock.querySelector('.guide__title'),
      resultTitleText = resultTitle.innerHTML,
      resultContainer = resultGuideBlock.querySelector('.guide__item-content'),
      resultTpl = document.getElementById('ssl-guide-result-tpl'),
      resultTplContainer = 'content' in resultTpl ? resultTpl.content : resultTpl;

    var sslArrayToFilter = new Array();
    fillSslSortArray(sslProductList, sslArrayToFilter);
    sslArrayToFilter.sort(function (a, b) {
      return a.price - b.price;
    });

    /*
    ** Writes SSL options to sessionStorage (cookies)
    ** @object obj - chosen ssl helper guide item
    */
    function storeSslOption (obj) {
      var dataOptions = Object.keys(obj.dataset);
      for (var i = 0; i < dataOptions.length; i++) {
        if (obj.dataset[dataOptions[i]] !== '') {
          if (storageAvailable('sessionStorage')) {
            sessionStorage.setItem(dataOptions[i], obj.dataset[dataOptions[i]]);
          } else {
            setCookie(dataOptions[i], obj.dataset[dataOptions[i]]);
          }
        }
      }
    }

    /*
    ** Makes an array with useful params only, which we will use for filtering
    ** @object obj - basic object of all certificates
    ** @array arr - array for further filtering
    */
    function fillSslSortArray (obj, arr) {
      for (var i = 0; i < obj.length; i++) {
        arr.push({
          index: i,
          price: obj[i].Prices[0].PriceDetail.Amount,
          name: obj[i].Name,
          isWild: obj[i].IsWildCard,
          isSan: obj[i].IsSan,
          isEv: obj[i].IsEv,
          isOrg: obj[i].IsOrganizationValidation
        });
      }
    }

    /*
    ** Returns an array of three indexes of ssl-objects: cheapest, middle, most expensive
    ** @string type - type of validation (domain, org)
    ** @string option - option of validation (wild, san or ev)
    */
    function getSslVariants (type, option) {
      var filteredArr = sslArrayToFilter.filter(function (elem, i, arr) {
        return filterSslByParam(type, elem);
      }).filter(function (elem, i, arr) {
        return filterSslByParam(option, elem);
      });

      if (filteredArr.length > 3) {
          return [
            filteredArr[0].index,
            filteredArr[Math.floor(filteredArr.length / 2) - 1].index,
            filteredArr[getHighestSslPrice(filteredArr.length)].index
          ];
      } else if (0 < filteredArr.length && filteredArr.length <= 3) {
          return filteredArr.map(function (elem) {
              return elem.index;
          });
      } else {
          return 'Точного совпадения по заданным критериям<br/>не найдено.';
      }
      
      function filterSslByParam (opt, elem) {
        switch (opt) {
          case 'domain':
            return !(elem.isOrg || elem.isEv);
          case 'org':
            return elem.isOrg;
          case 'wild':
            return elem.isWild;
          case 'san':
            return elem.isSan;
          case 'none':
            return !(elem.isWild || elem.isSan);
          case 'ev':
            return elem.isEv;
          default:
            return true;
        }
      }
    }

    /*
    ** Rerurns index of ssl-certificate with custom highest price
    ** @number arrLength - length of result ssl-certificates array
    */
    function getHighestSslPrice (arrLength) {
      return Math.floor(arrLength / 2) + Math.floor(arrLength / 4);
    }

    /*
    ** Fills and shows Ssl result block in helper. If there are no results, then we show text with "try again"
    */
    function showSslHelperResult () {
      var resultSsl;
      if (storageAvailable('sessionStorage')) {
          resultSsl = getSslVariants(sessionStorage.getItem('type'), sessionStorage.getItem('option'));
          sessionStorage.removeItem('type');
          sessionStorage.removeItem('option');
      } else {
          resultSsl = getSslVariants(getCookie('type'), getCookie('option'));
          deleteCookie('type');
          deleteCookie('option');
      }

      if (Array.isArray(resultSsl)) {
        resultTitle.innerHTML = resultTitleText;
        for (var i = 0; i < resultSsl.length; i++) {
          appendSslResultItem(sslProductList[resultSsl[i]], resultContainer);
        }
      } else {
          var restartHelperBtn = document.createElement('button');
          restartHelperBtn.classList.add('btn', 'btn-primary');
          restartHelperBtn.textContent = 'Задать новые параметры';
          restartHelperBtn.onclick = function () {
              guide.restart();
              resultContainer.innerHTML = '';
          };

          resultTitle.innerHTML = resultSsl;
          resultContainer.appendChild(restartHelperBtn);
      }
    }

    /*
    ** Appends result element to result block
    ** @obj elem - element of basic Ssl-certificates list
    ** @obj block - object, where element will be appended to
    */
    function appendSslResultItem (elem, block) {
      var resultItem = resultTplContainer.querySelector('.services__item').cloneNode(true),
        resultLink = sslLinkBasic.replace('0', elem.Id);
      resultItem.querySelector('.services__title').textContent = elem.Name;
      resultItem.querySelector('.services__header').classList.add('vendor--' + elem.Vendor);
      resultItem.querySelector('.services__header').setAttribute('href', resultLink);
      resultItem.querySelector('.ssl-guide-price').textContent = elem.Prices[0].PriceDetail.Amount.toLocaleString();
      resultItem.querySelector('.services__btn').setAttribute('href', resultLink);

      block.appendChild(resultItem);
    }
  }
});
