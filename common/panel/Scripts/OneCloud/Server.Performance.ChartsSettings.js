$(function () {
  var data4Graphics;
  var isFirstDownloadPerf = false;
  var CurrentPeriod;

  $('#LoadButtonRealTime').click(function () { if ($(this).hasClass('inactive')) return; ChangePerformancePeriod($(this)); LoadData('RealTime'); });
  $('#performance-tab').click(function () { if ($(this).hasClass('inactive')) return; if (isFirstDownloadPerf) return; ChangePerformancePeriod($('#LoadButtonRealTime')); LoadData('RealTime'); isFirstDownloadPerf = true; });
  $('#LoadButton5min').click(function () { if ($(this).hasClass('inactive')) return; ChangePerformancePeriod($(this)); LoadData('FiveMinutes'); });
  $('#LoadButtonHalfHour').click(function () { if ($(this).hasClass('inactive')) return; ChangePerformancePeriod($(this)); LoadData('HalfHour'); });
  $('#LoadButtonTwoHours').click(function () { if ($(this).hasClass('inactive')) return; ChangePerformancePeriod($(this)); LoadData('TwoHours'); });
  $('#LoadButtonOneDay').click(function () { if ($(this).hasClass('inactive')) return; ChangePerformancePeriod($(this)); LoadData('OneDay'); });
})

function ChangePerformancePeriod(currentPeriod) {
  $('#performance_period .performance__periods-item').removeClass('active');
  $(currentPeriod).addClass('active');
  CurrentPeriod = currentPeriod;
}

