//# sourceURL=api_projects.js
// "use strict";
var express = require('express');
var winston = require("winston");	// logging functionality
var dal = require("../dal");		// mysql access
var router = express.Router();

/*
Route	HTTP Verb	Description
/api/bears	GET	Get all the bears.
/api/bears	POST	Create a bear.
/api/bears/:bear_id	GET	Get a single bear.
/api/bears/:bear_id	PUT	Update a bear with new info.
/api/bears/:bear_id	DELETE	Delete a bear.
*/ 

/* GET users listing. */
router
	.get('/', function(req, res, next) {
		var filters = req.query.filters;
		var columns = req.query.columns;
		dal.listAll( 'projects', columns , filters, function (err, results, fields) {
			res.send(results);
		});
	})
	.post('/', function(req, res, next) {
		var obj = JSON.parse(req.body.json);
		dal.add('projects', obj , function (err,results, fields) {
			res.send(results);
		});
	})
	.get('/:id', function(req, res, next) {
		var id = req.params.id;
		dal.get('projects',id , function (err, results, fields) {
			res.send(results);
		});
	})
	.put('/:id', function(req, res, next) {
		var obj = JSON.parse(req.body.json);
		dal.update('projects',req.params.id, obj , function (err, results, fields) {
			res.send(results);
		});
	})
	.delete('/:id', function(req, res, next) {
		dal.delete('projects',req.params.id,function (err, results, fields) {
			res.send(results);
		});
	})
	;

module.exports = router;
