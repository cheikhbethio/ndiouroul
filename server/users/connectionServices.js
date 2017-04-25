"use strict";

const bcrypt = require("bcrypt");
const _ = require("underscore");
const userServices = require("./services");
const metiers = require("../services/metiers");
const userDbAccess = userServices.userDbAccess;
const myVar = require("../config/variables.js");
const theMailer = require("../config/jobsMailer.js");
const responseMsg = myVar.httpMessage.response;

function getRegeneratedPassWord(){
	const alphabet = "azertyuiopmlkjhgfdsqbvcxw+=&é'(-è_çà)1234567890*?$#!AZERTYUIOPMLKJHGFDSQNBVCXW";
	const suffledString = _.shuffle(alphabet);
	var stringToHash="";
	for (var i = 0; i < suffledString.length /3 ; i++) {
		stringToHash += suffledString[i];
	}
	return {stringToHash :stringToHash , regeneratedPassWord : bcrypt.hashSync(stringToHash, bcrypt.genSaltSync(8), null)};
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
				code : "201",
				message : responseMsg.success.successMessage,
				_id : updatedUser._id ? updatedUser._id : null
			});
		})
		.catch(() => {
			return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

exports = _.extend(exports, {
	updatePassWord,
});

// function XupdatePassWord(req, res){
// 	var _id;
// 	var email;
// 	var regenerationResult;
//   return userDbAccess.findOne({ 'local.email': req.body.email })
//     .then((checkedUser) => {
//       if (!_.isEmpty(checkedUserRes)) {
//           _id = checkedUserRes._id;
//           email = checkedUserRes.local.email;
//           regenerationResult =getRegeneratedPassWord();
//           return regenerationResult.regeneratedPassWord;
//       } else {
//         return Promise.reject({
//           "message": "le document est introuvable!!!",
//           "code": 2
//         });
//       }
//     })
//     .then((newGeneratedPassword) => {
//       console.log("*******22222********** ", newGeneratedPassword);
//       return user.toEdit(_id, {password : newGeneratedPassword})
//       .then((value) => {
//         return value});
//     })
//     .then((updateRes) => {
//       console.log("*******333********** ", updateRes);
//       //sendEmail
// 			theMailer.emailSender(email, mayVar.forMail.regeneratePassword.subject, mayVar.forMail
// 				.regeneratePassword.text + regenerationResult.stringToHash);
//       return res.send(updateRes);
//     })
//     .catch((err) => {
//       console.log("*******4444********** ", err);
//       return res.send(err);
//     })
// }


// var userDb = user.dbAccess;
// var rightTab = [];
// var mayVar = require('../config/variables.js');
// var theMailer = require('../config/jobsMailer.js');
//
// exports.sessionMiddleware = sessionMiddleware;
// exports.logoutMiddleware = logoutMiddleware;
// exports.loginMiddleware = loginMiddleware;
// exports.updatePassWord = updatePassWord;

// init();
//

// var loginMiddleware = function(req, res){
//   var forCookie = {
//     id: req.user._id,
//     login: req.user.local.login,
//     lastname: req.user.local.lastname,
//     firstname: req.user.local.firstname,
//     right: giveRight(req.user.local.right)
//   };
//   req.user.local.password = "rien du tout";
//   req.session.curentUser = req.user;
//   res.cookie('SeugneBethioLaGrace', JSON.stringify(forCookie), { maxAge: mayVar.session.session_duration });
//   res.send(forCookie);
// }
//
// var logoutMiddleware = function (req, res) {
//   req.logout();
//   res.redirect('/');
// };
// var sessionMiddleware = function (req, res) {
//   res.send(req.session.id);
// }
//
//
//
//
// function giveRight(right) {
// 	return 1 + rightTab.indexOf(right);
// }
//
// function init() {
// 	_.each(mayVar.darajas, function (elem) {
// 		rightTab.push(elem);
// 	});
// }
