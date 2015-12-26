// module DAL
var mysql = require("mysql");		// mysql access
var winston = require("winston");	// logging functionality
var con = null;

exports.init = function(callback) {
	// First you need to create a connection to the db
	con = mysql.createConnection({
	  host: "localhost",
	  user: "amg0",
	  password: "Clem0tine",
	  database: "testdb"
	});

	con.connect(function(err){
	  if(err){
		winston.error('Error connecting to Db');
		return;
	  } else
		winston.info('connected as id ' + con.threadId);
	  (callback)(err);
	});	
}

exports.listAllEmployes = function(callback) {
	con.query('SELECT * FROM employees',function(err,rows){
	  if(err) throw err;
	  winston.info('Data received from Db:\n');
	  winston.info( rows );	//JSON.stringify(rows,null,4)
	  (callback)(err,rows);
	});	
}

exports.addEmployee = function( employee , callback ) {
	con.query('INSERT INTO employees SET ?', employee, function(err,result){
	  if(err) throw err;
	  winston.info('Added => Last insert ID: %d', result.insertId);
	  winston.info(result);
	  (callback)(err,result);
	});	
}

exports.updateEmployee = function( employee, callback  ) {
	con.query(
	  'UPDATE employees SET location = ? Where ID = ?',
	  ["South Africa", 5],
	  function (err, result) {
		if (err) throw err;
		winston.info('Changed ' + result.changedRows + ' rows');
		winston.info(result);
		(callback)(err,result);
	  }
	);
}

exports.deleteEmployee = function( employee, callback ) {
	con.query(
	  'DELETE FROM employees WHERE id = ?',
	  [5],
	  function (err, result) {
		if (err) throw err;
		winston.info('Deleted ' + result.affectedRows + ' rows');
		winston.info(result);
		(callback)(err,result);
	  }
	);
}

exports.exit = function( callback ) {
	con.end(function(err) {
		if(err){
			winston.error('Error happened while disconnecting from Db');
		} else {
			winston.info('The connection is terminated gracefully');
			// Ensures all previously enqueued queries are still
			// before sending a COM_QUIT packet to the MySQL server.
		}
		con=null;
		(callback)(err);
	});
}