function LoadData(period) {
  $.post('/Performance/GetData4Graphics?serviceInstanceid=' + serviceInstanceId + '&period=' + period, null, function (data) {
    data4Graphics = data;
    LoadGraphics();
    ShowDataIsNotAvailable4PeriodMessage();
  });
  SetProgressLoadGraphics();
}
function LoadGraphics() {
  $('.performance__graphics .progress-indicator').addClass('hidden');
  $('.performance__graphics .event-in-progress').addClass('hidden');
  $('#performance_period .performance__periods-item').removeClass('inactive');

  Highcharts.setOptions({
    colors: ['#058DC7', '#50B432', '#FF7711', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4'],
    chart: {
      backgroundColor: {
        linearGradient: [0, 0, 500, 500],
        stops: [
          [0, 'rgb(255, 255, 255)'],
          [1, 'rgb(240, 240, 255)']
        ]
      },
      zoomType: 'x',
      borderWidth: 0,
      plotBackgroundColor: 'rgba(255, 255, 255, .9)',
      plotShadow: true,
      plotBorderWidth: 1
    }
  });
  var iopsCounterIsInit = false;
  for (var i = 0; i < data4Graphics.length; i++) {
    var graphicData = [];

    for (var j = 0; j < data4Graphics[i].CounterValues.length; j++) {
      graphicData[j] = data4Graphics[i].CounterValues[j].Value;
    }

    //CPU Usage
    // if (data4Graphics[i].CounterId == 6)
    if (data4Graphics[i].CounterTitle == 'CPU_usagemhz_average') {
      Graphic_CPU_Average_Usage(data4Graphics[i], graphicData);
    }

    //RAM Allocated & active
    //if (data4Graphics[i].CounterId == 90) {
    if (data4Graphics[i].CounterTitle == 'RAM_usage_average') {
      var graphicDataActiveRAM = new Array();
      for (var j = 0; j < data4Graphics.length; j++) {
        //if (data4Graphics[j].CounterId == 25) {
        if (data4Graphics[j].CounterTitle == 'RAM_active_average') {
          for (var z = 0; z < data4Graphics[j].CounterValues.length; z++) {
            graphicDataActiveRAM[z] = data4Graphics[j].CounterValues[z].Value;
          }
        }
      }
      Graphic_RAM_Average_Usage(data4Graphics[i], graphicData, graphicDataActiveRAM);
    }

    //Virtual Disk Read Write
    //if (data4Graphics[i].CounterId == 326) {
    if (data4Graphics[i].CounterTitle == 'VirtualDisk_read_average') {
      var graphicDataWrite = new Array();
      for (var j = 0; j < data4Graphics.length; j++) {
        //if (data4Graphics[j].CounterId == 327) {
        if (data4Graphics[j].CounterTitle == 'VirtualDisk_write_average') {
          for (var z = 0; z < data4Graphics[j].CounterValues.length; z++) {
            graphicDataWrite[z] = data4Graphics[j].CounterValues[z].Value;
          }
        }
      }

      Graphic_Disk(data4Graphics[i], graphicData, graphicDataWrite)
    }
  }

  //Net In Out Trafic
  //if (data4Graphics[i].CounterId == 115) {
  var graphicDataNetReceived = data4Graphics.filter(function (el) { return el.CounterTitle == 'Net_received_average'; });
  var graphicDataNetTransmitted = data4Graphics.filter(function (el) { return el.CounterTitle == 'Net_transmitted_average'; });

  Graphic_Net_Average(graphicDataNetReceived, graphicDataNetTransmitted);
};
function ShowDataIsNotAvailable4PeriodMessage() {
  var graphics = $('.performance__graphics .performance__graphics-item');
  $.each(graphics, function () {
    if ($(this).find('div.highcharts-container').length == 0) {
      $(this).html('<div class="data_not_found">' + resourcesPerf.NoData + '</div>');
    }
  });
}

function SetProgressLoadGraphics() {
  $('.performance__graphics .progress-indicator').removeClass('hidden');
  $('.performance__graphics .event-in-progress').removeClass('hidden');
  $('#performance_period .performance__periods-item').addClass('inactive');
  $('.performance__graphics .performance__graphics-item').html('<span class="progress-indicator"></span><span class="event-in-progress">' + resourcesPerf.LoadData + '</span>');
}
function getDate4Graphic(utcDate) {
  var date = new Date(utcDate);
  date.setHours(date.getHours() - 3);
  var options = {
    year: "numeric", month: "numeric",
    day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
  };
  var day = date.toLocaleDateString("ru-RU", options);

  return day;
}

function Graphic_CPU_Average_Usage(data4Graphics, graphicData) {
  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: 'performance_cpu'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        enabled: true,
        text: resourcesPerf.CPUusage
      },
      labels: {
        formatter: function () {
          return this.value / 1000 + ' ' + resourcesPerf.GHz;
        }
      },
      min: 0,
      showLastLabel: true
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: false
    },
    title: {
      text: data4Graphics.CounterDescription
    },
    tooltip: {
      formatter: function () {
        return resourcesPerf.Date + ': <b>' + getDate4Graphic(this.x) + '</b><br>' + resourcesPerf.CPUusage + ': <b>' + this.y / 1000 + '</b>  ' + resourcesPerf.GHz;
      }
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
          ]
        },
        marker: {
          radius: 2
        },
        lineWidth: 1,
        states: {
          hover: {
            lineWidth: 1
          }
        },
        threshold: null
      }
    },
    series: [{
      data: graphicData,
      type: 'area',
      name: resourcesPerf.MiddleUsageCPU,
      pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
      pointInterval: data4Graphics.Interval * 1000
    }]
  });
}

