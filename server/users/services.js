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
		password: {type : "string", required :  true, minLength: 5 , maxLength: 100},
		firstname: {type : "string", required :  true},
		lastname: {type : "string", required :  true},
		login: {type : "string", required :  true, minLength: 5 , maxLength : 30},
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
	destination.hashkey = generateHash();
	let isValidModel = metiers.isValidModel(destination, userValidatorSchema);
	return isValidModel.valid ? destination : undefined;
}

function createUser(req, res){
	let filledUserObject  = fillUserModel(req.body);
	if (!filledUserObject) {
		return metiers.quitWithFailure(req, res, responseMsg.failure.invalidSchema, 500);
	}

	let userToCreate = new userDbAccess(filledUserObject);
	userDbAccess.findOne({$or:[{"login" : filledUserObject.login},
		{"email" : filledUserObject.email}]})
		.then(alreadyUsed => {
			if (alreadyUsed) {
				return metiers.quitWithFailure(req, res, responseMsg.success.existenceMessage, 400);
			}
			const sentText = myVar.forMail.signUp.text + myVar.myUrl.princiaplURL + myVar.myUrl.emailValidation +
					filledUserObject.hashkey;
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
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage,500);
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
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
	});
}

function updateUser(req, res){
	let body = req.body;
	let objectToCheck = {};
	let messageToRecieve;

	if(!ObjectID.isValid(req.params.id)){
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage,500);
	}

	if (body.email || body.login) {
		const propertyToCheck = body.email ? "email" : "login";
		objectToCheck[propertyToCheck] = body.email ? body.email : body.login;
	}

	userDbAccess.findById(req.params.id)
		.then((userToPatch) => {
			const goodGivenPassword = bcrypt.compareSync(body.password, userToPatch.password);
			if (!_.isEmpty(userToPatch) && goodGivenPassword) {
				return userDbAccess.findOne(objectToCheck);
			}
			messageToRecieve = responseMsg.failure.badPassword;
			throw new Error(messageToRecieve);
		})
		.then((alreadyUsed) => {
			if (alreadyUsed && !_.isEmpty(objectToCheck)) {
				messageToRecieve = body.email ? responseMsg.failure.emailPresence :  responseMsg.failure.loginPresence;
				throw new Error(messageToRecieve);
			}
			if (body.newPassword) {
				body.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8));
			}else {
				body = _.omit(body, "password");
			}
			return runUpdate(req, res, body);
		})
		.catch((err) => {
			var message = responseMsg.failure.failureMessage;
			let code = 500;

			if (err.message === messageToRecieve) {
				code = 400;
				message = messageToRecieve;
			}
			return metiers.quitWithFailure(req, res, message, code);
		});

}

function runUpdate(req, res, properties){
	console.log("---", properties);

	userDbAccess.findByIdAndUpdate(req.params.id, properties)
		.then((value) => {
			res.status(201).json({
				code : "201",
				message : responseMsg.success.successMessage,
				_id : value ? value._id : null
			});
		})
		.catch(() => {
			return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

function getKeyValidation(req, res){
	userDbAccess.findOne({ "hashkey": req.query.key })
		.then((user) => {
			if (_.isEmpty(user)){
				return metiers.quitWithFailure(req, res, responseMsg.failure.getKeyValidation.invalidAccount, 400);
			}
			return runKeyValidation(res, user);
		})
		.catch(() => {
			return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

function runKeyValidation(res, user){
	user.status = myVar.status.watingValidation;
	delete user.hashkey;
	user.hashkey = undefined;
	return user.save()
		.then(() => {
			theMailer.emailSender(myVar.forMail.admin, myVar.forMail.signUpValidation.subject,
				myVar.forMail.signUpValidation.text);
			return res.status(201).json({
				code :201,
				message : responseMsg.failure.getKeyValidation.validation
			});
		});
}

function generateHash(){
	const alphabet = "azertyuiopmlkjhgfdsqbvcxw1234567890AZERTYUIOPMLKJHGFDSQNBVCXW";
	const suffledString = _.shuffle(alphabet);
	var hash="";
	for (var i = 0; i < suffledString.length ; i++) {
		hash += suffledString[i];
	}
	return hash;
}

exports = _.extend(exports ,{
	deleteUser ,
	updateUser,
	findUser,
	userValidatorSchema,
	fillUserModel,
	createUser,
	getAll,
	userDbAccess,
	getKeyValidation
});
