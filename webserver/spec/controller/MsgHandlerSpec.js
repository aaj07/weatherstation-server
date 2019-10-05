var MsgHandler = require('../../controller/MsgHandler');
var dataBaseHandler = require('../../controller/DataBaseHandler');
var concreteDataBaseHandler = new dataBaseHandler();
var httpHandler = require('../../controller/HttpHandler');
var express = require('express');
var app = express(); // The () make it an instance.
var http = require('http').Server(app); // Create an express based http server
var io = require('socket.io')(http);
var concreteHttpHandler = new httpHandler(io, concreteDataBaseHandler);

// --- Msg ID
var msgTempId = 1;
var msgHumId = 2;

// --- Test Variables
var testDatapackageToClient = {};
var testMac = 1234;
var testTimeStamp = 9876;
testDatapackageToClient['macAdress'] = testMac;
testDatapackageToClient['timeStamp'] = testTimeStamp;

var masterTable = 'master_table';

var uut = new MsgHandler(concreteDataBaseHandler, concreteHttpHandler);

describe('Handle msg should be able to handle an incorrect ', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
  });
  it('message id.', function (done) {
    var msgId = 0;
    var msgData = [msgId, 0];
    uut.handleMsg(msgData, testMac, 0, function (error) {
      expect(concreteDataBaseHandler.createTable).not.toHaveBeenCalled();
      expect(concreteDataBaseHandler.insertIntoTable).not.toHaveBeenCalled();
      expect(error).toEqual(Error('The Message ID \'' + msgId + '\' is unkown.'));
      done();
    });
  });
  it('message temp size.', function (done) {
    var msgId = 0;
    var msgData = [msgTempId, 0, 0];
    uut.handleMsg(msgData, testMac, 0, function (error) {
      expect(concreteDataBaseHandler.createTable).not.toHaveBeenCalled();
      expect(concreteDataBaseHandler.insertIntoTable).not.toHaveBeenCalled();
      expect(error).toEqual(Error('The temperature msg size was wrong. {Exp: 2 vs. Given: 3}'));
      done();
    });
  });
  it('message humidity size.', function (done) {
    var msgId = 0;
    var msgData = [msgHumId, 0, 0];
    uut.handleMsg(msgData, testMac, 0, function (error) {
      expect(concreteDataBaseHandler.createTable).not.toHaveBeenCalled();
      expect(concreteDataBaseHandler.insertIntoTable).not.toHaveBeenCalled();
      expect(error).toEqual(Error('The humidity msg size was wrong. {Exp: 2 vs. Given: 3}'));
      done();
    });
  })
});

describe('Handle msg should be able to handle temperature messages when the mac was not yet stored', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createDatabase');
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
    spyOn(concreteDataBaseHandler, 'insertIgnoreIntoTable');
    spyOn(concreteHttpHandler, 'throwEvent');
    spyOn(concreteDataBaseHandler, 'selectValueFromColumnInTable').and.callFake(function () {
      arguments[4](null, []);
    });
  });
  it('with the value 0 correctly.', function (done) {
    var expectedTemp = 0;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 0];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 20 correctly.', function (done) {
    var expectedTemp = 20;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 40];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 20.5 correctly.', function (done) {
    var expectedTemp = 20.5;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 41];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value -20.5 correctly.', function (done) {
    var expectedTemp = -20.5;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, -41];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
});
describe('Handle msg should be able to handle temperature messages when the mac was stored', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createDatabase');
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
    spyOn(concreteDataBaseHandler, 'insertIgnoreIntoTable');
    spyOn(concreteHttpHandler, 'throwEvent');
    spyOn(concreteDataBaseHandler, 'selectValueFromColumnInTable').and.callFake(function () {
      arguments[4](null, [{ mac: testMac, name: 'First Prototype 1 Anton' }]);
    });
  });
  it('with the value 0 correctly.', function (done) {
    var expectedTemp = 0;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 0];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 20 correctly.', function (done) {
    var expectedTemp = 20;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 40];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 20.5 correctly.', function (done) {
    var expectedTemp = 20.5;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, 41];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value -20.5 correctly.', function (done) {
    var expectedTemp = -20.5;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, -41];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      // expect(concreteDataBaseHandler.useDatabase).toHaveBeenCalledWith(masterTable);
      // expect(concreteDataBaseHandler.useDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'temperature', dataType: 'FLOAT(3,1)' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'temperature',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'temperature', value: expectedTemp });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('temperature update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
});

