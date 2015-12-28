// module DAL
var mysql = require("mysql");		// mysql access
var winston = require("winston");	// logging functionality
var _tablename = null;

module.exports = function(tablename) {
	_tablename = tablename;
	this.con = null;
	
	return {
		init : function(callback) {
			winston.info("initialize GenericDal for table %s",_tablename);
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
		},
		exit : function( callback ) {
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
		},
		listAll : function(fields,callback) {
			var sql = 'SELECT * FROM '+_tablename;
			if (fields && fields.length>0)
				sql = mysql.format('SELECT ?? FROM '+_tablename, [fields]);
			winston.info('SQL for list all:%s',sql);
			con.query(sql, function(err,rows){
			  if(err) throw err;
			  (callback)(err,rows);
			});					
		},
		add : function( object , callback ) {
			delete object.id;
			con.query('INSERT INTO '+_tablename+' SET ?', object, function(err,result){
			  if(err) throw err;
			  winston.info('Added => Last insert ID: %d', result.insertId);
			  // winston.info(result);
			  (callback)(err,result);
			});	
		},
		update : function( id, object, callback  ) {
			con.query(
			  'UPDATE '+_tablename+' SET ? Where ID = ?',
			  [object,id],
			  function (err, result) {
				if (err) throw err;
				winston.info('Changed ' + result.changedRows + ' rows');
				// winston.info(result);
				(callback)(err,result);
			  }
			);
		},
		destroy : function( id, callback ) {
			con.query(
			  'DELETE FROM '+_tablename+' WHERE id = ?',
			  [id],
			  function (err, result) {
				if (err) throw err;
				winston.info('Deleted ' + result.affectedRows + ' rows');
				// winston.info(result);
				(callback)(err,result);
			  }
			);
		}
	};
};