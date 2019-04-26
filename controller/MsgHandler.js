var msgIdTemp = 1;
var msgSizeTemp = 2;
var msgIdHum = 2;
var msgSizeHum = 2;
var detectTimout = [];

function handleMacAdress(macAdress, dataBaseHandler, httpHandler, callback) {
  dataBaseHandler.createDatabase(macAdress);

  dataBaseHandler.selectValueFromColumnInTable('master_table', 'master_table', macAdress, 'mac', function (error, result) {
    if (!error) {
      if (result.length == 0) {
        var status = 'online'; //TODO: Remove
        dataBaseHandler.insertIgnoreIntoTable('master_table', 'master_table', {
          columnName: 'mac',
          value: macAdress
        });
        httpHandler.throwEvent('mac update', macAdress);
      }
      callback(null);
    } else {
      callback(error);
    }
  });
}

function handleMsgTemperature(receivedMsg, macAdress, timeStamp, dataBaseHandler, httpHandler, callback) {
  if (receivedMsg.length == msgSizeTemp) {
    handleMacAdress(macAdress, dataBaseHandler, httpHandler, function (error) {
      if (!error) {
        var datapackageToClient = {};
        var realTemp = receivedMsg[1] / 2;
        var msgType = 'temperature';
        handleMsgToDatabase(msgType, macAdress, realTemp, 'FLOAT(3,1)', timeStamp, dataBaseHandler);
        datapackageToClient['macAdress'] = macAdress;
        datapackageToClient['timeStamp'] = timeStamp;
        datapackageToClient['value'] = realTemp;
        handleMsgToClients(msgType, datapackageToClient, httpHandler);
        callback(null);
      } else {
        console.log(error);
        callback(new Error('Could not store the mac ' + macAdress + '.'));
      }
    });
  } else {
    callback(new Error('The temperature msg size was wrong. {Exp: ' + msgSizeTemp + ' vs. Given: ' + receivedMsg.length + '}'));
  }
}

function handleMsgHumidity(receivedMsg, macAdress, timeStamp, dataBaseHandler, httpHandler, callback) {
  if (receivedMsg.length == msgSizeHum) {
    handleMacAdress(macAdress, dataBaseHandler, httpHandler, function (error) {
      if (!error) {
        var datapackageToClient = {};
        var realHumidity = receivedMsg[1];
        var msgType = 'humidity';
        handleMsgToDatabase(msgType, macAdress, realHumidity, 'TINYINT', timeStamp, dataBaseHandler);
        datapackageToClient['macAdress'] = macAdress;
        datapackageToClient['timeStamp'] = timeStamp;
        datapackageToClient['value'] = realHumidity;
        handleMsgToClients(msgType, datapackageToClient, httpHandler);
        callback(null);
      } else {
        console.log(error);
        callback(new Error('Could not store the mac ' + macAdress + '.'));
      }
    });
  } else {
    callback(new Error('The humidity msg size was wrong. {Exp: ' + msgSizeHum + ' vs. Given: ' + receivedMsg.length + '}'));
  }
}

function handleMsgToDatabase(msgType, macAdress, data, sqlDataType, timeStamp, dataBaseHandler) {
  dataBaseHandler.createTable(macAdress, msgType, { columnName: 'timestamp', dataType: 'TIMESTAMP' }, { columnName: msgType, dataType: sqlDataType });

  //Here one should check, whether the last two values from the msgType are the same.
  //If the two are the same and the new value has also the same value, update the timestamp of the newest entry.

  //macAdress --> dataBaseName
  //msgType --> tableName
  dataBaseHandler.insertIntoTable(macAdress, msgType,
    { columnName: 'timestamp', value: timeStamp },
    { columnName: msgType, value: data });
}

function handleMsgToClients(msgType, datapackageToClient, httpHandler) {
  console.log('Informing the clients about a \'', msgType, '\' change!');
  httpHandler.throwEvent(msgType + ' update', datapackageToClient);
}

module.exports = MsgHandler;

function MsgHandler(dataBaseHandler, httpHandler) {
  this.dataBaseHandler = dataBaseHandler;
  this.httpHandler = httpHandler;
}

MsgHandler.prototype.handleMsg = function (receivedMsg, macAdress, timeStamp, callback) {
  var msgId = receivedMsg[0];
  if (msgId == msgIdTemp) {
    handleMsgTemperature(receivedMsg, macAdress, timeStamp, this.dataBaseHandler, this.httpHandler, callback);
  } else if (msgId == msgIdHum) {
    handleMsgHumidity(receivedMsg, macAdress, timeStamp, this.dataBaseHandler, this.httpHandler, callback);
  } else {
    callback(new Error('The Message ID \'' + msgId + '\' is unkown.'));
  }
}
