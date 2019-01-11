// создать модель собирающую данные
//написать функцию по отрисовке с вьюхи с модели
// посчитать
//функция по изменению модели при событии
// перерисовка вьюхи
// посчитать

function initCalculatorVDS2(defaultObj) {
  var cpuDigitVisibleObj = $('#cpu-slider-value .calculator__slider-digit'),
    ramDigitVisibleObj = $('#ram-slider-value .calculator__slider-digit');

  var elemConfig = {
    os: $('#os-select'),
    dc: $('#dc-select'),
    hdd: $('#storage-select'),
    backUp: $('#backup-select'),
    cpu: $('#cpu-slider'),
    ram: $('#ram-slider'),
    performanceElems: $('[name="performance-input"]'),
    storageElems: $('[name="storage-type-input"]')
  };
  

  var Calculator = {
    model: {
      curDcModel: {},
      curCpu: {},
      curRam: {},
      curHdd: {},
      curDiskType: {},
      curImage: {},

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
        console.log('----');
      },

      getCurrentHdd: function (type) {
        var model = Calculator.model.curDcModel.curPool.Disks;
        for (var item in model) {
          
          if (model[item].Type === type) {
            Calculator.model.curHdd = model[item];
          }
        };
      },

      getCurrentImage: function (imageId) {
        var model = Calculator.model.curDcModel.Images;
        var curImage;
        console.log(model);
        console.log(imageId);
        for (var item in model) {
          if (model[item].Id === parseInt(imageId)) {
            curImage = model[item];
            Calculator.model.curHdd.Min = model[item].MinDiskSize
            break
          }
        }
        console.log(curImage);
        console.log(Calculator.model.curHdd);
      },

      createFullModel: function () {
        Calculator.model.getDcModel(elemConfig.dc.val());
        Calculator.model.getCurrentPerfomance($('[name="performance-input"]:checked').val());
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

        },
        hdd: function (minDiskSize) {
          var resourcePool = Calculator.model.curHdd;
          var performance = resourcePool || defaultObj.Perfomance;
          var minSize = minDiskSize || resourcePool.Min;
          var select = elemConfig.hdd;
          var curDc = defaultObj.Dclocation;

          select.find('option').remove();
          for (var i = minSize; i <= resourcePool.Max; i += resourcePool.Step) {
            Calculator.common.addOption(select, i, i + ' ' + 'Гб');
          };

        },
        backUp: function () {
          var backUpBlock = $('#backup');
          var model = Calculator.model.curDcModel;
          var select = elemConfig.backUp;
          var firstOption = $('<option />', {
            'text': 'Не нужно'
          });

          backUpBlock[(model.IsBackupSupported) ? 'removeClass' : 'addClass']('hidden');
          select.find('option').remove();

          
          firstOption.prop('selected', true);
          firstOption.prop('disabled', true);

          select.append(firstOption);

          if (model.IsBackupSupported) {
            model.Backup.Depths.forEach(function (el) {
              var option = $('<option />', {
                'text': el + ' дней',
                'value': el
              });
              select.append(option);
            });
          };

        },
        init: function () {
          this.dc();
          this.image();
          this.backUp();
        },
      },
      sliders: {
        cpu: function () {
          var cpuScaleArray = Calculator.model.curDcModel.curPool.Cpu.Cores;
          var cpuStartValue = Calculator.model.curCpu;
          var slider = elemConfig.cpu;

          slider.slider({
            value: cpuScaleArray.indexOf(cpuStartValue),
            max: cpuScaleArray.length,
            min: 0,
            range: 'min',
            slide: function (event, ui) {
              console.log(ui.value);
              Calculator.view.sliders.cpuSlide(event, ui);
            }
          });

          cpuDigitVisibleObj.text(cpuScaleArray[cpuScaleArray.indexOf(cpuStartValue)]);
          $('#CPU_Val').val(cpuScaleArray[cpuScaleArray.indexOf(cpuStartValue)]);
        },
        cpuSlide: function (event, ui) {
          var cpuScaleArray = Calculator.model.curDcModel.curPool.Cpu.Cores;
          Calculator.model.curCpu = cpuScaleArray[ui.value];

          if (ui.value == 0) {
            $('#cpu-slider').slider('value', 1);
            $("#CPU_Val").val(parseInt(cpuScaleArray[0]));
            $('#cpu-slider-value .calculator__slider-digit').text(parseInt(cpuScaleArray[0]));
            event.preventDefault();
            return false;
          }
          
          cpuDigitVisibleObj.text(Calculator.model.curCpu);
          $('#CPU_Val').val(Calculator.model.curCpu);
        },
        ram: function () {
          var ramScaleArray = Calculator.model.curDcModel.curPool.Ram.Amounts;
          var ramStartValue = Calculator.model.curRam;
          var slider = elemConfig.ram;

          slider.slider({
            range: 'min',
            value: ramScaleArray.indexOf(ramStartValue),
            min: 0,
            max: ramScaleArray.length,
            slide: function (event, ui) {
              console.log(ui.value);
              Calculator.view.sliders.ramSlide(event, ui);
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
              console.log(Calculator.model.curDcModel);
            });
          });       
        },
        storage: function () {
          var elements = elemConfig.storageElems;
          var curModel = Calculator.model.curDcModel.ResourcePools;
          var curDiskType = Calculator.model.curDiskType;
          var curPerfomModel = Calculator.model.curDcModel.curPool;

          elements.each(function () {
            var radio = $(this);
            radio.prop('checked', radio.val() === curDiskType);
            radio.prop('disabled', (elements.length > curPerfomModel.Disks.length && radio.val() !== curDiskType));
          });
          Calculator.view.selects.hdd();
        },
        
        init: function () {
          this.perfomance();
          this.storage();
        }
      },
      onModelChange: function () {
        Calculator.view.selects.image();
        Calculator.view.selects.backUp();
        Calculator.view.sliders.destroySliders();
        Calculator.view.sliders.cpu();
        Calculator.view.sliders.ram();

        Calculator.view.radioButtons.init();
      },
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
        }
        selectElem.append(option);
      }
    },
    controller: {
      onChange: function () {
        elemConfig.dc.on('change', function () {
          Calculator.model.createFullModel();
          Calculator.view.onModelChange();
          console.log(Calculator.model);
        });

        elemConfig.os.on('change', function () {
          
          console.log(Calculator.model);
          Calculator.model.getCurrentImage($(this).val())
        });

        elemConfig.performanceElems.each(function () {
          var radio = $(this);
          radio.on('change', function () {
            Calculator.model.curDcModel.Performance = radio.val();
            console.log(Calculator.model.curDcModel);
          });
        });

        elemConfig.storageElems.each(function () {
          var radio = $(this);

          radio.on('change', function () {
            var curVal = $(this).val();
            Calculator.model.getCurrentHdd(curVal);
            Calculator.view.selects.hdd();
          });
        });



      }
    },
    init: function () {
      this.model.getDcModel(defaultObj.Dclocation);
      this.model.getCurrentPerfomance(defaultObj.Perfomance);
      this.model.curDiskType = defaultObj.DiskType;
      this.model.getCurrentHdd(defaultObj.DiskType);

      this.model.curCpu = defaultObj.Cpu;
      this.model.curRam = defaultObj.Ram;
      
      this.view.selects.init();
      this.view.radioButtons.init();
      this.view.sliders.cpu();
      this.view.sliders.ram();

      this.controller.onChange();
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