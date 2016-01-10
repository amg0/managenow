//# sourceURL=dal.js
// "use strict";

var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'output.log' });
var mysql = require("mysql");		// mysql access
var genericdal = require("./genericdal");
var pool  = null;

var tables = ['projects','users','milestones'];
var dals = {};

exports.init = function(callback) {
	winston.info("initialize DAL & pool");
	for (var i =0 ; i< tables.length ; i++) {
		var name = tables[i];
		dals[name] = genericdal(name);
	}
	pool = mysql.createPool({
	  connectionLimit : 10,
	  host: "localhost",
	  user: "amg0",
	  password: "xxx",
	  database: "testdb",
	  dateStrings: true
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

exports.listAll = function(type, fields, filters, callback) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dals[type].listAll(connection, fields, filters, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

exports.get = function( type, id , callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dals[type].get(connection, {id:id} , function(error,results, fields) {
				connection.release();
				winston.info(results);
				winston.info(fields);
				(callback)(error,results, fields);
			});
		}
	});
}

exports.add = function( type, obj , callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dals[type].add(connection, obj , function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}
exports.update = function( type, id, changes, callback  ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dals[type].update(connection, id, changes, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}
exports.delete = function( type,id, callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dals[type].remove(connection, id, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}


