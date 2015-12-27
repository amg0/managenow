var dal = require("./dal");		// mysql access
var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'output.log' });

dal.init( function(err) {
	dal.listAllEmployes( ['id','name'], function(err,rows) {
		var employee = { name: 'Winnie', location: 'Australia' };
		dal.addEmployee( employee , function (err,res) {
			var id = res.insertId;
			dal.listAllEmployes( null,function(err,rows) {
				dal.updateEmployee( id, { location:"South Africa" } , function (err,res) {
					dal.listAllEmployes( null,function(err,rows) {
						dal.deleteEmployee( id , function (err,res) {
							dal.listAllEmployes( null,function(err,rows) {
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

