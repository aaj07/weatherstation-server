var express = require('express');
var router = express.Router();
var dataBaseHandler = require('../controller/DataBaseHandler');

router.get('/', function (req, res) {
  //res.sendFile(__dirname + '/index.html');
  req.app.locals.dataBaseHandler.getAllMacAdresses(function (err, macAdresses) {
    if (!err) {
      var allMacAdressesConverted = [];
      var allNamesConverted = [];
      macAdresses.forEach(element => {
        allMacAdressesConverted.push(element.mac);
        allNamesConverted.push(element.name);
      });

      res.render('index', {
        allAvailableMac: JSON.stringify(allMacAdressesConverted),
        allNames: JSON.stringify(allNamesConverted)
      });
    } else {
      console.log(err);
    }
  })
});

var bodyParser = require('body-parser');
router.use(bodyParser.json()); // support json encoded bodies
router.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// POST http://localhost:8080/api/users
// parameters sent with 
router.post('/SetMacName', function (req, res) {
  // Too much POST data, kill the connection!
  // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
  if (req.body.length > 1e6) {
    request.connection.destroy();
  }
  var selectedMac = req.body.selectMacAdress;
  var macName = req.body.macName;
  req.app.locals.dataBaseHandler.updateValueOfKeyInTable('master_table', 'master_table', selectedMac, 'mac', macName, 'name');
});

module.exports = router;