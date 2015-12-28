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
			con.query(sql, function(err,rows){
			  if(err) throw err;
			  (callback)(err,rows);
			});					
		},
		add : function( con,object , callback ) {
			delete object.id;
			con.query('INSERT INTO '+_tablename+' SET ?', object, function(err,result){
			  if(err) throw err;
			  winston.info('Added => Last insert ID: %d', result.insertId);
			  // winston.info(result);
			  (callback)(err,result);
			});	
		},
		update : function( con, id, object, callback  ) {
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
		remove : function( con, id, callback ) {
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