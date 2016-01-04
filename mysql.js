//# sourceURL=mysql.js
// "use strict";
var dal = require("./dal");		// mysql access
var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'output.log' });

dal.init( function(err) {
	dal.listAllUsers( ['id','email'], function(err,rows) {
		winston.info('Data received from Db:');
		winston.info( rows );	//JSON.stringify(rows,null,4)
		
		var user = {first_name:'Winne', last_name:'Poo', email:'winie.poo@test.com', location: 'Australia' };
		dal.addUser( user , function (err,res) {
			var id = res.insertId;
			dal.listAllUsers( null,function(err,rows) {
				winston.info('Data received from Db:');
				winston.info( rows );	//JSON.stringify(rows,null,4)
				
				dal.updateUser( { id:id , location:"South Africa" } , function (err,res) {
					dal.listAllUsers( null,function(err,rows) {
						winston.info('Data received from Db:');
						winston.info( rows );	//JSON.stringify(rows,null,4)
						
						dal.deleteUser( id , function (err,res) {
							dal.listAllUsers( null,function(err,rows) {
								winston.info('Data received from Db:');
								winston.info( rows );	//JSON.stringify(rows,null,4)
								
								dal.exit(function() {
									winston.info('Exit');									
								});
							});
						});
					});
				});
			});
		});
	});
});

