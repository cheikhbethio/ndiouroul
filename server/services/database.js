"use strict";

const _ = require("underscore");
const myVar = require("../config/variables.js");
const responseMsg = myVar.httpMessage.response;
const ObjectID = require("mongodb").ObjectID;

function post(req, res, objectToSave){
	notDbAccessFound(objectToSave);
	return objectToSave.save()
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

function get(req, res, dbAccess){
	notDbAccessFound(dbAccess);
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	}
	return  dbAccess.findById(req.params.id)
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

function deleteDoc(req, res,dbAccess){
	notDbAccessFound(dbAccess);
	if(!ObjectID.isValid(req.params.id)){
		return quitWithFailure(req, res, responseMsg.failure.failureMessage);
	}
	return dbAccess.findByIdAndRemove(req.params.id)
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

function update(req, res,dbAccess){
	notDbAccessFound(dbAccess);
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

function notDbAccessFound(dbAccess){
	if (_.isUndefined(dbAccess))
		throw "Pas de porte d'entrée à la base";
}

function quitWithFailure(req, res, message){
	return res.status(500).json({code : "500", message :message});
}

exports = _.extend(exports ,{
	deleteDoc,
	update,
	get,
	post,
	quitWithFailure
});
