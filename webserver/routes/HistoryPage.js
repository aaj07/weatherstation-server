var express = require("express");
var router = express.Router();
var dataBaseHandler = require("../controller/DataBaseHandler");
var moment = require("moment");

router.get("/", function (req, res) {
  var allMacAddressesConverted = [];

  req.app.locals.dataBaseHandler.getAllMacAddresses(function (
    err,
    macAddresses
  ) {
    if (!err) {
      macAddresses.forEach((element) => {
        allMacAddressesConverted.push({
          macAddress: element.mac,
          name: element.name,
        });
      });
      res.render("history", {
        allAvailableMac: JSON.stringify(allMacAddressesConverted),
      });
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
