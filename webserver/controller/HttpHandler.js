module.exports = HttpHandler;
var moment = require('moment');
function HttpHandler(io, dataBaseHandler) {
  this.io = io;
  this.dataBaseHandler = dataBaseHandler;
}

HttpHandler.prototype.throwEvent = function(eventType, data){
  this.io.emit(eventType, data);
}

HttpHandler.prototype.handleNewUpdateForMacDataType = function(macAdress, dataType){
  var _self = this
  this.dataBaseHandler.getLimitedNrOfValuesBasedOnTableNameFromDB(macAdress, dataType, 1, 'timestamp DESC', function (err, dataFromDB){
    if (!err) {
      var datapackageToClient = {}
      datapackageToClient['macAdress'] = macAdress;
      datapackageToClient['timeStamp'] = dataFromDB[0].timestamp;
      datapackageToClient['value'] = dataFromDB[0][dataType]
      _self.throwEvent(dataType + ' update', datapackageToClient);
    } else {
      console.log(err);
    }
  });
}

function onIoConnect(dataBaseHandler, io) {
  io.on('connection', function onConnection(socket) {
    onSocketDisconnect(socket)
    onSocketGetLastTempDataByMac(socket, dataBaseHandler)
    onSocketGetLastHumDataByMac(socket, dataBaseHandler)
    onGetMinAndMaxTimestampForMac(socket, dataBaseHandler)
    onGetTempDataForTimeGivenTimespanForMac(socket, dataBaseHandler)
    onGetHumDataForTimeGivenTimespanForMac(socket, dataBaseHandler)
    onSocketError(socket)
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

function onSocketError(socket) {
  socket.on('error', (error) => {
    console.log(error)
  });
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

function convertUnixTimeStamp(timestamp){
  return moment(new Date(timestamp * 1000)).format("YYYY-MM-DD HH:mm:ss");
}
function onGetTempDataForTimeGivenTimespanForMac(socket, dataBaseHandler) {
  socket.on('getTempDataForTimeGivenTimespanForMac', function (data) {
    var fromTimeStampConverted = convertUnixTimeStamp(data.fromTimeStamp);
    var toTimeStampConverted =  convertUnixTimeStamp(data.toTimeStamp);
    dataBaseHandler.getTemperatureValuesBetweenTimeStampsFromDB(data.macAdress, fromTimeStampConverted, toTimeStampConverted, function (err, dataFromDB) {
      if (!err) {
        socket.emit('setLastTempDataByMac', {
          data: dataFromDB
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
        socket.emit('setLastHumDataByMac', {
          data: dataFromDB
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
