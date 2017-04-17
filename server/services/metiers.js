"use strict";

const _ = require("underscore");
const Validator = require("json-schema");


function isValidModel(obToValidate,schemaValidator){
	return Validator.validate(obToValidate, schemaValidator);
}
//
// function quitWithFailure(req, res, message){
// 	return res.status(500).json({code : "500", message :message});
// }

function quitWithFailure(req, res, message, code){
	return res.status(code).json({code : code, message :message});
}


exports = _.extend(exports ,{
	isValidModel,
	quitWithFailure
});
