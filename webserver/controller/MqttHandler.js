
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
      
      if(topics[1] == "newValues"){
        httpHandler.handleNewUpdateForMacDataType("MAC_" + topics[2], message.toString())
      }
      else if(topics[1] == "newMac"){
        httpHandler.throwEvent('mac update', "MAC_" + topics[2]);
      }
    })
}
MqttHandler.prototype.handleMqtt = function () {
  onMqttUpdateForTopic(this.mqtt, this.httpHandler)
}
