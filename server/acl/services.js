"use strict";

const myVars = require("../config/variables.js");
const jwt    = require("jsonwebtoken");
const _ = require("lodash");


//exports
module.exports = {
	isLoggedIn,
	isWritter,
	isGod,
	isMember
};

//isLoggedIn
function isLoggedIn(req, res, next) {
	const token = req.body.token || req.query.token || req.headers["x-access-token"];
	if (token) {
		jwt.verify(token, myVars.secret, function(err, decoded) {
			if (err) {
				req.session.destroy();
				return res.json({ success: false, message: "Failed to authenticate token." });
			} else {
				req.decoded = decoded;
				next();
			}
		});

	} else {
		req.session.destroy();
		return res.status(403).send({
			success: false,
			message: "No token provided."
		});
	}
}

function isMember(req, res, next){
	const right = _.get(req, "session.curentUser.right");

	const hasRight = _.chain(myVars.darajas).values().indexOf(right).value();

	if(hasRight < 0){
		return disconnect(req, res);
	}
	next();
}

function isWritter(req, res, next) {
	const right = _.get(req, "session.curentUser.right");
	const hasRight = _.chain(myVars.darajas).cloneDeep().pick("MIDDLE","HIGHT").values().indexOf(right).value();

	if (hasRight<0) {
		return disconnect(req, res);
	}
	next();
}

function isGod(req, res, next) {
	const right = _.get(req, "session.curentUser.right");
	const hasRight = right === _.get(myVars.darajas, "HIGHT");

	if(!hasRight) {
		return disconnect(req, res);
	}
	next();
}

function disconnect(req, res) {
	req.session.destroy();
	return res.status(201).json({code : 201, message : "disconnection"});
}
