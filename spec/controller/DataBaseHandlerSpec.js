var dbHandler = require('../../controller/DataBaseHandler');
var mysql = require('mysql');

var hostName = '1.2.3.4';
var userName = 'test_user';
var passwordName = 'password';

var mysqlConnectionFake = {
  connect: function () {
  },
  query: function (sqlQuery, callback) {
  },
};

var uut = new dbHandler(mysql, hostName, userName, passwordName);

var testDataBaseName = "HELLO WORLD";

describe('Create a connection', function () {
  beforeEach(function () {
    spyOn(mysql, 'createConnection').and.returnValue(mysqlConnectionFake);
  });

  it('should work successfully', function () {
    uut.createDatabaseConnection(function (error) {
      expect(mysql.createConnection).toHaveBeenCalledWith({
        host: hostName,
        user: userName,
        password: passwordName,
        insecueAuth: true
      });
    });
  });
});
describe('Write query for ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query');
  });

  it('create database.', function () {
    var dbName = 'MyDB';
    uut.createDatabase(dbName);
    expect(mysqlConnectionFake.query).toHaveBeenCalledWith('CREATE DATABASE IF NOT EXISTS ' + dbName, jasmine.any(Function));
  });
});

describe('Accessing the mastertable successfully ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](null, true);
    });
  });
  it('should allow to get all mac adresses.', function () {
    uut.getAllMacAdresses(function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT mac,name FROM master_table.master_table', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('should allow to get all names for the mac adresses.', function () {
    uut.getAllNamesForTheMacAdress(function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT name FROM master_table.master_table', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
});

describe('Accessing the mastertable not successfully ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](true, null);
    });
  });
  it('should handle the erro when trying to get all mac adresses.', function () {
    uut.getAllMacAdresses(function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT mac,name FROM master_table.master_table', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('should allow to get all names for the mac adresses.', function () {
    uut.getAllNamesForTheMacAdress(function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT name FROM master_table.master_table', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
});

describe('Get temperature successfully for ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](null, true);
    })
  });
  it('limited number of values from db.', function () {
    var limit = '10';
    var orderBy = 'ASC';

    uut.getLimitedNrOfTemperatureValuesFromDB(testDataBaseName, limit, orderBy, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature ORDER BY ' + orderBy + ' LIMIT ' + limit, jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('all values from db.', function () {
    uut.getAllTemperatureValuesFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('values between two timestamps.', function () {
    var fromTimeStamp = '2018-03-17 15:09:49';
    var toTimeStamp = '2018-03-17 15:21:54';
    uut.getTemperatureValuesBetweenTimeStampsFromDB(testDataBaseName, fromTimeStamp, toTimeStamp, function(error, result){
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature WHERE timestamp BETWEEN \'' + fromTimeStamp + '\' AND \'' + toTimeStamp + '\'', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
});

describe('Get temperature not successfully for ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](true, null);
    })
  });
  it('limited number of values from db.', function () {
    var limit = '10';
    var orderBy = 'ASC';

    uut.getLimitedNrOfTemperatureValuesFromDB(testDataBaseName, limit, orderBy, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature ORDER BY ' + orderBy + ' LIMIT ' + limit, jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('all values from db.', function () {
    uut.getAllTemperatureValuesFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('values between two timestamps.', function () {
    var fromTimeStamp = '2018-03-17 15:09:49';
    var toTimeStamp = '2018-03-17 15:21:54';
    uut.getTemperatureValuesBetweenTimeStampsFromDB(testDataBaseName, fromTimeStamp, toTimeStamp, function(error, result){
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'temperature WHERE timestamp BETWEEN \'' + fromTimeStamp + '\' AND \'' + toTimeStamp + '\'', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
});

describe('Get humidity successfully for ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](null, true);
    })
  });

  it('limited number of values from db.', function () {
    var limit = '10';
    var orderBy = 'ASC';

    uut.getLimitedNrOfHumidityValuesFromDB(testDataBaseName, limit, orderBy, function (error, result) {

      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity ORDER BY ' + orderBy + ' LIMIT ' + limit, jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('all values from db.', function () {
    uut.getAllHumidityValuesFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('values between two timestamps.', function () {
    var fromTimeStamp = '2018-03-17 15:09:49';
    var toTimeStamp = '2018-03-17 15:21:54';
    uut.getHumidityValuesBetweenTimeStampsFromDB(testDataBaseName, fromTimeStamp, toTimeStamp, function(error, result){
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity WHERE timestamp BETWEEN \'' + fromTimeStamp + '\' AND \'' + toTimeStamp + '\'', jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
});

describe('Get humidity not successfully for ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](true, null);
    })
  });
  it('limited number of values from db.', function () {
    var limit = '10';
    var orderBy = 'ASC';

    uut.getLimitedNrOfHumidityValuesFromDB(testDataBaseName, limit, orderBy, function (error, result) {

      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity ORDER BY ' + orderBy + ' LIMIT ' + limit, jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('all values from db.', function () {
    uut.getAllHumidityValuesFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('values between two timestamps.', function () {
    var fromTimeStamp = '2018-03-17 15:09:49';
    var toTimeStamp = '2018-03-17 15:21:54';
    uut.getHumidityValuesBetweenTimeStampsFromDB(testDataBaseName, fromTimeStamp, toTimeStamp, function(error, result){
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith('SELECT * FROM ' + testDataBaseName + '.' + 'humidity WHERE timestamp BETWEEN \'' + fromTimeStamp + '\' AND \'' + toTimeStamp + '\'', jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
});

describe('Table functions ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](null, true);
    })
  });
  it('should allow the creation of a table.', function () {
    var tableName = 'TestTable';
    var firstColumn = {columnName:'timestamp', dataType:'TIMESTAMP'};
    var secondColumn = {columnName:'temperature', dataType:'FLOAT(3,1)'};

    var expectedString = 'CREATE TABLE IF NOT EXISTS ' + testDataBaseName + '.' + tableName + ' (' + firstColumn.columnName + ' ' + 
                            firstColumn.dataType + ' UNIQUE, ' + secondColumn.columnName + ' ' + secondColumn.dataType + ')';
    uut.createTable(testDataBaseName, tableName, firstColumn, secondColumn);
    expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
  });
  it('should allow the insertion into a table.', function () {
    var tableName = 'TestTable';
    var firstColumn = {columnName:'timestamp', value:'01.01.2010'};
    var secondColumn = {columnName:'temperature', value:'120'};

    var expectedString = 'INSERT INTO ' + testDataBaseName + '.' + tableName + ' (' + firstColumn.columnName + ', ' + secondColumn.columnName + ') VALUES (\'' +
                            firstColumn.value + '\', \'' + secondColumn.value + '\')';
    uut.insertIntoTable(testDataBaseName, tableName, firstColumn, secondColumn);
    expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
  });
  it('should allow the insertion ignore into a table.', function () {
    var tableName = 'TestTable';
    var firstColumn = {columnName:'timestamp', value:'01.01.2010'};
    var secondColumn = {columnName:'temperature', value:'120'};

    var expectedString = 'INSERT IGNORE INTO ' + testDataBaseName + '.' + tableName + ' (' + firstColumn.columnName + ', ' + secondColumn.columnName + ') VALUES (\'' +
                            firstColumn.value + '\', \'' + secondColumn.value + '\')';
    uut.insertIgnoreIntoTable(testDataBaseName, tableName, firstColumn, secondColumn);
    expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
  });
});
describe('Value operations ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query');
  });
  it('should allow updating of a value.', function () {
    var tableName = 'TestTable';
    var key = 'myIDKey';
    var keyColumnName = 'ID_Column_Name';
    var value = 'The_New_Value';
    var valueColumnName = 'Value_Column_Name';

    var expectedString = 'UPDATE ' + testDataBaseName + '.' + tableName + ' SET ' + valueColumnName + ' = \'' + value + '\' WHERE ' + keyColumnName + ' = \'' + key + '\'';
    uut.updateValueOfKeyInTable(testDataBaseName, tableName, key, keyColumnName, value, valueColumnName);
    expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
  });
  it('should allow the selecting of a value.', function () {
    var tableName = 'TestTable';
    var key = 'myIDKey';
    var keyColumnName = 'ID_Column_Name';

    var expectedString = 'SELECT * FROM ' + tableName + ' WHERE ' + keyColumnName + ' = \'' + key + '\'';
    uut.selectValueFromColumnInTable(tableName, key, keyColumnName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));

    });
  });
});

describe('Value operations not succesful ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query');
  });
  it('should allow the selecting of a value and return the error properly.', function () {
    var tableName = 'TestTable';
    var key = 'myIDKey';
    var keyColumnName = 'ID_Column_Name';

    var expectedString = 'SELECT * FROM ' + tableName + ' WHERE ' + keyColumnName + ' = \'' + key + '\'';
    uut.selectValueFromColumnInTable(tableName, key, keyColumnName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
    });
  });
});

