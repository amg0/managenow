// module DAL
var winston = require("winston");	// logging functionality
var mysql = require("mysql");		// mysql access
var dalEmployee = require("./genericdal")('employees');
var pool  = null;

exports.init = function(callback) {
	winston.info("initialize DAL & pool");
	pool = mysql.createPool({
	  connectionLimit : 10,
	  host: "localhost",
	  user: "amg0",
	  password: "Clem0tine",
	  database: "testdb"
	});
	(callback)(null);
}

exports.exit = function( callback ) {
	pool.end(function(err) {
		if(err){
			winston.error('Error happened while disconnecting from Db');
		} else {
			winston.info('The connection pool is terminated gracefully');
			// Ensures all previously enqueued queries are still
			// before sending a COM_QUIT packet to the MySQL server.
		}
		(callback)(err);
	});
}

exports.listAllEmployes = function(fields, callback) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalEmployee.listAll(connection, fields, function(err,rows) {
				connection.release();
				(callback)(err,rows);
			});
		}
	});
}

exports.addEmployee = function( employee , callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalEmployee.add(connection, employee , function(err,result) {
				connection.release();
				(callback)(err,result);
			});
		}
	});
}

exports.updateEmployee = function( id, changes, callback  ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalEmployee.update(connection, id, changes, function(err,result) {
				connection.release();
				(callback)(err,result);
			});
		}
	});
}

exports.deleteEmployee = function( id, callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalEmployee.remove(connection, id, function(err,result) {
				connection.release();
				(callback)(err,result);
			});
		}
	});
}

