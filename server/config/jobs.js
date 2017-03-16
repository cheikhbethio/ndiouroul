'use strict';

var mayVar = require('./variables.js');

//check req logging
var isLoggedIn = function (req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	return disconnect(req, res);
}

//check if a writter
var isWritter = function (req, res, next) {
	var curUser = req.session.curentUser ? req.session.curentUser.local : null;

	if(req.isAuthenticated() &&
		(curUser.right === mayVar.darajas.MIDDLE ||
			curUser.right === mayVar.darajas.HIGHT)) {
		return next();
	}
	return disconnect(req, res);
}

//check if a chef
var isGod = function (req, res, next) {
	if(req.isAuthenticated() &&
		req.session.curentUser.right === mayVar.darajas.HIGHT) {
		return next();
	}
	return disconnect(req, res);
}

function disconnect(req, res) {
	req.logout();
	req.session.destroy();
	return res.send(["Disconnection"]);
}

//exports
exports.isLoggedIn = isLoggedIn;
exports.isWritter = isWritter;
exports.isGod = isGod;
