"use strict";

const mongoose = require("mongoose");
const metiers = require("../services/metiers");
const ObjectId = require("mongodb").ObjectID;
const dbServices = require("../services/database");
const myVar = require("../config/variables.js");
const _ = require("underscore");
const responseMsg = myVar.httpMessage.response;


const schema = mongoose.Schema;

const commentSchema = new schema({
	author : {type : schema.Types.ObjectId, ref:"users"},
	poem : {type : schema.Types.ObjectId, ref:"poem"},
	content : String,
	created_at : Date,
	updated_at : Date,
	denounced : Boolean,
});

const commentSchemaValidator = {
	type : "object",
	properties : {
		author : {type : "string", required :true},
		poem : {type : "string", required :true},
		content : {type : "string", required :true},
	},
	additionalProperties : false,
};

const commentDbAccess = mongoose.model("comments", commentSchema);
function create(req, res){

	var commentToCreateModel = fillCommentModel(req.body);
	if (!commentToCreateModel) {
		return metiers.quitWithFailure(req, res, responseMsg.failure.invalidSchema, 500);
	}
	var commentToCreate = new commentDbAccess(commentToCreateModel);
	return dbServices.post(req, res, commentToCreate);
}

function get(req, res){
	commentDbAccess.findById(req.params.id)
	.populate("author", "lastname firstname")
	.populate("poem", "title")
	.exec()
	.then((comment) => {
		return res.status(200).json({
			code : 200,
			message : responseMsg.success.successMessage,
			result : comment
		});
	})
	.catch(() => {
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
	});
}

function getAll(req, res){
	commentDbAccess.find({ $query: {}, $orderby: { created_at: -1 } })
	.populate("author", "lastname firstname")
	.populate("poem", "title")
		.then((comments) => {
			return res.status(200).json({
				code : 200,
				message : responseMsg.success.successMessage,
				result : comments
			});
		})
		.catch(() => {
			return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
		});
}

function getByLabel(req, res) {
	const query = {};
	query[req.query.key] = ObjectId(req.query.value);

	commentDbAccess.find({ $query: query, $orderby: { created_at: -1 } })
	.populate("author", "lastname firstname")
	.populate("poem", "title")
	.then((comments) => {
		return res.status(200).json({
			code : 200,
			message : responseMsg.success.successMessage,
			result : comments
		});
	})
	.catch(() => {
		return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
	});
}

function deleteComment(req, res){
	return dbServices.deleteDoc(req, res, commentDbAccess);
}

function edit(req, res){
	const editSchemaValidator = {
		type :"object",
		properties : {
			denounced: {type : "boolean", required: false},
		},
		additionalProperties : false,
		minProperties: 1
	};
	var isValidParam =  metiers.isValidModel(req.body, editSchemaValidator);
	if(isValidParam.valid){
		req.body.updated_at =  Date.now();
		return dbServices.update(req, res, commentDbAccess, req.body);
	}
	return metiers.quitWithFailure(req, res, responseMsg.failure.failureMessage, 500);
}

function fillCommentModel(source){
	let destination = _.clone(source);
	const paramsValidation = metiers.isValidModel(destination, commentSchemaValidator);
	if (!paramsValidation.valid) {
		return undefined;
	}

	destination.denounced = false,
	destination.created_at = Date.now(),
	destination.histo = false;
	return destination;
}

exports = _.extend(exports, {
	commentDbAccess,
	create,
	get,
	getAll,
	getByLabel,
	deleteComment,
	edit,
	fillCommentModel
});
