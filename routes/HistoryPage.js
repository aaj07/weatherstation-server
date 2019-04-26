var express = require('express');
var router = express.Router();
var dataBaseHandler = require('../controller/DataBaseHandler');
var moment = require('moment');

router.get('/', function (req, res) {
  var allMacAdressesConverted = [];
  
  req.app.locals.dataBaseHandler.getAllMacAdresses(function (err, macAdresses) {
    if (!err) {
      macAdresses.forEach(element => {
        allMacAdressesConverted.push({ macAdress: element.mac, name: element.name });
      });
      res.render('history', {
        allAvailableMac: JSON.stringify(allMacAdressesConverted)
      });
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
