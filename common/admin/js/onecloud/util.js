(function () {
  /*
   * Returns '-' if value is null or empty string
   */
  function checkEmptyStringValue(value) {
    return (value === '' || value === null) ? '-' : value;
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
        } else if (el.indexOf('Date') > -1 && data[el] !== null) {
          node.textContent = formatDate(new Date(data[el]));
        } else {
          node.textContent = (el === 'State') ? translateToRussian(data[el]) : checkEmptyStringValue(data[el]);
        }
      }
    });
  }

  /*
   * Returns russian words instead of boolean value
   * @bool value
   */
  function convertBooleanToRussian(value) {
    return (value) ? 'Да' : 'Нет';
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
        
        
        if (typeof data[previewName] === 'boolean') {
          el.textContent = convertBooleanToRussian(data[previewName]);
        } else if (previewName.indexOf('Date') !== -1) {
          el.textContent = getPreviewDate(data[previewName]);
        } else {
          el.innerHTML = data[previewName];
        }
        setElementVisibility(el.parentNode, data[previewName]);
      });
      if (typeof cb === 'function') {
        cb(data);
      }
    }, function (data) {
      handleAjaxErrors(data);
      }, 'GET');

    function getPreviewDate(date) {
      var timestamp, newDate;

      timestamp = Date.parse(date);
      if (!isNaN(timestamp)) {
        newDate = new Date(timestamp);
        return newDate.toLocaleDateString() + ' ' + newDate.toLocaleTimeString();
      }

      return date;
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
      'ExpireDate': 'Дата окончания',
      'DateActivated': 'Дата подключения',
      'DateDeleted': 'Дата отключения',
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
      'Number': 'Номер',
      'InvoiceNumber': 'Номер счёта',
      'Sum': 'Сумма',
      'Amount': 'Сумма',
      'TestBalanceCount': 'Регистраций с тестом',
      'CreatedCount': 'Созданных',
      'DelegatedCount': 'Делегированных',
      'DeletedCount': 'Удаленных',
      'ExpiredCount': 'Просроченных',
      'ActivatedCount': 'Активированных',
      'DeactivatedCount': 'Деактивированных',
      'CustomerCount': 'Кол-во клиентов',
      'DomainName': 'Доменное имя',
      'Type': 'Тип',
      'InstanceId': 'Id',
      'ZoneId': 'Id',
      'InvoiceId': 'Id',
      'IpOrDomain': 'Ip/Домен',
      'CommandType': 'Тип проверки',
      'TwoMonthPaymentsSum': 'Оплаченно за 2 последних месяца',
      'AllPaymentsSum': 'Оплаченно за всю историю',
      'LeftDate': 'Дата удаления',
      'MetricsCreatedCount': 'Метрик создано',
      'MetricsDeletedCount': 'Метрик удалено',
      'ProtocolTitle': 'Протокол',
      'Action': 'Действие',
      'ActionTitle': 'Действие',
      'TrafficDirectionTitle': 'Направление',
      'TrafficDirection': 'Направление',
      'DestinationPort': 'Порт',
      'SourcePort': 'Порт',
      'Protocol': 'Протокол',
      'HostsCreatedCount': 'Хостов создано',
      'HostsDeletedCount': 'Хостов удалено'
    }

    return (typeof translateObj[title] !== 'undefined') ? translateObj[title] : title;
  }

  window.util = {
    checkEmptyStringValue: checkEmptyStringValue,
    fillDetalization: fillDetalization,
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