var UdpHandler = require('../../controller/UdpHandler');

var dgram = require('dgram');
var udpSocketServer = dgram.createSocket('udp4');

var MsgHandler = require('../../controller/MsgHandler');
var concreteMsgHandler = new MsgHandler();

var moment = require('moment');

var testIP = '172.0.0.1';
var testMac = '12:13:14:15:16:17';
var testMacModified = '121314151617';
var testTimeStamp = '9876';
var testMsgOutput = 'Hello World';
var testMsgInput = testMacModified + testMsgOutput;
var testMacModifiedExpected = 'MAC_' + testMacModified;

var uut = new UdpHandler(udpSocketServer, concreteMsgHandler);

var remote = {
  address: testIP
}

describe('Run udp without error.', function () {
  beforeEach(function () {
    jasmine.clock().install();
    var today = moment('2015-10-19').toDate();
    jasmine.clock().mockDate(today);
    spyOn(udpSocketServer, 'on').and.callFake(function () {
      if (arguments[0] == 'message') {
        arguments[1](testMsgInput, remote);
      }
      if (arguments[0] == 'listening') {
        arguments[1]();
      }
    });
  });
  afterEach(function () {
    jasmine.clock().uninstall();
  });

  describe('Run udp handler should setup all \'on\' functions and call the msg handler.', function () {
    var msgParam = {
      'success': null,
      'fail': "ERROR"
    }

    it('It should handle no msg handler error.', function (done) {
      console.log = jasmine.createSpy("log");
      spyOn(concreteMsgHandler, 'handleMsg').and.callFake(function () {
        arguments[3](msgParam['success']);
      });

      uut.runUDPServer();
      expect(concreteMsgHandler.handleMsg).toHaveBeenCalledWith(testMsgOutput, testMacModifiedExpected, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), jasmine.any(Function));
      expect(console.log).not.toHaveBeenCalledWith(msgParam['fail']);
      done();
    });

    it('It should handle a msg handler error.', function (done) {
      console.log = jasmine.createSpy("log");
      spyOn(concreteMsgHandler, 'handleMsg').and.callFake(function () {
        arguments[3](msgParam['fail']);
      });

      uut.runUDPServer();
      expect(concreteMsgHandler.handleMsg).toHaveBeenCalledWith(testMsgOutput, testMacModifiedExpected, moment(new Date()).format("YYYY-MM-DD HH:mm:ss"), jasmine.any(Function));
      expect(console.log).toHaveBeenCalledWith(msgParam['fail']);
      done();
    });
  });

  describe('Run udp handler should ', function () {
    beforeEach(function () {
    });
  
    it('react on listening', function (done) {
      console.log = jasmine.createSpy("log");
      spyOn(concreteMsgHandler, 'handleMsg');
      
      uut.runUDPServer();
      expect(console.log).toHaveBeenCalledWith('UDP Server listening');
      done();
    });
  });
});
