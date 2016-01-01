// module DAL
var winston = require("winston");	// logging functionality
var mysql = require("mysql");		// mysql access
var _tablename = null;

module.exports = function(tablename) {
	_tablename = tablename;
	
	return {
		listAll : function(con,fields,callback) {
			var sql = 'SELECT * FROM '+_tablename;
			if (fields && fields.length>0)
				sql = mysql.format('SELECT ?? FROM '+_tablename, [fields]);
			winston.info('SQL for list all:%s',sql);
			con.query(sql, function(error, results, fields){
			  if(error) throw error;
			  (callback)(error, results, fields);
			});					
		},
		add : function( con,object , callback ) {
			delete object.id;
			con.query('INSERT INTO '+_tablename+' SET ?', object, function(error, results, fields){
			  if(error) throw error;
			  winston.info('Added => Last insert ID: %d', results.insertId);
			  // winston.info(result);
			  (callback)(error, results, fields);
			});	
		},
		update : function( con, id, object, callback  ) {
			con.query(
			  'UPDATE '+_tablename+' SET ? Where ID = ?',
			  [object,id],
			  function (error, results, fields) {
				if(error) throw error;
				winston.info('Changed ' + results.changedRows + ' rows');
				// winston.info(results);
				(callback)(error,results, fields);
			  }
			);
		},
		remove : function( con, id, callback ) {
			con.query(
			  'DELETE FROM '+_tablename+' WHERE id = ?',
			  [id],
			  function (error,results, fields) {
				if(error) throw error;
				winston.info('Deleted ' + results.affectedRows + ' rows');
				// winston.info(results);
				(callback)(error,results, fields);
			  }
			);
		}
	};
};