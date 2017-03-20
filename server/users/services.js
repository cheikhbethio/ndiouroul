"use strict";

const _ = require("underscore");
var bcrypt = require("bcrypt");
const metiers = require("../services/metiers");
const mongoose = require("mongoose");
const myVar = require("../config/variables.js");
const responseMsg = myVar.httpMessage.response;
const ObjectID = require("mongodb").ObjectID;
const theMailer = require("../config/jobsMailer");

const userValidatorSchema= {
	type: "object",
	properties : {
		local : {
			type : "object",
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
			additionalProperties : false,
			required :  true
		},
		facebook: {
			id: {type : "string"},
			token: {type : "string"},
			email: {type : "string"},
			name: {type : "string"}
		},
		google: {
			id: {type : "string"},
			token: {type : "string"},
			email: {type : "string"},
			name: {type : "string"}
		}
	},
	required : ["local"]
};

const userSchema = mongoose.Schema({
	local: {
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
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

var dbAccess = mongoose.model("users", userSchema);

function fillUserModel(source){
	let local = source;
	let destination = {};
	local.password = bcrypt.hashSync(source.password, bcrypt.genSaltSync(8));
	local.right = myVar.darajas.SIMPLE;
	local.created_at = Date.now();
	local.status = myVar.status.watingClicEmail;
	destination.local = local;
	let isValidModel = metiers.isValidModel(destination, userValidatorSchema);
	return isValidModel.valid ? destination : undefined;
}

function createUser(req, res){
	let filledUserObject  = fillUserModel(req.body);
	if (!filledUserObject) {
		res.status(500).json({code : "500", message : responseMsg.failure.failureMessage});
	}

	let userToCreate = new dbAccess(filledUserObject);
	dbAccess.findOne({$or:[{"local.login" : filledUserObject.local.login},
		{"local.email" : filledUserObject.local.email}]})
		.then((userExistence) => {
			if(!userExistence){
				return userToCreate.save();
			}
			return quitWithFailure(req, res, responseMsg.success.existenceMessage);
		})
		.then((createUser) => {
			let messageToSending = {
				code : "201",
				message : responseMsg.success.successMessage,
				_id : createUser._id
			};
			res.status(201).json(messageToSending);
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


function getKeyValidation(req, res) {
	dbAccess.findOne({ "local.hashkey": req.params.id })
		.then((value) => {
				//toEdit
				theMailer.emailSender(myVar.forMail.admin, myVar.forMail.signUpValidation.subject,
					myVar.forMail.signUpValidation.text);
				return res.status(201).json({
					code : "201",
					message : responseMsg.success.emailDelivrence
					});
		})
		.catch((err) => {
				return quitWithFailure(req, res, responseMsg.failure.failureMessage);
		});

		, function (err, user) {
		if(err || !user) {
			res.send({
				message: "Désolé mais ce compte est invalide. Veillez vous réinscrire et faire la valivation dans les plus bref délais.",
				code: 1
			});
		} else {
			toEdit(user._id, { status: myVar.status.watingValidation });
			theMailer.emailSender(myVar.forMail.admin, myVar.forMail.signUpValidation.subject, myVar.forMail
				.signUpValidation.text);
			res.send({
				message: "Votre inscription a bien été pris en compte et sera validée par nos équipes dans les plus brefs délais. Merci et à très bientôt",
				code: 0
			});
		}
	});
};


const sayHello = function(){
	return "Hello word";
};

exports = _.extend(exports ,{
	sayHello : sayHello,
	deleteUser  : deleteUser,
	updateUser : updateUser,
	findUser : findUser,
	userValidatorSchema : userValidatorSchema,
	fillUserModel : fillUserModel,
	createUser : createUser
});
