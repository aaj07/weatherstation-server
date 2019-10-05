// Globally scoped object to remember the database connection.
var MyDataBaseHandler = {};

module.exports = DataBaseHandler;

function DataBaseHandler(mysql, host, user, password) {
  this.mysql = mysql;
  this.host = host;
  this.user = user;
  this.password = password;
  this.masterTableName = `master_table`;
}

DataBaseHandler.prototype.createDatabaseConnection = function(error) {
  this.connection = this.mysql.createConnection({
    host: this.host,
    user: this.user,
    password: this.password,
    insecureAuth: true
  });
  this.connection.connect(error);
}

function writeQueryToConnection (connection, sqlQuery, callback) {
  console.log(`About to execute following query: `, sqlQuery);
  connection.query(sqlQuery, callback);
  console.log(`Query [`, sqlQuery, `] executed!`);
}

function logError(error) {
  if (error) {
    console.log(error);
  }
}

DataBaseHandler.prototype.createDatabase = function(dataBaseName) {
  var sql = `CREATE DATABASE IF NOT EXISTS ${dataBaseName}`;
  writeQueryToConnection(this.connection, sql, logError);
  console.log(`Database [`, dataBaseName, `] created`);
}

DataBaseHandler.prototype.getLimitedNrOfValuesBasedOnTableNameFromDB = function(dataBaseName, tableName, limit, orderBy, callback) {
  getLimitedNrOfValuesFromDB(this.connection, dataBaseName, tableName, limit, orderBy, callback)
}
DataBaseHandler.prototype.getLimitedNrOfTemperatureValuesFromDB = function(dataBaseName, limit, orderBy, callback) {
  getLimitedNrOfValuesFromDB(this.connection, dataBaseName, `temperature`, limit, orderBy, callback);
}
DataBaseHandler.prototype.getLimitedNrOfHumidityValuesFromDB = function(dataBaseName, limit, orderBy, callback) {
  getLimitedNrOfValuesFromDB(this.connection, dataBaseName, `humidity`, limit, orderBy, callback);
}
function getLimitedNrOfValuesFromDB(connection, dataBaseName, tableName, limit, orderBy, callback) {
  var sql = `SELECT * FROM ${dataBaseName}.${tableName} ORDER BY ${orderBy} LIMIT ${limit}`;
  writeQueryToConnection(connection, sql, callback);
}

DataBaseHandler.prototype.getTemperatureValuesBetweenTimeStampsFromDB = function(dataBaseName, fromTimeStamp, toTimeStamp, callback) {
  getValuesBetweenTimeStampsFromDB(this.connection, dataBaseName, `temperature`, fromTimeStamp, toTimeStamp, callback);
}
DataBaseHandler.prototype.getHumidityValuesBetweenTimeStampsFromDB = function(dataBaseName, fromTimeStamp, toTimeStamp, callback) {
  getValuesBetweenTimeStampsFromDB(this.connection, dataBaseName, `humidity`, fromTimeStamp, toTimeStamp, callback);
}
function getValuesBetweenTimeStampsFromDB(connection, dataBaseName, tableName, fromTimeStamp, toTimeStamp, callback) {
  var sql = `SELECT * FROM ${dataBaseName}.${tableName} WHERE timestamp BETWEEN \'${fromTimeStamp}\' AND \'${toTimeStamp}\'`;
  writeQueryToConnection(connection, sql, callback);
}

DataBaseHandler.prototype.getMaxTimeStampForMacFromDB = function(dataBaseName, callback){
  getMinOrMaxTimeStampFromDB(this.connection, dataBaseName, `MAX`, callback);
}
DataBaseHandler.prototype.getMinTimeStampForMacFromDB = function(dataBaseName, callback){
  getMinOrMaxTimeStampFromDB(this.connection, dataBaseName, `MIN`, callback);
}
function getMinOrMaxTimeStampFromDB(connection, dataBaseName, minOrMax, callback) {
  var sql = `SELECT ${minOrMax}(timestamp) FROM (SELECT timestamp FROM ${dataBaseName}.humidity UNION ALL SELECT timestamp FROM ${dataBaseName}.temperature) as subQuery`;
  writeQueryToConnection(connection, sql, callback);
}

DataBaseHandler.prototype.getAllTemperatureValuesFromDB = function(dataBaseName, callback) {
  getAllValuesFromDB(this.connection, dataBaseName, `temperature`, callback);
}
DataBaseHandler.prototype.getAllHumidityValuesFromDB = function(dataBaseName, callback) {
  getAllValuesFromDB(this.connection, dataBaseName, `humidity`, callback);
}
function getAllValuesFromDB(connection, dataBaseName, tableName, callback){
  var sql = `SELECT * FROM ${dataBaseName}.${tableName}`;
  writeQueryToConnection(connection, sql, callback);
}

DataBaseHandler.prototype.getAllMacAdresses = function(callback) {
  var sql = `SELECT mac,name FROM ${this.masterTableName}.${this.masterTableName}`; //TODO: Rename the database name
  writeQueryToConnection(this.connection, sql, callback);
}

DataBaseHandler.prototype.getAllNamesForTheMacAdress = function(callback) {
  sql = `SELECT name FROM ${this.masterTableName}.${this.masterTableName}`;
  writeQueryToConnection(this.connection, sql, callback);
}

DataBaseHandler.prototype.createTable = function(dataBaseName, tableName, ...columnDataType) {
  var sql = `CREATE TABLE IF NOT EXISTS ${dataBaseName}.${tableName} (`;
  for (var i = 0; i < columnDataType.length; i++) {
    if (i != 0) {
      sql += `, `;
    }
    sql += columnDataType[i].columnName + ` ` + columnDataType[i].dataType;
    if (i == 0) {
      sql += ` UNIQUE`
    }
  }
  sql += `)`;
  writeQueryToConnection(this.connection, sql, logError);
}

DataBaseHandler.prototype.insertIntoTable = function(dataBaseName, tableName, ...columnDataType) {
  var sql = `INSERT INTO ${dataBaseName}.${tableName} (`;
  privateInsertIntoTable(this.connection, sql, ...columnDataType);
}

DataBaseHandler.prototype.insertIgnoreIntoTable = function(dataBaseName, tableName, ...columnDataType) {
  var sql = `INSERT IGNORE INTO ${dataBaseName}.${tableName} (`;
  privateInsertIntoTable(this.connection, sql, ...columnDataType);
}

function privateInsertIntoTable(connection, sql, ...columnDataType) {
  for (var i = 0; i < columnDataType.length; i++) {
    if (i != 0) {
      sql += `, `;
    }
    sql += columnDataType[i].columnName;
  }
  sql += `) VALUES (\'`;
  for (var i = 0; i < columnDataType.length; i++) {
    if (i !== 0) {
      sql += `\', \'`;
    }
    sql += columnDataType[i].value;
  }
  sql += `\')`;

  writeQueryToConnection(connection, sql, logError);
}

DataBaseHandler.prototype.updateValueOfKeyInTable = function(dataBaseName, tableName, key, keyColumnName, value, valueColumnName) {
  var sql = `UPDATE ${dataBaseName}.${tableName} SET ${valueColumnName} = \'${value}\' WHERE ${keyColumnName} = \'${key}\'`;
  writeQueryToConnection(this.connection, sql, logError);
}

DataBaseHandler.prototype.selectValueFromColumnInTable = function(dataBaseName, tableName, key, keyColumnName, callback) {
  var sql = `SELECT * FROM ${dataBaseName}.${tableName} WHERE ${keyColumnName} = \'${key}\'`;
  writeQueryToConnection(this.connection, sql, callback);
}
