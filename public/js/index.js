var socket = io().connect();
$('#selectMacAdress').change(function () {
  var ts = Math.round((new Date()).getTime() / 1000);
  var tsYesterday = ts - (24 * 3600); //Get the values from now and the last 24 hours.
  updateChartForThePast24hours()
});
$(function () {
  socket.on('temperature update', function (datapackageFromServer) {
    if ($('#selectMacAdress').val() == datapackageFromServer.macAdress) {
      var temperature = datapackageFromServer.value;
      var timeStamp = datapackageFromServer.timeStamp;
      addData(TemperatureChart, temperature, timeStamp);
      $('#temperature').text(datapackageFromServer.value + '° C');
    }
  });
  socket.on('humidity update', function (datapackageFromServer) {
    if ($('#selectMacAdress').val() == datapackageFromServer.macAdress) {
      var humidity = datapackageFromServer.value;
      var timeStamp = datapackageFromServer.timeStamp;
      addData(HumidityChart, humidity, timeStamp);
      $('#humidity').text(datapackageFromServer.value + '%');
    }
  });
  socket.on('mac update', function (newMacAdress) {
    var ctxDropDownMacs = document.getElementById("selectMacAdress");
    var element = document.createElement("option");
    element.textContent = newMacAdress;
    element.value = newMacAdress;
    ctxDropDownMacs.appendChild(element);
  });
})
updateChartForThePast24hours()

function updateChartForThePast24hours() {
  getUpdateForChartBasedOnTimeStamps(get24hPastTimeStamp(), getCurrentTimeStamp());
}

function getCurrentTimeStamp() {
  return Math.round((new Date()).getTime() / 1000);
}
function get24hPastTimeStamp() {
  return getCurrentTimeStamp() - (24 * 3600)
}