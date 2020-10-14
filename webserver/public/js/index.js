var socket = io().connect();

$("#selectMacAddress").change(function () {
  updateChartForThePast24hours();
});
$(function () {
  socket.on("temperature update", function (datapackageFromServer) {
    if ($("#selectMacAddress").val() == datapackageFromServer.macAddress) {
      var temperature = datapackageFromServer.value;
      var timeStamp = datapackageFromServer.timeStamp;
      addData(TemperatureChart, temperature, timeStamp);
      $("#temperature").text(temperature + "° C");
    }
  });
  socket.on("humidity update", function (datapackageFromServer) {
    if ($("#selectMacAddress").val() == datapackageFromServer.macAddress) {
      var humidity = datapackageFromServer.value;
      var timeStamp = datapackageFromServer.timeStamp;
      addData(HumidityChart, humidity, timeStamp);
      $("#humidity").text(humidity + "%");
    }
  });
  socket.on("voltage update", function (datapackageFromServer) {
    if ($("#selectMacAddress").val() == datapackageFromServer.macAddress) {
      var voltage = datapackageFromServer.value;
      var timeStamp = datapackageFromServer.timeStamp;
      addData(VoltageChart, voltage, timeStamp);
      $("#voltage").text(voltage + " V");
    }
  });
  socket.on("mac update", function (newMacAddress) {
    var ctxDropDownMacs = document.getElementById("selectMacAddress");
    var element = document.createElement("option");
    element.textContent = newMacAddress;
    element.value = newMacAddress;
    ctxDropDownMacs.appendChild(element);
  });
});
if (!$("#selectMacAddress").val()) {
  console.log("No mac address yet given");
} else {
  console.log("Updating with the mac value " + $("#selectMacAddress").val());
  updateChartForThePast24hours();
}

function updateChartForThePast24hours() {
  getUpdateForChartBasedOnTimeStamps(
    get24hPastTimeStamp(),
    getCurrentTimeStamp()
  );
}

function getCurrentTimeStamp() {
  return Math.round(new Date().getTime() / 1000);
}
function get24hPastTimeStamp() {
  return getCurrentTimeStamp() - 24 * 3600;
}
