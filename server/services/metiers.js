"use strict";

const _ = require("underscore");
const Validator = require("json-schema");


function isValidModel(obToValidate,schemaValidator){
	return Validator.validate(obToValidate, schemaValidator);
}


exports = _.extend(exports ,{isValidModel : isValidModel});
