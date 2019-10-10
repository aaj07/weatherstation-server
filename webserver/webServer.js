var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var router = express.Router()
var mysql = require('mysql')
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


var httpHandler = require('./controller/HttpHandler')
var myHttpHandler = new httpHandler(io, myDataBaseHandler)
myHttpHandler.runHTTPServer()

// --- MQTT handler
var mqttHandler = require('./controller/MqttHandler')
var myMqttHandler = new mqttHandler(mqtt, myDataBaseHandler, myHttpHandler)
myMqttHandler.handleMqtt()