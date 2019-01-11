'use strict';
var KEYCODE_ENTER = 13;
var KEYCODE_ESC = 27;

(function exportUtilMethods() {
  /*
   * Cleans all of html inside element
   * @DOMnode el - element to empty
   */
  function cleanInnerHtml(el) {
    if (typeof el !== 'undefined') {
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    }
  }

  /*
   * Returns an element with provided id and classes
   * @string tag - html tag to return, e.g. 'div'
   * @string classes - string of classes to be applied. Multiple classes must be divided by space
   * @string id - id of an element
   */
  function createDOMElement(tag, classes, id) {
    if (typeof tag !== 'string') {
      return;
    }

    var newElement = document.createElement(tag);

    classes.split(' ').forEach(function (el) {
      newElement.classList.add(el);
    });
    newElement.id = (typeof id !== 'undefined') ? id : '';

    return newElement;
  }

  /*
   * Checks if value is in range. If yes - returns value itself, if not - returns one of the provided boundary parameters
   * @number|string value
   * @number|string max - max range
   * @number|string min - min range
   */
  function checkValueRanges(value, max, min) {
    let result = +value;
    if (typeof max !== 'undefined' && +value > +max) {
      result = +max;
    }
    if (typeof min !== 'undefined' && +value < +min) {
      result = +min;
    }
    return result;
  }

  /*
   * Initiates simple XHR request to server. Defaults: on success - console.log(successText), on error - console.log(errorText)
   * @string url - url to send request
   * @object obj - object to send to server
   * @function cbSuccess - callback function to proceed actions with xhr.responseText
   * @function cbError - callback function to proceed actions with xhr.statusText
   * @string method - request method. Defaults: 'GET'
   */
  function createSimpleXHR(url, obj, cbSuccess, cbError, method) {
    var xhr = new XMLHttpRequest();
    var type = (typeof method !== 'undefined') ? method : 'GET';
    var callbackSuccess = (typeof cbSuccess === 'function') ? cbSuccess : requestXHRSuccess;
    var callbackError = (typeof cbError === 'function') ? cbError : requestXHRError;

    xhr.open(type, url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.setRequestHeader("X-PID", user.projectId);

    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callbackSuccess(xhr.responseText);
        } else {
          callbackError(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(obj);

    function requestXHRSuccess(response) {
      console.log(response);
    }
    function requestXHRError(errorText) {
      console.log(errorText);
    }
  }

  /*
   * Encodes string to b64 format
   */
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
      }));
  }

  /*
   * Returns object with all search params as pairs "property : value"
   */
  function getRequestParams() {
    if (location.search !== '') {
      var params = location.search.substring(1, location.search.length).split('&');
      var result = {};

      params.forEach(function (el) {
        let arr = el.split('=');
        result[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1]);
      });

      return result;
    }
    return false;
  }

  /*
   * Object for handling cookies
   */
  var cloudCookie = {
    getCookie: function (name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    setCookie: function (name, value, options) {
      options = options || {};

      var expires = options.expires;

      if (typeof expires === 'number' && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000 * 60 * 60 * 24); // expires assume amount of days
        expires = options.expires = d;
      }
      if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
      }

      value = encodeURIComponent(value);

      var updatedCookie = name + "=" + value;

      for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
          updatedCookie += "=" + propValue;
        }
      }
      document.cookie = updatedCookie;
    },
    deleteCookie: function (name) {
      this.setCookie(name, "", {
        expires: -1
      })
    }
  };

  /*
   * Sends get request to server 
   * Fills parts of provided block with server html-response and performs callback, if specified (logical block parts must have data-preview attributes, corresponding to response object's titles)
   * @string blockId - block to fill id attribute value
   * @string url - url to send request
   * @function? cb - function to perform after filling preview blocks
   */
  function fillPreview(blockId, url, cb) {
    var block = document.getElementById(blockId),
      elements = block.querySelectorAll('[data-preview]');

    sendPostRequest('#' + blockId, url, null, function (data) {
      [].forEach.call(elements, function (el) {
        var previewName = el.dataset.preview;
        el.innerHTML = data[previewName];
        if (typeof data[previewName] === 'boolean') {
          el.textContent = convertBooleanToRussian(data[previewName]);
        };
        setElementVisibility(el.parentNode, data[previewName]);
      });
      if (typeof cb === 'function') {
        cb(data);
      }
    }, function (data) {
      handleAjaxErrors(data);
    }, 'GET');
  }

  /*
   * Returns '-' if value is null or empty string
   */
  function checkEmptyStringValue(value) {
    return (value === '' || value === null) ? '-' : value;
  }

  /*
   * Returns russian words instead of boolean value
   * @bool value
   */
  function convertBooleanToRussian(value) {
    return (value) ? 'Да' : 'Нет';
  }

  /*
   * Fills detalization in block due to data. Detalization block must contain elements with corresponding data-name attributes, e.g. data-name="CustomerEmail"
   * @string id - id of a block with detalization
   * @object data - object with detalization data
   * @node elem - if set, then this elem will be filled
   */
  function fillDetalization(id, data, elem) {
    var block = (typeof elem !== 'undefined') ? elem : document.getElementById(id),
      names = Object.keys(data);

    names.forEach(function (el) {
      let node = block.querySelector('[data-name="' + el + '"]');
      if (node !== null) {
        if (typeof data[el] === 'boolean') {
          node.textContent = convertBooleanToRussian(data[el]);
        } else if (el.indexOf('Date') > -1) {
          node.textContent = formatDate(new Date(data[el]));
        } else {
          node.textContent = (el === 'State') ? translateToRussian(data[el]) : checkEmptyStringValue(data[el]);
        }
      }
    });
  }

  /*
   * Fills hrefs in detalization block. Detalization block must contain elements with corresponding data-rel attributes, e.g. data-rel="tickets"
   * @string id - id of a block with detalization
   * @array links - array of link objects {Rel:'', Url:''}
   */
  function fillDetalizationLinks(id, links) {
    var block = document.getElementById(id),
      prevLinks = block.querySelectorAll('[data-rel]');

    [].forEach.call(prevLinks, function (el) {
      el.removeAttribute('href');
    });
    if (Array.isArray(links)) {
      links.forEach(function (el) {
        let node = block.querySelector('[data-rel="' + el.Rel + '"]');
        if (node !== null) {
          node.setAttribute('href', el.Url);
        }
      });
    }
  }
  
  /*
   * Returns if text contains html tags
   */
  function checkIfHtml(text) {
    var reg = /<(.|\n)*?>/g;
    return reg.test(text);
  }

  /*
   * Decodes HTML Entities in textContent, and replaces all them to real symbols
   * This is the envelope for decodeHTMLEntities function(which will be returned), where real work performes. It's made for no creating element each time function fires
   */
  function decodeEntitiesToSymbols() {
    var element = document.createElement('div');

    function decodeHTMLEntities(str) {
      if (str && typeof str === 'string') {
        str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
        str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
        element.innerHTML = str;
        str = element.textContent;
        element.textContent = '';
      }

      return str;
    }

    return decodeHTMLEntities;
  }

  /*
   * Adds or removes class "hidden" on block, due to passed boolean parameter
   * @node node - element's node to show/hide
   * @boolean isVisible - if false, node will be hidden
   */
  function setElementVisibility(node, isVisible) {
    node.classList[(isVisible) ? 'remove' : 'add']('hidden');
  }

  /*
   * Returns correct url for ajax requests. Doesn't depend on the fact if there is a slash in the end of window.location.pathname
   * @string appendix - a string to be added to path name
   */
  function makeCorrectUrl(appendix) {
    return window.location.origin + window.location.pathname + ((window.location.pathname.slice(-1) === '/') ? '' : '/') + appendix;
  }

  /*
   * Returns digit with a leading zero if less than 10
   * @number i - day, or maybe month
   */
  function getTwoDigitsDate(i) {
    return (i > 9) ? i : '0' + i;
  }

  /*
   * Returns price with separated thousands ranks
   * @node elem - element, content of which is need to be transformed/replaced
   */
  function convertContentToThousands(elem) {
    var curNumber = parseInt(elem.textContent);
    elem.textContent = curNumber.toLocaleString('ru-RU');
  }

  /*
   * Returns date in a format dd.mm.yyyy hh:mm
   * @date date
   */
  function formatDate(date) {
    return getTwoDigitsDate(date.getDate()) + '.' + getTwoDigitsDate(date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + getTwoDigitsDate(date.getMinutes());
  }

  /*
   * Tranlates tech information to russian
   * @string title - text to convert
   */
  function translateToRussian(title) {
    var translateObj = {
      'SdnSpb': 'СПБ',
      'DsMsk': 'МСК',
      'AhKz': 'АЛА',
      'perflow': 'Базовая',
      'perfhigh': 'Высокая',
      'New': 'Создается',
      'Active': 'Активен',
      'Blocked': 'Заблокирован',
      'Deleted': 'Удален',
      'Deleting': 'Удаляется',
      'NeedMoney': 'Требуется оплата',
      'InPool': 'В пуле',
      'MigrationFromPool': 'Миграция из пула',
      'NotActivated': 'Не активирован',
      'Paid': 'Оплачен',
      'Closed': 'Закрыт',
      'State': 'Статус',
      'StateTitle': 'Статус',
      'Gateway': 'Шлюз',
      'DateCreate': 'Дата создания',
      'DateCompleted': 'Дата завершения',
      'Name': 'Название',
      'Size': 'Размер',
      'StoragePolicy': 'Политика',
      'Cost': 'Стоимость',
      'BackupPeriod': 'Период',
      'ActivationDate': 'Дата активации',
      'DeactivationDate': 'Дата деактивации',
      'TypeTitle': 'Тип',
      'Backup': 'Бэкап',
      'Backups': 'Бэкапы',
      'IsDelegated': 'Делегирован',
      'Published': 'Опубликован',
      'PrimaryIp': 'Основной IP',
      'DiskTypeString': 'Тип',
      'Period': 'Период',
      'ReferralCount': 'Рефералы',
      'Balance': 'Баланс',
      'MonthPaymentsSum': 'Сумма месячного платежа',
      'RegistrationDate': 'Дата регистрации',
      'RegistrationCount': 'Количество регистраций',
      'ProductTitle': 'Название продукта',
      'MainDomain': 'Домен',
      'ValidFromDate': 'Дата активации',
      'ValidTillDate': 'Дата окончания',
      'Number': 'Номер',
      'Sum': 'Сумма',
      'TestBalanceCount': 'Регистраций с тестом',
      'CreatedCount': 'Созданных',
      'DelegatedCount': 'Делегированных',
      'DeletedCount': 'Удаленных',
      'ExpiredCount': 'Просроченных',
      'ActivatedCount': 'Активированных',
      'DeactivatedCount': 'Деактивированных',
      'CustomerCount': 'Кол-во клиентов'
    }

    return (typeof translateObj[title] !== 'undefined') ? translateObj[title] : title;
  }

  window.util = {
    cleanInnerHtml: cleanInnerHtml,
    createDOMElement: createDOMElement,
    checkValueRanges: checkValueRanges,
    createSimpleXHR: createSimpleXHR,
    b64EncodeUnicode: b64EncodeUnicode,
    checkEmptyStringValue: checkEmptyStringValue,
    fillDetalization: fillDetalization,
    getRequestParams: getRequestParams,
    cloudCookie: cloudCookie,
    fillDetalizationLinks: fillDetalizationLinks,
    checkIfHtml: checkIfHtml,
    setElementVisibility: setElementVisibility,
    makeCorrectUrl: makeCorrectUrl,
    getTwoDigitsDate: getTwoDigitsDate,
    formatDate: formatDate,
    decodeEntitiesToSymbols: decodeEntitiesToSymbols(),
    translateToRussian: translateToRussian,
    convertBooleanToRussian: convertBooleanToRussian,
    convertContentToThousands: convertContentToThousands,
    fillPreview: fillPreview
  }
})();