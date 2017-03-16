'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var _ = require("underscore");
var user = require('./user.js');
var userDb = user.dbAccess;
var rightTab = [];
var mayVar = require('../config/variables.js');
var theMailer = require('../config/jobsMailer.js');

init();


var getRegeneratedPassWord = function(){
  var alphabet = "azertyuiopmlkjhgfdsqbvcxw+=&é'(-è_çà)1234567890*?$#!AZERTYUIOPMLKJHGFDSQNBVCXW";
  var suffledString = _.shuffle(alphabet);
  var stringToHash="";
  for (var i = 0; i < suffledString.length /3 ; i++) {
    stringToHash += suffledString[i];
  }
  return {stringToHash :stringToHash , regeneratePassWord : bcrypt.hashSync(stringToHash, bcrypt.genSaltSync(8), null)};
}

var updatePassWord = function(req, res){
  var checkedUser =   userDb.findOne({ 'local.email': req.body.email });
  var _id;
  var email;
  var regenerationResult;
  return checkedUser
    .then((checkedUserRes) => {
      console.log("*******111********** ", checkedUserRes);
      if (checkedUserRes) {
          _id = checkedUserRes._id;
          email = checkedUserRes.local.email;
          regenerationResult =getRegeneratedPassWord();
          return regenerationResult.regeneratePassWord;
      } else {
        return Promise.reject({
          "message": "le document est introuvable!!!",
          "code": 2
        });
      }
    })
    .then((newGeneratedPassword) => {
      console.log("*******22222********** ", newGeneratedPassword);
      return user.toEdit(_id, {password : newGeneratedPassword})
      .then((value) => {
        return value});
    })
    .then((updateRes) => {
      console.log("*******333********** ", updateRes);
      //sendEmail
			theMailer.emailSender(email, mayVar.forMail.regeneratePassword.subject, mayVar.forMail
				.regeneratePassword.text + regenerationResult.stringToHash);
      return res.send(updateRes);
    })
    .catch((err) => {
      console.log("*******4444********** ", err);
      return res.send(err);
    })
}

var loginMiddleware = function(req, res){
  var forCookie = {
    id: req.user._id,
    login: req.user.local.login,
    lastname: req.user.local.lastname,
    firstname: req.user.local.firstname,
    right: giveRight(req.user.local.right)
  };
  req.user.local.password = "rien du tout";
  req.session.curentUser = req.user;
  res.cookie('SeugneBethioLaGrace', JSON.stringify(forCookie), { maxAge: mayVar.session.session_duration });
  res.send(forCookie);
}

var logoutMiddleware = function (req, res) {
  req.logout();
  res.redirect('/');
};
var sessionMiddleware = function (req, res) {
  res.send(req.session.id);
}

exports.sessionMiddleware = sessionMiddleware;
exports.logoutMiddleware = logoutMiddleware;
exports.loginMiddleware = loginMiddleware;
exports.updatePassWord = updatePassWord;



function giveRight(right) {
	return 1 + rightTab.indexOf(right);
}

function init() {
	_.each(mayVar.darajas, function (elem) {
		rightTab.push(elem);
	});
}
