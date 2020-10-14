var httpHandler = require("../../controller/HttpHandler");
var dataBaseHandler = require("../../controller/DataBaseHandler");
var concreteDataBaseHandler = new dataBaseHandler();
var express = require("express");
var app = express(); // The () make it an instance.
var http = require("http").Server(app); // Create an express based http server
var io = require("socket.io")(http);

var testNrOfDatapoints = 5;
var testTimeStamp = 9876;
var uut = new httpHandler(io, concreteDataBaseHandler);
var testMac = "1234";
var testTempValue = 22;
var testHumValue = 55;

var testData = {
  macAddress: testMac,
  nrOfDatapoints: testNrOfDatapoints,
};

var testTempData = {
  data: {
    testTimeStamp,
    testTempValue,
  },
};
var testTempEmitData = {
  data: testTempData,
};

var testHumData = {
  data: {
    testTimeStamp,
    testHumValue,
  },
};
var testHumEmitData = {
  data: testHumData,
};
var socket = {
  on: function (type, callback) {
    callback();
  },
  emit: function (type, data) {},
};

var testEventType = "testEvent";

describe("try calling http server)", function () {
  beforeEach(function () {
    spyOn(io, "on").and.callFake(function () {
      if (arguments[0] == "connection") {
        arguments[1](socket);
      }
    });
    spyOn(
      concreteDataBaseHandler,
      "getLimitedNrOfTemperatureValuesFromDB"
    ).and.callFake(function () {
      arguments[3](null, testTempData);
    });
    spyOn(
      concreteDataBaseHandler,
      "getLimitedNrOfHumidityValuesFromDB"
    ).and.callFake(function () {
      arguments[3](null, testHumData);
    });
    spyOn(socket, "emit");
    spyOn(console, "log");
    spyOn(socket, "on").and.callFake(function () {
      if (arguments[0] == "disconnect") {
        arguments[1]("disconnectSocket");
      } else if (arguments[0] == "getLastTempDataByMac") {
        arguments[1](testData);
      } else if (arguments[0] == "getLastHumDataByMac") {
        arguments[1](testData);
      }
    });
  });
  it("init", function (done) {
    uut.runHTTPServer();
    expect(
      concreteDataBaseHandler.getLimitedNrOfTemperatureValuesFromDB
    ).toHaveBeenCalledWith(
      testMac,
      testData.nrOfDatapoints,
      "timestamp DESC",
      jasmine.any(Function)
    );
    expect(socket.emit).toHaveBeenCalledWith(
      "setLastTempDataByMac",
      testTempEmitData
    );
    expect(
      concreteDataBaseHandler.getLimitedNrOfHumidityValuesFromDB
    ).toHaveBeenCalledWith(
      testMac,
      testData.nrOfDatapoints,
      "timestamp DESC",
      jasmine.any(Function)
    );
    expect(socket.emit).toHaveBeenCalledWith(
      "setLastHumDataByMac",
      testHumEmitData
    );
    done();
  });
});

describe("try throwing event", function () {
  beforeEach(function () {
    spyOn(io, "emit");
  });
  it("init", function (done) {
    uut.throwEvent(testEventType, testData);
    expect(io.emit).toHaveBeenCalledWith(testEventType, testData);
    done();
  });
});