// [ RowDataPacket { mac: 'ecfabc0eb2d8', name: 'First Prototype 1 Anton' } ]
describe('Handle msg should be able to handle humidity messages when the mac was not yet stored', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createDatabase');
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
    spyOn(concreteDataBaseHandler, 'insertIgnoreIntoTable');
    spyOn(concreteHttpHandler, 'throwEvent');
    spyOn(concreteDataBaseHandler, 'selectValueFromColumnInTable').and.callFake(function () {
      arguments[4](null, []);
    });
  });
  it('with the value 0', function (done) {
    var expectedHum = 0;
    testDatapackageToClient['value'] = expectedHum;
    var msgData = [msgHumId, expectedHum];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'humidity', dataType: 'TINYINT' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'humidity', value: expectedHum });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('humidity update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 100', function (done) {
    var expectedHum = 100;
    testDatapackageToClient['value'] = expectedHum;
    var msgData = [msgHumId, expectedHum];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.selectValueFromColumnInTable).toHaveBeenCalledWith(masterTable, masterTable,
        testMac, 'mac', jasmine.any(Function));
      expect(concreteDataBaseHandler.insertIgnoreIntoTable).toHaveBeenCalledWith(masterTable, masterTable,
        { columnName: 'mac', value: testMac });
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'humidity', dataType: 'TINYINT' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'humidity', value: expectedHum });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('humidity update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
});
describe('Handle msg should be able to handle humidity messages when the mac was stored', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createDatabase');
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
    spyOn(concreteDataBaseHandler, 'insertIgnoreIntoTable');
    spyOn(concreteHttpHandler, 'throwEvent');
    spyOn(concreteDataBaseHandler, 'selectValueFromColumnInTable').and.callFake(function () {
      arguments[4](null, [{ mac: testMac, name: 'First Prototype 1 Anton' }]);
    });
  });
  it('with the value 0', function (done) {
    var expectedHum = 0;
    testDatapackageToClient['value'] = expectedHum;
    var msgData = [msgHumId, expectedHum];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'humidity', dataType: 'TINYINT' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'humidity', value: expectedHum });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('humidity update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
  it('with the value 100', function (done) {
    var expectedHum = 100;
    testDatapackageToClient['value'] = expectedHum;
    var msgData = [msgHumId, expectedHum];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(concreteDataBaseHandler.createTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', dataType: 'TIMESTAMP' },
        { columnName: 'humidity', dataType: 'TINYINT' });
      expect(concreteDataBaseHandler.insertIntoTable).toHaveBeenCalledWith(testMac, 'humidity',
        { columnName: 'timestamp', value: testTimeStamp },
        { columnName: 'humidity', value: expectedHum });
      expect(concreteHttpHandler.throwEvent).toHaveBeenCalledWith('humidity update', testDatapackageToClient);
      expect(error).toBe(null);
      done();
    });
  });
});
describe('Handle msg be able to handle an error occuring while getting the mac', function () {
  beforeEach(function () {
    spyOn(concreteDataBaseHandler, 'createDatabase');
    spyOn(concreteDataBaseHandler, 'createTable');
    spyOn(concreteDataBaseHandler, 'insertIntoTable');
    spyOn(concreteDataBaseHandler, 'insertIgnoreIntoTable');
    spyOn(concreteHttpHandler, 'throwEvent');
    spyOn(concreteDataBaseHandler, 'selectValueFromColumnInTable').and.callFake(function () {
      arguments[4](true, null);
    });
  });
  it('with the humidity value 0', function (done) {
    var expectedHum = 0;
    testDatapackageToClient['value'] = expectedHum;
    var msgData = [msgHumId, expectedHum];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(error).toEqual(new Error('Could not store the mac ' + testMac + '.'));
      done();
    });
  });
  it('with the temperature value 0', function (done) {
    var expectedTemp = 0;
    testDatapackageToClient['value'] = expectedTemp;
    var msgData = [msgTempId, expectedTemp];
    uut.handleMsg(msgData, testMac, testTimeStamp, function (error) {
      expect(concreteDataBaseHandler.createDatabase).toHaveBeenCalledWith(testMac);
      expect(error).toEqual(new Error('Could not store the mac ' + testMac + '.'));
      done();
    });
  });
});