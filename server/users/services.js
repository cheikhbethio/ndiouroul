"use strict";

const _ = require("underscore");
var bcrypt = require("bcrypt");
const metiers = require("../services/metiers");
const mongoose = require("mongoose");
const myVar = require("../config/variables.js");
const responseMsg = myVar.httpMessage.response;
const ObjectID = require("mongodb").ObjectID;
const theMailer = require("../config/jobsMailer.js");
const dbServices = require("../services/database");

const userParamsValidatorSchema ={
	type : "object",
	properties : {
		email: {type : "string", required :  true},
		password: {type : "string", required :  true},
		firstname: {type : "string", required :  true},
		lastname: {type : "string", required :  true},
		login: {type : "string", required :  true}
	},
	additionalProperties : false
};

const userValidatorSchema= {
	type: "object",
	properties : {
		email: {type : "string", required :  true},
		password: {type : "string", required :  true},
		firstname: {type : "string", required :  true},
		lastname: {type : "string", required :  true},
		login: {type : "string", required :  true},
		right: {type : "string", required :  true},
		idPic: {type : "string"},
		phone: {type : "string"},
		hashkey: {type : "string", required :true},
		status: {
			type : "object",
			properties : {
				code : {type : "number"},
				msg : {type : "string"}
			}
		, required :  true},
		created_at: { "type": "number", "format": "date" , required :  true},
	},
	additionalProperties : false
};

const userSchema = mongoose.Schema({
	email: String,
	password: String,
	firstname: String,
	lastname: String,
	login: String,
	right: String,
	idPic: String,
	phone: String,
	status: Object,
	hashkey: String,
	created_at: Date
});

var userDbAccess = mongoose.model("users", userSchema);

function fillUserModel(source){
	let destination = source;
	const paramsValidation = metiers.isValidModel(destination, userParamsValidatorSchema);
	if (!paramsValidation.valid) {
		return undefined;
	}
	destination.password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(8));
	destination.right = myVar.darajas.SIMPLE;
	destination.created_at = Date.now();
	destination.status = myVar.status.watingClicEmail;
	destination.hashkey =  bcrypt.hashSync(source.email + source.firstname + source.lastname, bcrypt.genSaltSync(8)) + "end";
	let isValidModel = metiers.isValidModel(destination, userValidatorSchema);
	return isValidModel.valid ? destination : undefined;
}

function createUser(req, res){
	let filledUserObject  = fillUserModel(req.body);
	if (!filledUserObject) {
		return quitWithFailure(req, res, responseMsg.failure.invalidSchema, 500);
	}

	let userToCreate = new userDbAccess(filledUserObject);
	userDbAccess.findOne({$or:[{"login" : filledUserObject.login},
		{"email" : filledUserObject.email}]})
		.then(alreadyUsed => {
			if (alreadyUsed) {
				return quitWithFailure(req, res, responseMsg.success.existenceMessage, 400);
			}
			const sentText = myVar.forMail.signUp.text + myVar.myUrl.princiaplURL + myVar.myUrl.emailValidation +
					filledUserObject.hashed;
			theMailer.emailSender(filledUserObject.email, myVar.forMail.signUp.subject, sentText);
			return dbServices.post(req, res, userToCreate);
		});

}

function findUser(req, res){
	dbServices.get(req, res, userDbAccess);
}

function getAll(req, res){
	dbServices.getAll(req, res, userDbAccess);
}

function deleteUser(req, res){
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage,500);
	}
	userDbAccess.findByIdAndRemove(req.params.id)
	.then((value) => {
		return res.status(200).json({
			code : "200",
			message : responseMsg.success.successMessage,
			_id : value ? value._id : null
		});
	})
	.catch(() => {
		return quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
	});
}
//if it is about email or login check if they exist before updating
//for password regenerate a new password
function updateUser(req, res){
	const query = req.body;
	var objectToCheck = {};
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage,500);
	}
	//email
	if (query.email || query.login) {
		const propertyToCheck = query.email ? "email" : "login";
		objectToCheck[propertyToCheck] = query.email ? query.email : query.login;
	}
	console.log("+++++++objectToCheck+++++++",req.query, req.body, req.params);

	userDbAccess.findOne(objectToCheck)
	.then((alreadyUsed) => {
		console.log("-------alreadyUsed------", alreadyUsed, objectToCheck);
		if (alreadyUsed && !_.isEmpty(objectToCheck)) {
			return quitWithFailure(req, res, responseMsg.failure.existenceMessage, 400);
		}
		return runUpdate(req, res, req.body);
	});

}

function quitWithFailure(req, res, message, code){
	return res.status(code).json({code : code, message :message});
}

function runUpdate(req, res, properties){
	userDbAccess.findByIdAndUpdate(req.params.id, properties)
		.then((value) => {
			res.status(201).json({
				code : "201",
				message : responseMsg.success.successMessage,
				_id : value ? value._id : null
			});
		})
		.catch(() => {
			return quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

exports = _.extend(exports ,{
	deleteUser ,
	updateUser,
	findUser,
	userValidatorSchema,
	fillUserModel,
	createUser,
	getAll,
	userDbAccess
});
