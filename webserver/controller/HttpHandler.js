module.exports = HttpHandler;
var moment = require('moment');
function HttpHandler(io, dataBaseHandler) {
  this.io = io;
  this.dataBaseHandler = dataBaseHandler;
}

HttpHandler.prototype.throwEvent = function(eventType, data){
  this.io.emit(eventType, data);
}

function onIoConnect(dataBaseHandler, io) {
  io.on('connection', function onConnection(socket) {
    onSocketDisconnect(socket);
    onSocketGetLastTempDataByMac(socket, dataBaseHandler);
    onSocketGetLastHumDataByMac(socket, dataBaseHandler);
    onGetMinAndMaxTimestampForMac(socket, dataBaseHandler);
    onGetTempDataForTimeGivenTimespanForMac(socket, dataBaseHandler);
    onGetHumDataForTimeGivenTimespanForMac(socket, dataBaseHandler);
  });
}

HttpHandler.prototype.runHTTPServer = function () {
  onIoConnect(this.dataBaseHandler, this.io);
}

function onSocketDisconnect(socket) {
  socket.on('disconnect', disconnectSocket);
}

function disconnectSocket() {
  console.log("Socket disconnected!");
}

function onGetMinAndMaxTimestampForMac(socket, dataBaseHandler) {
  socket.on('getMinAndMaxTimestampForMac', function(data) {
    dataBaseHandler.getMaxTimeStampForMacFromDB(data.macAdress, function (err, dataFromDBForMax) {
      if (!err) {
        dataBaseHandler.getMinTimeStampForMacFromDB(data.macAdress, function (err, dataFromDBForMin) {
          if (!err) {
            var timeStampMin = Date.parse(dataFromDBForMin[0]["MIN(timestamp)"])/1000;
            var timeStampMax = Date.parse(dataFromDBForMax[0]["MAX(timestamp)"])/1000;
            socket.emit('setMinAndMaxTimestampForMac', {
              min: timeStampMin, 
              max: timeStampMax
            });
          } else {
            console.log(err);
          }
        })
      } else {
        console.log(err);
      }
    })
  })
}

//This function is used to remove some duplicate values. The first and the last values are kept. But only in adjacent entries.
//[ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 3, 2, 1, 1, 1, 1 ]
// will be following:
//[ 1, 1, 2, 2, 3, 4, 3, 2, 1, 1 ]
function removeDuplicateValuesKeepingTheFirstAndTheLast(element, index, array) {
  if (array[index - 1] === undefined) {
    return true;
  } else if (array[index + 1] === undefined) {
    return true;
  } else {
    return (element[this] !== array[index - 1][this] || element[this] !== array[index + 1][this])
  }
}

function convertUnixTimeStamp(timestamp){
  return moment(new Date(timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
}
function onGetTempDataForTimeGivenTimespanForMac(socket, dataBaseHandler) {
  socket.on('getTempDataForTimeGivenTimespanForMac', function (data) {
    var fromTimeStampConverted = convertUnixTimeStamp(data.fromTimeStamp);
    var toTimeStampConverted =  convertUnixTimeStamp(data.toTimeStamp);
    dataBaseHandler.getTemperatureValuesBetweenTimeStampsFromDB(data.macAdress, fromTimeStampConverted, toTimeStampConverted, function (err, dataFromDB) {
      if (!err) {
        filterDataFromDB = dataFromDB.filter(removeDuplicateValuesKeepingTheFirstAndTheLast, 'temperature');
        console.log("Temperature Data: Reduced size from \'" + dataFromDB.length + "\' to \'" + filterDataFromDB.length + "\'!");
        socket.emit('setLastTempDataByMac', {
          data: filterDataFromDB
        });
      } else {
        console.log(err);
      }
    })
  })
}

function onGetHumDataForTimeGivenTimespanForMac(socket, dataBaseHandler) {
  socket.on('getHumDataForTimeGivenTimespanForMac', function (data) {
    var fromTimeStampConverted = convertUnixTimeStamp(data.fromTimeStamp);
    var toTimeStampConverted = convertUnixTimeStamp(data.toTimeStamp);
    dataBaseHandler.getHumidityValuesBetweenTimeStampsFromDB(data.macAdress, fromTimeStampConverted, toTimeStampConverted, function (err, dataFromDB) {
      if (!err) {
        filterDataFromDB = dataFromDB.filter(removeDuplicateValuesKeepingTheFirstAndTheLast, 'humidity');
        console.log("Humidity Data: Reduced size from \'" + dataFromDB.length + "\' to \'" + filterDataFromDB.length + "\'!");
        socket.emit('setLastHumDataByMac', {
          data: filterDataFromDB
        });
      } else {
        console.log(err);
      }
    })
  })
}

function onSocketGetLastTempDataByMac(socket, dataBaseHandler) {
  socket.on('getLastTempDataByMac', function (data) {
    dataBaseHandler.getLimitedNrOfTemperatureValuesFromDB(data.macAdress, data.nrOfDatapoints, 'timestamp DESC', function (err, dataFromDB){
      if (!err) {
        socket.emit('setLastTempDataByMac', {
          data: dataFromDB
        });
      } else {
        console.log(err);
      }
    });
  });
}

//TODO: Combine the "getLastHum.." and the "getLastTemp.." since they actually do the same with one param difference.
function onSocketGetLastHumDataByMac(socket, dataBaseHandler) {
  socket.on('getLastHumDataByMac', function (data) {
    dataBaseHandler.getLimitedNrOfHumidityValuesFromDB(data.macAdress, data.nrOfDatapoints, 'timestamp DESC', function (err, dataFromDB){
      if (!err) {
        socket.emit('setLastHumDataByMac', {
          data: dataFromDB
        });
      } else {
        console.log(err);
      }
    });
  });
}
