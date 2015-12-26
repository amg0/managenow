var dal = require("./dal");		// mysql access
var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'mysql.log' });

dal.init( function(err) {
	dal.listAllEmployes( function(err,rows) {
		var employee = { name: 'Winnie', location: 'Australia' };
		dal.addEmployee( employee , function (err,res) {
			dal.listAllEmployes( function(err,rows) {
				dal.updateEmployee( employee , function (err,res) {
					dal.listAllEmployes( function(err,rows) {
						dal.deleteEmployee( employee , function (err,res) {
							dal.listAllEmployes( function(err,rows) {
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

