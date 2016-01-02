// module DAL
var winston = require("winston");	// logging functionality
var mysql = require("mysql");		// mysql access
var genericdal = require("./genericdal");
var dalUsers = null;
var dalProjects = null;
var pool  = null;

exports.init = function(callback) {
	winston.info("initialize DAL & pool");
	dalUsers = genericdal('users');
	dalProjects = genericdal('projects');
	pool = mysql.createPool({
	  connectionLimit : 10,
	  host: "localhost",
	  user: "amg0",
	  password: "xxx",
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

exports.listAllUsers = function(fields, callback) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalUsers.listAll(connection, fields, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

exports.getUser = function( id , callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalUsers.get(connection, {id:id} , function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

exports.addUser = function( user , callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalUsers.add(connection, user , function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

exports.updateUser = function( id, changes, callback  ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalUsers.update(connection, id, changes, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

exports.deleteUser = function( id, callback ) {
	pool.getConnection(function(err, connection) {
		// connected! (unless `err` is set)
		if (err) {
			winston.error('Error connecting to Db');
			(callback)(err,null);
		} else {
			winston.info('connected as id ' + connection.threadId);
			dalUsers.remove(connection, id, function(error,results, fields) {
				connection.release();
				(callback)(error,results, fields);
			});
		}
	});
}

