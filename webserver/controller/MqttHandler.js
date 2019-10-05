

function handleMsgToClients(msgType, datapackageToClient, httpHandler) {
  console.log('Informing the clients about a \'', msgType, '\' change!');
  httpHandler.throwEvent(msgType + ' update', datapackageToClient);
}

module.exports = MqttHandler;

function MqttHandler(mqtt, dataBaseHandler, httpHandler) {
  this.mqtt = mqtt;
  this.dataBaseHandler = dataBaseHandler;
  this.httpHandler = httpHandler;
}

function onMqttUpdateForTopic(mqtt, httpHandler){
  var mqttClient = mqtt.connect({host: '192.168.178.99', port: '1883', protocol: 'mqtt'})
  mqttClient.subscribe('db/newValues/#')
  mqttClient.on('message', function (topic, message) {
      var topics = topic.split('/')
      httpHandler.handleNewUpdateForMacDataType("MAC_" + topics[2], message.toString())
  })
}
MqttHandler.prototype.handleMqtt = function () {
  onMqttUpdateForTopic(this.mqtt, this.httpHandler)
}
