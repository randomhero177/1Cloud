
function initCalculatorVDS2(defaultObj) {
  var cpuDigitVisibleObj = $('#cpu-slider-value .calculator__slider-digit');
  var ramDigitVisibleObj = $('#ram-slider-value .calculator__slider-digit');
  var elemConfig = {
    form: $('#order-form'),
    os: $('#os-select'),
    dc: $('#dc-select'),
    hdd: $('#storage-select'),
    backup: $('#backup-select'),
    cpu: $('#cpu-slider'),
    ram: $('#ram-slider'),
    performanceElems: $('[name="performance-input"]'),
    storageElems: $('[name="storage-type-input"]'),
    periodElems: $('[name="price-per-input"]'),
    soft: $('[name="isp-select"]'),
    email: $('[name="customer-email"]')
  };
  
  var Calculator = {
    model: {
      curDcModel: {},
      curBackup: null,
      curCpu: {},
      curRam: {},
      curHdd: {},
      curHddObj: {},
      curHddType: {},
      curImage: -1,
      curSoft: 0,
      curSoftArr: [],
      tariff: {
        curCpu: {},
        curRam: {},
        curBackup: {},
        curHdd: {}
      },
      order: {
        email: '',
        total: {
          'price-per-month': 0,
          'price-per-day': 0,
          'price-per-hour': 0
        }
      },

      getDcModel: function (dcTitle) {
        for (var item in config.DataCenters) {
          if (config.DataCenters[item].Id === dcTitle) {
            Calculator.model.curDcModel = config.DataCenters[item];
            return config.DataCenters[item];
          };
        };
      },
      
      getCurrentPerfomance: function (perfomance) {
        var model = Calculator.model.curDcModel.ResourcePools;
        var curModel;

        for (var item in model) {
          if (model[item].Performance === perfomance) {
            curModel = model[item];
          }
        };
        Calculator.model.curDcModel.curPool = (typeof curModel == 'undefined' && model.length === 1) ? model[0] : curModel;
      },

      getCurrentHddObj: function () {
        var model = Calculator.model.curDcModel.curPool.Disks;
        var type = this.curHddType;
        
        for (var item in model) {
          Calculator.model.curHddObj = model[item];
          Calculator.model.curHddType = model[item].Type;
          if (model[item].Type === type) { 
            break
          }
        };
      },

      getCurrentImage: function () {
        var model = Calculator.model.curDcModel.Images;
        var imageId = parseInt(this.curImage);
        var curImage;
        for (var item in model) {
          if (model[item].Id === imageId) {
            Calculator.model.curHddObj.Min = model[item].MinDiskSize;
            Calculator.model.curSoftArr = model[item].AvailableSofts;
            checkCpu(model[item].MinCpuCores);
            checkRam(model[item].MinRamAmount);
            break;
          }
        };

        function checkCpu(minCpu) {
          var cpuArr = Calculator.model.curDcModel.curPool.Cpu.Cores;

          for (var i = 0; cpuArr.length >= i; i++) {
            if (minCpu > cpuArr[i]) {

              if (minCpu > cpuArr[i + 1]) {
                cpuArr.splice(i, i + 1);
                i--;
              } else {
                cpuArr[i] = minCpu;
              }
            };
          };

          Calculator.model.curCpu = (Calculator.model.curCpu < cpuArr[0]) ? cpuArr[0] : Calculator.model.curCpu;
        }

        function checkRam(minRam) {
          var ramArr = Calculator.model.curDcModel.curPool.Ram.Amounts;
          
          for (var i = 0; ramArr.length >= i; i++) {
            if (minRam > ramArr[i]) {
              if (minRam >= ramArr[i + 1]) {
                ramArr.splice(i, i + 1);
                i--;
              } else {
                ramArr[i] = minRam;
              }
            };
          };

          Calculator.model.curRam = (Calculator.model.curRam < ramArr[0]) ? ramArr[0] : Calculator.model.curRam;
        }
      },

      getOrderObj: function () {
        var postObj = {};

        postObj.DataCenterId = Calculator.model.curDcModel.Id;
        postObj.Performance = Calculator.model.curDcModel.curPool.Performance;
        postObj.ImageId = Calculator.model.curImage;
        postObj.Email = Calculator.model.order.email;
        postObj.Cpu = Calculator.model.curCpu;
        postObj.Ram = Calculator.model.curRam;
        postObj.DiskSize = Calculator.model.curHdd;
        postObj.DiskType = Calculator.model.curHddType;
        postObj.Soft = [];
        postObj.Soft.push(Calculator.model.curSoft);
        postObj.BackupDepth = Calculator.model.curBackup;
        postObj.RegistrationTag = 'register';

        return postObj;
      },

      createFullModel: function () {
        this.getDcModel(elemConfig.dc.val());
        this.getCurrentPerfomance($('[name="performance-input"]:checked').val());
        this.getCurrentHddObj();
        this.getCurrentImage();
      },
    },
    view: {
      selects: {
        dc: function () {
          var model = config.DataCenters;
          var select = elemConfig.dc;
          var curDc;

          for (var item in model) {
            curDc = model[item];

            var option = $('<option />', {
              'text': model[item].Id,
              'value': model[item].Id,
              'data-id': model[item].Id,
            });

            select.append(option);
          };
          
          select.find('[value="' + defaultObj.Dclocation + '"]').prop('selected', true);
        },
        image: function () {
          var curObj = Calculator.model.curDcModel;
          var imageList = curObj.Images;
          var select = elemConfig.os;
          var firstOption = $('<option />', {
            'text': 'Выберите операционную систему'
          });

          select.find('option').remove();
          firstOption.prop('selected', true);
          firstOption.prop('disabled', true);
          select.append(firstOption);

          imageList.forEach(function (el, i) {
            var option = $('<option />', {
              'text': el.Title,
              'value': el.Id,
              'data-id': el.Id,
            });
            select.append(option);
          });

          var modelImageId = Calculator.model.curImage;

          select.find((modelImageId) ? 'option[value="' + modelImageId + '"]' : 'option:first-child').prop('selected', true);
        },
        hdd: function () {
          var resourcePool = Calculator.model.curHddObj;
          var minSize = resourcePool.Min;
          var curSize = Calculator.model.curHdd;
          var select = elemConfig.hdd;
          var curDc = defaultObj.Dclocation;

          Calculator.model.tariff.curHdd = resourcePool.Tariff;

          select.find('option').remove();
          for (var i = minSize; i <= resourcePool.Max; i += resourcePool.Step) {
            Calculator.common.addOption(select, i, i + ' ' + 'Гб');
          };

          select.find('option[value="' + curSize + '"]').prop('selected', true);
        },
        backup: function () {
          var backUpBlock = $('#backup');
          var model = Calculator.model.curDcModel;
          var curBackup = Calculator.model.curBackup;
          var select = elemConfig.backup;
          var firstOption = $('<option />', {
            'text': 'Не нужно',
            'value': 0
          });          

          Calculator.model.tariff.curBackup = (model.IsBackupSupported) ? model.Backup.Tariff : 0;
          backUpBlock[(model.IsBackupSupported) ? 'removeClass' : 'addClass']('hidden');
          Calculator.model.curBackup = (model.IsBackupSupported) ? Calculator.model.curBackup : null;
          select.find('option').remove();

          firstOption.prop('selected', true);
          select.append(firstOption);

          if (model.IsBackupSupported) {
            model.Backup.Depths.forEach(function (el) {
              var option = $('<option />', {
                'text': el + ' дней',
                'value': el
              });
              select.append(option);
            });
            select.find((curBackup) ? 'option[value="' + curBackup + '"]' : 'option:first-child').prop('selected', true);
          };
        },
        soft: function () {
          var block = $('#isp-component');
          var select = elemConfig.soft;
          var curModel = Calculator.model.curSoftArr;
          var soft = config.Soft;
          var firstOption = $('<option />', {
            text: 'Не устанавливать',
            value: 0
          });

          Calculator.model.curSoft = '';
          firstOption.prop('selected', true);
          block[(curModel.length > 0) ? 'removeClass' : 'addClass']('hidden');
          select.find('option').remove();
          select.append(firstOption);

          curModel.forEach(function (el, i) {
            Calculator.common.addOption(select, el);
          });
        },
        init: function () {
          this.dc();
          this.image();
          this.backup();
          this.soft();
        },
      },
      sliders: {
        cpu: function () {
          var cpuScaleArray = Calculator.model.curDcModel.curPool.Cpu.Cores;
          var cpuStartValue = (cpuScaleArray.indexOf(cpuStartValue) > -1) ? Calculator.model.curCpu : cpuScaleArray[0];
          var slider = elemConfig.cpu;

          Calculator.model.tariff.curCpu = Calculator.model.curDcModel.curPool.Cpu.Tariff;

          slider.slider({
            value: cpuScaleArray.indexOf(cpuStartValue),
            max: cpuScaleArray.length - 1,
            min: 0,
            range: 'min',
            step: 1,
            slide: function (event, ui) {
              Calculator.view.sliders.cpuSlide(event, ui);
              Calculator.view.radioButtons.showPerfomanceText();
              Calculator.controller.calculate();
            }
          });

          cpuDigitVisibleObj.text(cpuScaleArray[cpuScaleArray.indexOf(cpuStartValue)]);
          $('#CPU_Val').val(cpuScaleArray[cpuScaleArray.indexOf(cpuStartValue)]);
        },
        cpuSlide: function (event, ui) {
          var cpuScaleArray = Calculator.model.curDcModel.curPool.Cpu.Cores;
          Calculator.model.curCpu = cpuScaleArray[ui.value];

          cpuDigitVisibleObj.text(Calculator.model.curCpu);
          $('#CPU_Val').val(Calculator.model.curCpu);
        },
        ram: function () {
          var ramScaleArray = Calculator.model.curDcModel.curPool.Ram.Amounts;
          var ramStartValue = (ramScaleArray.indexOf(Calculator.model.curRam) > -1) ? Calculator.model.curRam : ramScaleArray[0];
          var slider = elemConfig.ram;

          Calculator.model.tariff.curRam = Calculator.model.curDcModel.curPool.Ram.Tariff;

          slider.slider({
            range: 'min',
            value: ramScaleArray.indexOf(ramStartValue),
            min: 0,
            max: ramScaleArray.length,
            slide: function (event, ui) {
              Calculator.view.sliders.ramSlide(event, ui);
              Calculator.controller.calculate();
            }
          });
          
          $("#RAM_Val").val((ramStartValue >= 1024) ? ramStartValue/1024 : ramStartValue);
          ramDigitVisibleObj.text((ramStartValue >= 1024) ? ramStartValue / 1024 : ramStartValue);
          ramDigitVisibleObj.next('#ram-measure').text((ramStartValue >= 1024) ? 'Gb' : 'Mb');
        },
        ramSlide: function (event, ui) {
          var ramScaleArray = Calculator.model.curDcModel.curPool.Ram.Amounts,
            index = (ui.value > 0) ? ui.value - 1 : ui.value;
          ramValue = (ramScaleArray[index] >= 1024) ? ramScaleArray[index] / 1024 : ramScaleArray[index];

          Calculator.model.curRam = ramScaleArray[index];

          $("#RAM_Val").val(ramValue);
          ramDigitVisibleObj.text(ramValue);
          ramDigitVisibleObj.next('#ram-measure').text((ramScaleArray[index] >= 1024) ? 'Gb' : 'Mb');
        },
        destroySliders: function () {
          var selectors = ['#cpu-slider', '#ram-slider'];

          selectors.forEach(function (el) {
            $(el).slider("destroy");
          });
        }
      },
      radioButtons: {
        perfomance: function () {
          var elements = elemConfig.performanceElems;
          var curModel = Calculator.model.curDcModel.ResourcePools;
          var curPerfomanceTitle = Calculator.model.curDcModel.curPool.Perfomance;
          var curPerfomModel = Calculator.model.curDcModel.curPool;

          Calculator.model.curDcModel.Performance = curPerfomanceTitle;
          elements.each(function () {
            var radio = $(this);
            radio.prop('checked', radio.val() === curPerfomModel.Performance);

            radio.prop('disabled', (curModel.length < elements.length && radio.val() !== curPerfomModel.Performance));

            radio.on('change', function () {
              Calculator.model.curDcModel.Performance = radio.val();
            });
          });       
        },
        showPerfomanceText: function () {
          var descrArray = Calculator.model.curDcModel.curPool.HardwareDescirptions;
          var curCpu = Calculator.model.curCpu;
          var curTechDescr;

          var poolDesc = (Calculator.model.curDcModel.curPool.Performance === 'perfhigh') ? 'Высокопроизводительный пул построен на базе серверов:' : 'Базовый пул построен на базе серверов:';

          for (var item in descrArray) {
            if (curCpu >= descrArray[item].FromCpu && curCpu <= descrArray[item].ToCpu) {
              curTechDescr = descrArray[item].Title;
              break;
            }
          };

          var foolDescr = poolDesc + ' ' + curTechDescr;

          $('#performance-solution-text').text(foolDescr);
        },
        storage: function () {
          var elements = elemConfig.storageElems;
          var curModel = Calculator.model.curDcModel.ResourcePools;
          var curHddType = Calculator.model.curHddType;
          var curPerfomModel = Calculator.model.curDcModel.curPool;

          elements.each(function () {
            var radio = $(this);
            radio.prop('checked', radio.val() === curHddType);
            radio.prop('disabled', (elements.length > curPerfomModel.Disks.length && radio.val() !== curHddType));
          });
          Calculator.view.selects.hdd();
        },
        
        init: function () {
          this.perfomance();
          this.storage();
          this.showPerfomanceText();
        }
      },
      onModelChange: function () {
        Calculator.view.selects.image();
        Calculator.view.selects.backup();
        Calculator.view.sliders.destroySliders();
        Calculator.view.sliders.cpu();
        Calculator.view.sliders.ram();

        Calculator.view.radioButtons.init();
      },
      showPrice: function () {
        var priceElem = $('#price-sum');
        var pricePer = $('input[name="price-per-input"]:checked').attr('id');
        priceElem.text(Calculator.model.order.total[pricePer].toLocaleString('ru'));
      }
    },
    common: {
      addOption: function(selectElem, val, text, extraParams) {
        var option = $('<option />', {
          'value': val,
          'text': val
        });

        if (typeof extraParams !== 'undefined' && Object.keys(extraParams).length > 0) {
          for (var key in extraParams) {
            option.data(key, extraParams[key]);
          }
        };
        selectElem.append(option);
      }
    },
    controller: {
      onChange: function () {
        elemConfig.dc.on('change', function () {
          Calculator.model.createFullModel();
          Calculator.view.onModelChange();
          Calculator.controller.calculate();
        });

        elemConfig.os.on('change', function () {
          Calculator.model.curImage = parseInt($(this).val());
          Calculator.model.getCurrentImage();
          Calculator.view.selects.backup();
          Calculator.view.selects.soft();
          Calculator.view.sliders.destroySliders();
          Calculator.view.sliders.cpu();
          Calculator.view.sliders.ram();
          Calculator.view.radioButtons.init();
        });

        elemConfig.soft.on('change', function () {
          Calculator.model.curSoft = ($(this).val() !== '0') ? $(this).val() : '';
        });

        elemConfig.hdd.on('change', function () {
          Calculator.model.curHdd = $(this).val();
          Calculator.controller.calculate();
        });

        elemConfig.performanceElems.on('change', function () {
          Calculator.model.curDcModel.Performance = $(this).val();
          Calculator.model.createFullModel();
          Calculator.view.radioButtons.showPerfomanceText();
          Calculator.view.sliders.destroySliders();
          Calculator.view.sliders.cpu();
          Calculator.view.sliders.ram();
          Calculator.controller.calculate();
        });

        elemConfig.storageElems.on('change', function () {
          Calculator.model.curHddType = $(this).val();
          Calculator.model.getCurrentHddObj();
          Calculator.view.selects.hdd();
          Calculator.controller.calculate();
        });

        elemConfig.backup.on('change', function () {
          Calculator.model.curBackup = (parseInt($(this).val())) ? parseInt($(this).val()) : null;
          Calculator.controller.calculate();
        });

        elemConfig.periodElems.on('change', function () {
          Calculator.view.showPrice();
        });

        elemConfig.email.on('change', function () {
          Calculator.model.order.email = $(this).val();
        });
      },
      calculate: function () {
        var cpuPrice = Calculator.model.tariff.curCpu * Calculator.model.curCpu;
        var ramPrice = (Calculator.model.tariff.curRam / 4) * (Calculator.model.curRam / 256);
        var hddPrice = Calculator.model.tariff.curHdd * Calculator.model.curHdd;
        var backupPrice = (Calculator.model.tariff.curBackup / 7) * (Calculator.model.curBackup * Calculator.model.curHdd);
        var total = cpuPrice + ramPrice + hddPrice + backupPrice;

        Calculator.model.order.total['price-per-month'] = Math.round(total);
        Calculator.model.order.total['price-per-day'] = Math.round(total / 30);
        Calculator.model.order.total['price-per-hour'] = Math.round(total / (30 * 24));
        Calculator.view.showPrice();
      },
      order: function () {
        var calcValidator = $('#order-form').validate({
          onkeyup: false,
          onfocusin: function (element) {
            errorMessageRemove($(element));
          },
          rules: {
            'os-select': 'required',
            'customer-email': {
              required: true,
              email: true
            }
          },
          messages: {
            'customer-email': {
              email: textEmailInvalid
            }
          },
          errorPlacement: function (error, element) {
            error.insertAfter(element);
            if (element.siblings('.btn').length > 0) {
              element.siblings('.btn').bind('click',
                function () {
                  errorMessageRemove(element);
                });
            }
          },
          highlight: function (element) {
            $(element).parent().addClass('error');
          },
          errorElement: 'span',
          errorClass: errorClass
        });

        function incorrectPost(data) {
          if (data.Email != undefined && data.Email != '') {
            var c = elemConfig.email.val();
            $.validator.addMethod('emailerrors', function (value) {
              return value != c;
            }, data.Email);

            $(calcElemEmail).rules('remove', 'emailerrors');
            $(calcElemEmail).rules('add', {
              'emailerrors': true
            });
          }
        }

        elemConfig.form.submit(function (e) {
          e.preventDefault();
          var postObj = Calculator.model.getOrderObj();
          
          if (calcValidator.form()) {
            sendPostRequest('#order-form', urlRegisterServer, postObj, function () {
              window.location.href = successURL;
            }, incorrectPost);
          };
        })
      }
    },
    init: function () {
      this.model.getDcModel(defaultObj.Dclocation);
      this.model.getCurrentPerfomance(defaultObj.Perfomance);
      this.model.curHddType = defaultObj.DiskType;
      this.model.getCurrentHddObj(defaultObj.DiskType);

      this.model.curCpu = defaultObj.Cpu;
      this.model.curRam = defaultObj.Ram;
      Calculator.model.curHdd = defaultObj.HddSize;

      this.view.selects.init();
      this.view.radioButtons.init();
      this.view.sliders.cpu();
      this.view.sliders.ram();

      this.controller.onChange();
      this.controller.calculate();
      this.controller.order();
    }
  };

  if ($('#server-calculator').length && typeof config !== 'undefined') {
    Calculator.init();
  }

};


var defaultObj = {
  Dclocation: 'AhKz',
  Perfomance: 'perfhigh',
  DiskType: 'SSD',
  Cpu: 12,
  Ram: 20480,
  HddSize: 40
};
initCalculatorVDS2(defaultObj)