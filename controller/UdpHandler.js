var moment = require('moment');

var MyUdpHandler = {};
module.exports = UdpHandler;

function UdpHandler(udpSocketServer, msgHandler) {
  this.udpSocketServer = udpSocketServer;
  this.msgHandler = msgHandler;
}

function onUDPSocketListener() {
  console.log('UDP Server listening');
}

function onUDPSocketMessage(udpSocketServer, msgHandler) {
  udpSocketServer.on('message', function (message, remote) {
    var timeStamp = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    console.log("Received a message from ip '", remote.address, "' with the data '", message, "'");
    var macModified = "MAC_" + message.slice(0, 12).toString();
    msgHandler.handleMsg(message.slice(12), macModified, timeStamp, function (error) {
      if (error) {
        console.log(error);
      }
    })
  });
}

UdpHandler.prototype.runUDPServer = function () {
  this.udpSocketServer.on('error', (err) => { //TODO: Export this function
    console.log(`server error:\n${err.stack}`);
    this.close();
  });
  this.udpSocketServer.on('listening', onUDPSocketListener);
  onUDPSocketMessage(this.udpSocketServer, this.msgHandler);
}
