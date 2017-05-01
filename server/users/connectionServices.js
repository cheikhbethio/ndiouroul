"use strict";

const bcrypt = require("bcrypt");
const _ = require("underscore");
const userServices = require("./services");
const metiers = require("../services/metiers");
const userDbAccess = userServices.userDbAccess;
const myVar = require("../config/variables.js");
const theMailer = require("../config/jobsMailer.js");
const responseMsg = myVar.httpMessage.response;
var rightTab = [];


module.exports = {
	updatePassWord,
	loginMiddleware,
	logoutMiddleware,
	sessionMiddleware,
	authenticate
};

init();

function authenticate(req, res, next){
	const body = req.body;
	let schemaValidator = {
		type : "object",
		properties : {
			login : {type : "string", minLength: 5 , maxLength : 30,required: "true"},
			password : {type : "string", minLength: 5 , maxLength: 100,required: "true"}
		},
		additionalProperties : false
	};
	const paramsValidation = metiers.isValidModel(body, schemaValidator);
	console.log("+++++", paramsValidation);
	console.log("+++++", body);
	if (!paramsValidation.valid) {
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
	}
	return userDbAccess.findOne({$or:[{"login" : body.login},
		{"email" : body.login}]})
			.then((foundUser) => {
				let goodGivenPassword = false;
				if (!_.isEmpty(foundUser) && foundUser.password) {
					goodGivenPassword = bcrypt.compareSync(body.password, foundUser.password);
					req.user = foundUser;
				}
				return goodGivenPassword ? next() :  res.status(400).json({
					code : 400,
					message :responseMsg.failure.docNotFound
				});

			}).catch(() => {
				return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
			});
}

function updatePassWord(req, res){
	return userDbAccess.findOne({"email" : req.body.email})
		.then((checkedUser) => {
			if (!_.isEmpty(checkedUser)) {
				return regeneratePassWordAndUpdateUser(req, res, checkedUser);
			}
			return res.status(400).json({
				code : 400,
				message :responseMsg.failure.docNotFound
			});
		});
}

function getRegeneratedPassWord(){
	const alphabet = "azertyuiopmlkjhgfdsqbvcxw+=&éè_çà1234567890*?$#!AZERTYUIOPMLKJHGFDSQNBVCXW";
	const suffledString = _.shuffle(alphabet);
	var stringToHash="";
	for (var i = 0; i < suffledString.length /3 ; i++) {
		stringToHash += suffledString[i];
	}
	return {stringToHash :stringToHash , regeneratedPassWord : bcrypt.hashSync(stringToHash, bcrypt.genSaltSync(8), null)};
}

function regeneratePassWordAndUpdateUser(req, res, user){

	const _id =  user._id;
	const email = user.email;
	const regenerationResult = getRegeneratedPassWord();
	const newPassword = regenerationResult.regeneratedPassWord;
	return userDbAccess.findByIdAndUpdate(_id, {password : newPassword})
		.then((updatedUser) => {
			theMailer.emailSender(email, myVar.forMail.regeneratePassword.subject, myVar.forMail
				.regeneratePassword.text + regenerationResult.stringToHash);

			return res.status(201).json({
				code : 201,
				message : responseMsg.success.successMessage,
				_id : updatedUser._id ? updatedUser._id : null
			});
		})
		.catch(() => {
			return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

function loginMiddleware(req, res){
	const forCookie = {
		id: req.user._id,
		login: req.user.login,
		lastname: req.user.lastname,
		firstname: req.user.firstname,
		right: giveRight(req.user.right)
	};

	const isValidUser = _.every(forCookie, function(elem){
		return elem;
	});

	if (!isValidUser) {
		const message ={
			code : 400,
			message : "notConnected"
		};
		return metiers.quitWithFailure(req, res, message, 400);
	}

	req.user.password = "rien du tout";
	req.session.curentUser = req.user;
	res.cookie("SeugneBethioLaGrace", JSON.stringify(forCookie), { maxAge: 				myVar.session.session_duration });

	return res.status(201).json({
		code : 201,
		message : responseMsg.success.successMessage,
		result : forCookie
	});
}

function logoutMiddleware (req, res) {
	req.logout();
	return res.status(201).json({
		code : 201,
		message : responseMsg.success.successMessage
	});
}

function sessionMiddleware(req, res) {
	return res.status(201).json({
		code : 201,
		message : responseMsg.success.successMessage,
		result : req.session.id
	});
}

function giveRight(right) {
	return 1 + rightTab.indexOf(right);
}

function init() {
	_.each(myVar.darajas, function (elem) {
		rightTab.push(elem);
	});
}
