"use strict";

const chai = require("chai");
chai.should();
const expect = chai.expect;
const myVar = require("../config/variables");
const userServices = require("../users/services");
const poemsServices = require("../poems/services");
const commentServices = require("../comments/services");
const _ = require("underscore");
const httpResponseMessage = myVar.httpMessage.response;

let  messageToRecieve;

function successCretation(responseBody){
	messageToRecieve = {
		code : 201,
		message : httpResponseMessage.success.successMessage,
		_id : responseBody._id
	};
	expect(responseBody).to.deep.equal(messageToRecieve);
	return;
}

function failureCreation(responseBody){
	messageToRecieve = {
		code : 500,
		message : httpResponseMessage.failure.invalidSchema
	};
	expect(responseBody).to.deep.equal(messageToRecieve);
	return;
}

function failureGetting(responseBody){
	expect(responseBody.code).to.be.equal(500);
	expect(responseBody.message).to.be.equal(httpResponseMessage.failure.failureMessage);
}

function failureNotExisting(responseBody){
	expect(responseBody.code).to.be.equal(200);
	expect(responseBody.message).to.be.equal(httpResponseMessage.success.successMessage);
	expect(responseBody.result).to.be.null;
}

function compareTwoPoems(returnedPoem, userId, firstname, lastname, poemToCreate){
	const firstPart = _.pick(returnedPoem, "title", "content", "rubric", "tof", "from");
	const secondPart = {
		_id: userId,
		firstname:firstname,
		lastname: lastname
	};
	expect(firstPart).to.deep.equal(_.omit(poemToCreate, "author"));
	expect(returnedPoem.author).to.deep.equal(secondPart);
	expect(returnedPoem.denounced).to.be.equal(false);
	expect(returnedPoem.created_at).to.be.a("string");
	expect(returnedPoem.update_at).to.be.a("string");
	expect(returnedPoem.histo).to.be.equal(false);
}

function compareTwoComments(gettedComment, content, title, firstname, lastname){
	expect(gettedComment).to.have.property("_id");
	expect(gettedComment._id).to.be.a("string");
	expect(gettedComment.content).to.be.equal(content);
	expect(gettedComment.denounced).to.be.false;
	expect(gettedComment.created_at).to.be.a("string");

	expect(gettedComment.author).to.have.property("_id");
	expect(gettedComment.author.firstname).to.be.equal(firstname);
	expect(gettedComment.author.lastname).to.be.equal(lastname);

	expect(gettedComment.poem).to.have.property("_id");
	expect(gettedComment.poem.title).to.be.equal(title);
}

function commentCreator(app, commentsParams, numberToCreate){
	const result = [];
	return new Promise(function(resolve, reject) {
		for (var cursor = 0; cursor < numberToCreate; cursor++) {
			var commentToSave = new commentServices.commentDbAccess(commentServices.fillCommentModel(commentsParams));
			commentToSave.save()
				.then((savedComment) => {
					result.push(savedComment);
					if (cursor === numberToCreate) {
						return resolve(result);
					}
				})
				.catch(() => {
					return reject();
				});
		}
	});
}

function createUser(userParams){
	const userToSave = new userServices.userDbAccess(userServices.fillUserModel(userParams));
	return userToSave.save()
		.then((savedUser) => savedUser);
}

function createPoem(poemParams, numberToCreate){
	const result = [];
	return new Promise(function(resolve, reject) {
		for (var cursor = 0; cursor < numberToCreate; cursor++) {
			var poemToSave = new poemsServices.poemDbAccess(poemsServices.fillPoemModel(poemParams));
			poemToSave.save()
			.then((savedPoem) => {
				result.push(savedPoem);
				if (cursor === numberToCreate) {
					return resolve(result);
				}
			})
			.catch(() => {
				return reject();
			});
		}
	});
}

function getUser(id){
	return userServices.userDbAccess.findById(id)
		.then((gettedUser) => {
			return gettedUser;
		});
}

exports = _.extend(exports, {
	createPoem,
	getUser,
	createUser,
	failureNotExisting,
	compareTwoComments,
	commentCreator,
	compareTwoPoems,
	successCretation,
	failureCreation,
	failureGetting,
});
