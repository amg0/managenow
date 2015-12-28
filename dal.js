// module DAL
var winston = require("winston");	// logging functionality
var dalEmployee = require("./genericdal")('employees');

exports.init = function(callback) {
	dalEmployee.init(callback);
}

exports.listAllEmployes = function(fields, callback) {
	dalEmployee.listAll(fields, callback);
}

exports.addEmployee = function( employee , callback ) {
	dalEmployee.add(employee , callback);
}

exports.updateEmployee = function( id, changes, callback  ) {
	dalEmployee.update(id,changes,callback);
}

exports.deleteEmployee = function( id, callback ) {
	dalEmployee.destroy(id,callback);
}

exports.exit = function( callback ) {
	dalEmployee.exit(callback);
}
