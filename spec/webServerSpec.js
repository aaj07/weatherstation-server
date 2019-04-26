/* var webServer = require('../../webServer');
var dataBaseHandler = require('../../controller/DataBaseHandler');
var mysql = require('mysql');


// --- Test Variables
var nameTestMasterTable = 'master_table';

describe('createDatabaseConnection Tests', function() {
  beforeEach(function() {
    spyOn(dataBaseHandler, 'createDatabaseConnection');
    spyOn(dataBaseHandler, 'createDatabase');
    spyOn(dataBaseHandler, 'createTable');
  })
  it('Database could be initialized', function(done) {
    webServer.initDataBase();
    expect(dataBaseHandler.createDatabaseConnection).toHaveBeenCalledWith(mysql, '127.0.0.1', 'root', '');
    expect(dataBaseHandler.createDatabase).toHaveBeenCalledWith(nameTestMasterTable);
    expect(dataBaseHandler.createTable).toHaveBeenCalledWith(nameTestMasterTable, {
      columnName: 'mac',
      dataType: 'CHAR(12)'
    }, {
      columnName: 'name',
      dataType: 'TINYTEXT'
    }, {
      columnName: 'status',
      dataType: 'TINYTEXT'
    });
    done();
  });

});
 */