function Graphic_RAM_Average_Usage(data4Graphics, graphicData, graphicDataActive) {
  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: 'performance_ram',
    },

    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        enabled: true,
        text: resourcesPerf.RAMusage
      },
      labels: {
        formatter: function () {
          return this.value / 1000000 + " " + resourcesPerf.Gb;
        }
      },
      min: 0
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true
    },
    title: {
      text: data4Graphics.CounterDescription
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      formatter: function () {
        var s = resourcesPerf.Date + ': <b>' + getDate4Graphic(this.x) + '</b>';

        $.each(this.points, function () {
          s += '<br/>' + this.series.name + ': <b>' +
            Math.round(this.y / 1000000 * 100) / 100 + '</b> ' + resourcesPerf.Gb;
        });
        return s;
      }
    },
    plotOptions: {
      area: {
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          radius: 2
        },
        pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
        pointInterval: data4Graphics.Interval * 1000,
        line: {
          dataLabels: {
            enabled: false
          }
        }
      }
    },
    series: [{
      name: resourcesPerf.RAMReserved,
      data: graphicData,
      type: 'area'
    }, {
      name: resourcesPerf.RAMActive,
      data: graphicDataActive,
      type: 'area'
    }],
    navigation: {
      menuItemStyle: {
        fontSize: '10px'
      }
    }
  });
}

var defaultNetPerformanceId = 'performance_net';
function Graphic_Net_Average(graphicDataNetReceived, graphicDataNetTransmitted) {
  $('[id^="' + defaultNetPerformanceId + '"]').remove();

  // DRAW NEW PERFORMANCE BLOCKS
  for (var i = 0; i < graphicDataNetReceived.length; i++) {
    for (var j = 0; j < graphicDataNetTransmitted.length; j++) {
      if (graphicDataNetReceived[i].DeviceName == graphicDataNetTransmitted[j].DeviceName) {
        var deviceName = graphicDataNetReceived[i].DeviceName;
        var netReceived = graphicDataNetReceived[i].CounterValues.map(function (el) { return el.Value });
        var netTransmitted = graphicDataNetTransmitted[j].CounterValues.map(function (el) { return el.Value });

        Graphic_Net_AveragePerDevice(graphicDataNetReceived[i], netReceived, netTransmitted, deviceName);
      }
    }
  }
}

