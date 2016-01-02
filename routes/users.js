var express = require('express');
var dal = require("../dal");		// mysql access
var router = express.Router();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
	var id = req.params.id;
	dal.getUser(id , function (err, data) {
		res.send(data);
	});
});

module.exports = router;
