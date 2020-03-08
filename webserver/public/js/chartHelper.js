var socket = io().connect()
$(function () {
  socket.on('setLastTempDataByMac', function (data) {
    allTempTimeStamps = []
    allTemperatures = []
    data.data.forEach(element => {
      allTempTimeStamps.push(element.timestamp)
      allTemperatures.push(element.temperature)
    })
    updateData(TemperatureChart, allTemperatures, allTempTimeStamps, chartColors.red, 1)
  })
  socket.on('setLastHumDataByMac', function (data) {
    allHumTimeStamps = []
    allHumidities = []
    data.data.forEach(element => {
      allHumTimeStamps.push(element.timestamp)
      allHumidities.push(element.humidity)
    })
    updateData(HumidityChart, allHumidities, allHumTimeStamps, chartColors.blue, 5)
  })
  socket.on('setLastVoltDataByMac', function (data) {
    allTempTimeStamps = []
    allVoltages = []
    data.data.forEach(element => {
      allTempTimeStamps.push(element.timestamp)
      allVoltages.push(element.voltage)
    })
    updateData(VoltageChart, allVoltages, allTempTimeStamps, chartColors.purple, 0.5)
  })
})

var chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
}

TemperatureChart = assignChartToCanvas('#TemperatureChart', {
  label: 'Temperatures'
}, chartColors.red, 1)
HumidityChart = assignChartToCanvas('#HumidityChart', {
  label: 'Humidity'
}, chartColors.blue, 5)
VoltageChart = assignChartToCanvas('#VoltageChart', {
  label: 'Voltage'
}, chartColors.purple, 0.5)

function assignChartToCanvas(chartId, datas, color, stepSize) {
  var ctxChart = $(chartId)
  return new Chart(ctxChart, {
    type: 'line',
    data: {
      labels: datas.labels,
      datasets: [{
        label: datas.label,
        data: datas.data,
        borderColor: color,
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            stepSize: stepSize
          }
        }]
      }
    }
  })
}
function addData(chart, newData, timeStamp) {
  var oldestTimeStampOfTheChart = Date.parse(chart.data.labels[0]) / 1000
  var timeStamp24hpast = Math.round((new Date()).getTime() / 1000) - (24 * 3600)
  if (oldestTimeStampOfTheChart < timeStamp24hpast) {
    chart.data.labels.splice(0, 1) // remove first label
    chart.data.datasets[0].data.splice(0, 1) // remove first data point
    chart.update()
  }
  chart.data.labels.push(timeStamp) // add new label at end
  chart.data.datasets[0].data.push(newData) // add new data at end
  chart.update()
}
function updateData(chart, newData, newLabels, color, stepSize) {
  chart.data.datasets[0].data = newData
  chart.data.labels = newLabels
  chart.data.datasets[0].borderColor = color
  chart.options.scales.yAxes[0].type = 'linear'
  chart.options.scales.yAxes[0].ticks.stepSize = stepSize
  chart.options.scales.xAxes[0].type = 'time'
  chart.update(0)
}