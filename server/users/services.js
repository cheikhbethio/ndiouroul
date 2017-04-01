"use strict";

const _ = require("underscore");
var bcrypt = require("bcrypt");
const metiers = require("../services/metiers");
const mongoose = require("mongoose");
const myVar = require("../config/variables.js");
const responseMsg = myVar.httpMessage.response;
const ObjectID = require("mongodb").ObjectID;
const theMailer = require("../config/jobsMailer.js");
const dbServices = require("../config/database");

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
		status: {
			type : "object",
			properties : {
				code : {type : "number"},
				msg : {type : "string"}
			}
		, required :  true},
		hashkey: {type : "string"},
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

var dbAccess = mongoose.model("users", userSchema);

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
	let isValidModel = metiers.isValidModel(destination, userValidatorSchema);
	return isValidModel.valid ? destination : undefined;
}

function createUser(req, res){
	let filledUserObject  = fillUserModel(req.body);
	if (!filledUserObject) {
		return quitWithFailure(req, res, responseMsg.failure.invalidSchema);
	}

	let userToCreate = new dbAccess(filledUserObject);
	dbAccess.findOne({$or:[{"login" : filledUserObject.login},
		{"email" : filledUserObject.email}]})
		.then(alreadyUsed => {
			return alreadyUsed ? undefined :  userToCreate.save();
		})
		.then(user => {
			if (!user) {
				return quitWithFailure(req, res, responseMsg.success.existenceMessage);
			}
			let messageToSending = {
				code : "201",
				message : responseMsg.success.successMessage,
				_id : user._id
			};
			return res.status(201).json(messageToSending);
		})
		.catch(() => {
			return quitWithFailure(req, res, responseMsg.failure.failureMessage);
		});

}

function findUser(req, res){
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	}
	dbAccess.findById(req.params.id)
	.then((value) => {
		let messageToSending = {
			code : "200",
			message : responseMsg.success.successMessage,
			user : value
		};
		res.status(200).json(messageToSending);
	})
	.catch(() => {
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	});
}

function deleteUser(req, res){
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	}
	dbAccess.findByIdAndRemove(req.params.id)
	.then((value) => {
		res.status(200).json({
			code : "200",
			message : responseMsg.success.successMessage,
			_id : value ? value._id : null
		});
	})
	.catch(() => {
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	});
}

function updateUser(req, res){
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	}

	dbAccess.findByIdAndUpdate(req.params.id, req.body)
	.then((value) => {
		res.status(201).json({
			code : "201",
			message : responseMsg.success.successMessage,
			_id : value ? value._id : null
		});
	})
	.catch(() => {
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	});
}

function quitWithFailure(req, res, message){
	return res.status(500).json({code : "500", message :message});
}

exports = _.extend(exports ,{
	deleteUser  : deleteUser,
	updateUser : updateUser,
	findUser : findUser,
	userValidatorSchema : userValidatorSchema,
	fillUserModel : fillUserModel,
	createUser : createUser
});
