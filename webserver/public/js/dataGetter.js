function getUpdateForChartBasedOnTimeStamps(timeStampFrom, timeStampTo) {
  getTemperatureByMacBasedOnTimeStamps(timeStampFrom, timeStampTo)
  getHumidityByMacBasedOnTimeStamps(timeStampFrom, timeStampTo)
  getVoltageByMacBasedOnTimeStamps(timeStampFrom, timeStampTo)
}
function getTemperatureByMacBasedOnTimeStamps(timeStampFrom, timeStampTo) {
  getDataByMacBasedOnTimeStamps('getTempDataForTimeGivenTimespanForMac', timeStampFrom, timeStampTo)
}
function getHumidityByMacBasedOnTimeStamps(timeStampFrom, timeStampTo) {
  getDataByMacBasedOnTimeStamps('getHumDataForTimeGivenTimespanForMac', timeStampFrom, timeStampTo)
}
function getVoltageByMacBasedOnTimeStamps(timeStampFrom, timeStampTo) {
  getDataByMacBasedOnTimeStamps('getVoltDataForTimeGivenTimespanForMac', timeStampFrom, timeStampTo)
}
function getDataByMacBasedOnTimeStamps(dataType, timeStampFrom, timeStampTo) {
  socket.emit(dataType, {
    macAdress: $('#selectMacAdress').val(),
    fromTimeStamp: timeStampFrom,
    toTimeStamp: timeStampTo
  });
}

function getUpdateForMac() {
  socket.emit('getMinAndMaxTimestampForMac', {
    macAdress: $('#selectMacAdress').val()
  });
}