describe('Get MinAndMaxTimeStamp for mac from DB ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](null, true);
    })
  });
  it('Max.', function () {
    var expectedString = 'SELECT MAX(timestamp) FROM (SELECT timestamp FROM ' + testDataBaseName + '.humidity UNION ALL SELECT timestamp FROM ' + testDataBaseName + '.temperature) as subQuery';
    uut.getMaxTimeStampForMacFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
  it('Min.', function () {
    var expectedString = 'SELECT MIN(timestamp) FROM (SELECT timestamp FROM ' + testDataBaseName + '.humidity UNION ALL SELECT timestamp FROM ' + testDataBaseName + '.temperature) as subQuery';
    uut.getMinTimeStampForMacFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
      expect(error).toBe(null);
      expect(result).toBe(true);
    });
  });
});
describe('Get MinAndMaxTimeStamp for mac not successful from DB ', function () {
  beforeEach(function () {
    uut.connection = mysqlConnectionFake;
    spyOn(mysqlConnectionFake, 'query').and.callFake(function(){
      arguments[1](true, null);
    })
  });
  it('Max.', function () {
    var expectedString = 'SELECT MAX(timestamp) FROM (SELECT timestamp FROM ' + testDataBaseName + '.humidity UNION ALL SELECT timestamp FROM ' + testDataBaseName + '.temperature) as subQuery';
    uut.getMaxTimeStampForMacFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
  it('Min.', function () {
    var expectedString = 'SELECT MIN(timestamp) FROM (SELECT timestamp FROM ' + testDataBaseName + '.humidity UNION ALL SELECT timestamp FROM ' + testDataBaseName + '.temperature) as subQuery';
    uut.getMinTimeStampForMacFromDB(testDataBaseName, function (error, result) {
      expect(mysqlConnectionFake.query).toHaveBeenCalledWith(expectedString, jasmine.any(Function));
      expect(error).toBe(true);
      expect(result).toBe(null);
    });
  });
});