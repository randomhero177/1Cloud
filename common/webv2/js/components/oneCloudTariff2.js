(function initTariffBlock() {
  /**
   * Tariff block can be applied only on pages, containing Calculator module or variable "config" for Calculator module.
   * Variable popularTariffsConfig can be defined on concrete page before this module js bundle
  **/
  var tBlock = $('#tariff2');
  if (typeof window.config !== 'undefined' && tBlock.length > 0) {
    var tariff = new Tariff2(tBlock);
  } else {
    tBlock.addClass('hidden');
  }

  // Tariff2 constructor

  function Tariff2(tariffSection) {
    var tariff = this;
    var defaultConfig = {
      family: 'Windows',
      items: {
        basic: { cpu: 1, ram: 1, hdd: 40, hddType: 'SAS' },
        normal: { cpu: 2, ram: 4, hdd: 100, hddType: 'SAS' },
        mega: { cpu: 8, ram: 16, hdd: 500, hddType: 'SAS' }
      }
    };

    var calcConfig = window.config;
    var tConfig = (typeof popularTariffsConfig !== 'undefined') ? popularTariffsConfig : defaultConfig;
    var priceObj = Object.create(null);
    var perfTitle = calcConfig.DefaultValues.Performance;

    this.osElems = {
      osFamilyRadios: tariffSection.find('[name="os-family"]'),
      osSelect: tariffSection.find('#tariff2-os-select')
    };

    this.modal = {
      block: $('#tariff2-order-modal'),
      form: $('#tariff2-order-form'),
      email: $('#tariff2-order-email')
    };

    this.initFamilyElements = function () {
      if (!tConfig.family) {
        tConfig.family = 'Windows';
      }

      tariff.osElems.osFamilyRadios.each(function () {
        var radio = $(this);
        radio.prop('checked', radio.val() === tConfig.family);

        radio.on('change', function () {
          tariff.setOsSelectValues(radio.val());
        });
      });

      tariff.setOsSelectValues(tConfig.family, true);
    };

    this.setOsSelectValues = function (osFamilyString, isFirst) {
      var select = tariff.osElems.osSelect;
      var osFamily = tariffSection.find('input[value="' + osFamilyString + '"]').val();
      var systems = calcConfig.ImageList.filter(function (el) {
        return el.Family === osFamily;
      });

      select.find('option').each(function () {
        $(this).remove();
      });

      systems.forEach(function (el, index) {
        select.append($('<option />', {
          value: el.ID,
          text: el.DisplayName,
          selected: index === 0
        }));
      });

      if (window.innerWidth >= breakpoints.sm) {
        if (isFirst) {
          select.selectpicker({
            'width': '300px'
          });
        } else {
          select.selectpicker('refresh');
        }
      } else {
        select.selectpicker('destroy');
      }
    };

    this.initTariffBlocks = function () {
      var blocks = $('.tariff2__item');
      var dcTitle = getDcTitle();

      blocks.each(function () {
        initTariffItem($(this));
      });

      function initTariffItem(itemBlock) {
        var type = itemBlock.data('config');
        var typeConfig = tConfig.items[type];

        if (!(type && typeConfig)) {
          itemBlock.addClass('hidden');
        } else {
          Object.keys(typeConfig).forEach(function (key) {
            var obj = itemBlock.find('[data-for="' + key + '"]');

            if (obj.length > 0) {
              obj.text(typeConfig[key]);
            }
          });

          itemBlock.find('.tariff2__dclocation').text(dcTitle);

          itemBlock.find('input[type="radio"][value="' + typeConfig.hddType + '"]').prop('checked', true);

          setTariffPrice(itemBlock, tariff.calculate(typeConfig));

          itemBlock.find('.tariff2__hddtype input[type="radio"]').change(function () {
            typeConfig.hddType = itemBlock.find('.tariff2__hddtype input[type="radio"]:checked').val();
            setTariffPrice(itemBlock, tariff.calculate(typeConfig));
          });

          itemBlock.find('.tariff2__btn').click(function (e) {
            e.preventDefault();
            tariff.showModal(type, tariff.calculate(typeConfig));
          });
        }
      }

      function getDcTitle() {
        var dcObj = calcConfig.DcLocationList.filter(function (el) {
          return el.TechTitle === calcConfig.DefaultValues.Dc;
        })[0];

        var dcNameSplitted = dcObj.Title.split(',');

        return dcNameSplitted[2].trim() + ' (' + dcNameSplitted[0].trim() + ')';
      }

      function setTariffPrice(block, price) {
        block.find('.tariff2__price-number').html(numberWithThousands(price));
      }
    };

    this.showModal = function (name, price) {
      var m = tariff.modal;

      m.form.data('type', name);
      m.form.find('.tariff__title-name').text(name);
      m.form.find('.tariff__price-sum').html(numberWithThousands(price));

      m.block.modal('show');
    };
    this.initModal = function () {
      var m = tariff.modal;

      m.form.submit(function (e) {
        e.preventDefault();
        var m = tariff.modal;

        
        if (m.email.val() === '') {
          errorMessageAdd(m.email, textRequired);
          return;
        }

        if (urlRegisterServer.indexOf('tag=') !== -1) {
          urlRegisterServer += '-Popular';
        }
        
        reachCounterGoal('vdsconfigorder', 'submit');
        sendPostRequest('#' + m.form.attr('id'), urlRegisterServer, tariff.getOrderObject(), function () {
          window.location.href = successURL;
        });

      });
    };
    this.getOrderObject = function () {
      var m = tariff.modal;
      var type = m.form.data('type');

      if (typeof type === 'undefined') {
        throw new Error('Tariff type is not defined');
      }

      var tariffConfig = tConfig.items[type];

      var postObj = Object.create(null);
      postObj.Email = m.email.val();
      postObj.Name = 'Server';
      postObj.CPU = tariffConfig.cpu;
      postObj.RAM = tariffConfig.ram * 1024;
      postObj.HDD = tariffConfig.hdd;
      postObj.ImageID = tariff.osElems.osSelect.val();
      postObj.HDDType = tariffConfig.hddType;
      postObj.isHighPerformance = perfTitle === 'perfhigh';
      postObj.DCLocation = calcConfig.DefaultValues.Dc;
      postObj.isBackupActive = false;
      
      return postObj;
    }

    this.calculate = function (tariffObj) {
      var cpu_price = tariffObj.cpu * priceObj.cpu,
        ram_price = tariffObj.ram * priceObj.ram,
        hdd_price = tariffObj.hdd * priceObj['HDD_' + tariffObj.hddType];

      return cpu_price + ram_price + hdd_price;
    };

    this.initTail = function () {
      var tailBtn = tariffSection.find('.tariff2__tail .btn');
      
      if (tailBtn.length > 0) {
        tailBtn.click(function (e) {
          e.preventDefault();
          reachCounterGoal('yourconfclick');

          scrollTo('#server-calculator');
        });
      }
    };

    this.init = function () {
      priceObj = getPriceObject();
      tariff.initFamilyElements();
      tariff.initTariffBlocks();
      tariff.initModal();
      tariff.initTail();
      tariffSection.removeClass('loading loading--full');
    };

    tariff.init();

    function getPriceObject() {
      var obj = {};
      var curDcObj = {};
      var perf = {};

      for (var key in calcConfig.Initparams) {
        if (calcConfig.Initparams[key].DCLocationTechTitle === calcConfig.DefaultValues.Dc) {
          curDcObj = calcConfig.Initparams[key];
          break;
        }
      }

      if (curDcObj[perfTitle]) {
        perf = curDcObj[perfTitle];
      } else {
        perfTitle = (perfTitle === 'perfhigh') ? 'perflow' : 'perfhigh';
        perf = curDcObj[perfTitle];
      }

      return {
        cpu: perf.CPU.price,
        ram: perf.RAM.price,
        HDD_SAS: perf.HDD_SAS.price,
        HDD_SSD: perf.HDD_SSD.price
      };
    }
  }
})();
