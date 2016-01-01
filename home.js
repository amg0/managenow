var dal = require("./dal");			// mysql access
var express = require("express");	// express
var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'output.log' });

dal.init( function(err) {
	dal.listAllEmployes( ['id','name'], function(err,rows) {
		winston.info('Data received from Db:');
		winston.info( rows );	//JSON.stringify(rows,null,4)		
		dal.exit(function() {
			winston.info('Exit');									
		});
	});
});