function Graphic_Net_AveragePerDevice(data4Graphics, graphicDataNetReceived, graphicDataNetTransmitted, deviceName) {
  var elemId = defaultNetPerformanceId + (deviceName ? '_' + deviceName.replace(/[^\w]+/g, '') : ''); //remove any non letter, digit or undescore from name
  if ($('#' + elemId).length < 1) {
    $('.performance__graphics').append($('<div id="' + elemId + '" class="performance__graphics-item" />'));
  }

  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: elemId,
    },

    xAxis: {
      type: 'datetime'
    },
    credits: {
      enabled: false
    },
    yAxis: {
      title: {
        enabled: true,
        text: deviceName || resourcesPerf.NetUsage
      },
      labels: {
        formatter: function () {
          return this.value * 8 / 1000 + ' ' + resourcesPerf.Mbps;
        }
      },
      min: 0
    },
    legend: {
      enabled: true
    },
    title: {
      text: resourcesPerf.NetUsage
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      formatter: function () {
        var s = resourcesPerf.Date + ': <b>' + getDate4Graphic(this.x) + '</b>';

        $.each(this.points, function () {
          s += '<br/>' + this.series.name + ': <b>' +
            Math.round((this.y * 8 / 1000) * 100) / 100 + '</b> ' + resourcesPerf.Mbps;
        });
        return s;
      }
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          radius: 2
        },
        pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
        pointInterval: data4Graphics.Interval * 1000,
        line: {
          dataLabels: {
            enabled: false
          }
        }
      }
    },
    series: [{
      name: resourcesPerf.NetReceived,
      data: graphicDataNetReceived,
      type: 'area'
    }, {
      name: resourcesPerf.NetTransmitted,
      data: graphicDataNetTransmitted,
      type: 'area'
    }],
    navigation: {
      menuItemStyle: {
        fontSize: '10px'
      }
    }
  });
}
//Количество прочтенного и записанного (Виртуальные диски)
function Graphic_Disk(data4Graphics, graphicDataRead, graphicDataWrite) {
  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: 'performance_disk',
    },

    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        enabled: true,
        text: resourcesPerf.DiskUsage
      },
      labels: {
        formatter: function () {
          return Math.round((this.value / 1024) * 100) / 100 + ' ' + resourcesPerf.MBs;
        }
      },
      min: 0,
      showLastLabel: true
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true
    },
    title: {
      text: resourcesPerf.DiskUsageDesc
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      formatter: function () {
        var s = resourcesPerf.Date + ': <b>' + getDate4Graphic(this.x) + '</b>';

        $.each(this.points, function () {
          s += '<br/>' + this.series.name + ': <b>' +
            Math.round((this.y / 1000) * 100) / 100 + '</b> ' + resourcesPerf.MBs;
        });
        return s;
      }
    },
    plotOptions: {
      area: {
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          radius: 2
        },
        pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
        pointInterval: data4Graphics.Interval * 1000,
        line: {
          dataLabels: {
            enabled: false
          }
        }
      }
    },
    series: [{
      name: resourcesPerf.DiskRead,
      data: graphicDataRead,
      type: 'area'
    }, {
      name: resourcesPerf.DiskWrite,
      data: graphicDataWrite,
      type: 'area'
    }],
    navigation: {
      menuItemStyle: {
        fontSize: '10px'
      }
    }
  });
}
function Graphic_VirtualDisk_IOPS(data4Graphics, graphicDatWriteIOPS) {
  var chart1 = new Highcharts.Chart({
    chart: {
      renderTo: 'performance_disk',
    },

    xAxis: {
      type: 'datetime'
    },
    yAxis: {
      title: {
        enabled: true,
        text: resourcesPerf.MaxIOPS
      },
      labels: {
        formatter: function () {
          return this.value + ' IOPS';
        }
      },
      min: 0
    },
    credits: {
      enabled: false
    },
    legend: {
      enabled: true
    },
    tooltip: {
      crosshairs: true,
      shared: true,
      formatter: function () {
        var s = resourcesPerf.Date + ': <b>' + getDate4Graphic(this.x) + '</b>';

        $.each(this.points, function () {
          s += '<br/>' + this.series.name + ': <b>' + this.y + '</b>';
        });
        return s;
      }
    },
    title: {
      text: resourcesPerf.MaxIOPS
    },
    plotOptions: {
      area: {
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          radius: 2
        },
        pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
        pointInterval: data4Graphics.Interval * 1000,
        line: {
          dataLabels: {
            enabled: false
          }
        }
      }
    },
    navigation: {
      menuItemStyle: {
        fontSize: '10px'
      }
    }
  });
  $.each(graphicDatWriteIOPS, function () {
    chart1.addSeries({
      data: this[0],
      name: this[1],
      type: 'area'
    });
  });
}

/*function Graphic_Disk(data4Graphics, graphicData)
{
    var chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'performance_disk',
        },

        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                enabled: true,
                text: 'Максимальная задержка'
            },
            labels: {
                formatter: function () {
                    return this.value + ' мс';
                }
            },
            min: 0,
            showLastLabel: true
        },
        legend: {
            enabled: false
        },
        title: {
            text: data4Graphics.CounterDescription
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                marker: {
                    radius: 2
                },
                lineWidth: 1,
                states: {
                    hover: {
                        lineWidth: 1
                    }
                },
                threshold: null
            }
        },
        series: [{
            data: graphicData,
            type: 'area',
            name: 'Максимальная загрузка (мс) ',
            pointStart: Date.UTC(data4Graphics.CounterValues[0].ValueYear, data4Graphics.CounterValues[0].ValueMonth - 1, data4Graphics.CounterValues[0].ValueDay, data4Graphics.CounterValues[0].ValueHour, data4Graphics.CounterValues[0].ValueMinute, data4Graphics.CounterValues[0].ValueSecond),
            pointInterval: data4Graphics.Interval * 1000
        }]
    });
}*/