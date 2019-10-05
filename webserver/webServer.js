var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var router = express.Router()
var mysql = require('mysql')
var dgram = require('dgram')
var mqtt = require('mqtt')

// --- Database Handling
var dbHandler = require('./controller/DataBaseHandler')
var dbHost = '127.0.0.1'
if(process.env.DB_HOST){
  console.log("Got following DB host as environment variable: ", process.env.DB_HOST)
  dbHost = process.env.DB_HOST
}
var myDataBaseHandler = new dbHandler(mysql, dbHost, 'root', '')

// --- Create the data base connection.
function handleDisconnectedDatabase(){ 
  myDataBaseHandler.createDatabaseConnection(function(error){
    if (error) {
      console.log(error)
      setTimeout(handleDisconnectedDatabase, 2000)
    }
  })
}

handleDisconnectedDatabase()

// --- Routes
var HistoryPage = require('./routes/HistoryPage')
app.locals.dataBaseHandler = myDataBaseHandler
app.use('/history', HistoryPage)
var IndexPage = require('./routes/IndexPage')
app.use('/', IndexPage)

// --- Setting the view engine
app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'))

// --- Websocket ---
io.on('connection', function(socket) {
  console.log('A new WebSocket connection has been established')
})

exports.server = http.listen(8000, function() {
  console.log('Listening on *:8000')
  console.log(http.address())
})

var nameMasterTable = 'master_table'
myDataBaseHandler.createDatabase(nameMasterTable)
myDataBaseHandler.createTable(nameMasterTable, nameMasterTable, {
    columnName: 'mac',
    dataType: 'CHAR(16)'
  }, {
      columnName: 'name',
      dataType: 'TINYTEXT'
    }, {
      columnName: 'status',
      dataType: 'TINYTEXT'
    })
// --- UDP Server Handler
var udpSocketServer = dgram.createSocket('udp4')
udpSocketServer.bind(2807)
var udpHandler = require('./controller/UdpHandler')
var httpHandler = require('./controller/HttpHandler')
var myHttpHandler = new httpHandler(io, myDataBaseHandler)
var msgHandler = require('./controller/MsgHandler')
var myMsgHandler = new msgHandler(myDataBaseHandler, myHttpHandler)
var myUdpHandler = new udpHandler(udpSocketServer, myMsgHandler)
// console.log = function() {} // Disables the logging.
myUdpHandler.runUDPServer()
myHttpHandler.runHTTPServer()

// --- MQTT handler
var mqttClient = mqtt.connect({host: '192.168.178.99', port: '1883', protocol: 'mqtt'})
mqttClient.subscribe('/esp/#')
mqttClient.on('message', function (topic, message) {
    console.log(topic)
    console.log(message.toString())
})