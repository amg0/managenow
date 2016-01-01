var dal = require("./dal");			// mysql access
var winston = require("winston");	// logging functionality
winston.add(winston.transports.File, { filename: 'output.log' });
var express = require("express");	// express
var app = express();

app.get('/', function(req,res) {
	res.send("Hello World");
	dal.init( function(err) {
		dal.listAllEmployes( ['id','name'], function(err,rows) {
			winston.info('Data received from Db:');
			winston.info( rows );	//JSON.stringify(rows,null,4)		
			dal.exit(function() {
				winston.info('Exit');									
			});
		});
	});
});

var server = app.listen(3000,function() {
	var host = server.address().address;
	var port = server.address().port;
	winston.info('Example app listening at http://%s:%s', host, port);
});
