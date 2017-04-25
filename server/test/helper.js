"use strict";

const chai = require("chai");
chai.should();
const expect = chai.expect;
const myVar = require("../config/variables");
const request = require("supertest-as-promised");
const userServices = require("../users/services");
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

function poemCreator(app, userId, poemToCreate, numberToCreate) {
	return  new Promise(function(resolve, reject) {
		poemToCreate.author = userId;
		for (var cursor = 0; cursor < numberToCreate; cursor++) {
			request(app)
			.post("/api/writer/poem")
			.send(poemToCreate)
			.then((createdPoem) => {
				if (numberToCreate === 1) {
					return resolve(createdPoem.body);
				}
				if (cursor === numberToCreate) {
					return resolve();
				}
			})
			.catch(() => {
				return reject();
			});
		}
	});
}

//a revoir pour la boucle des Promise
function commentCreator(app, user, poemToCreate, commentToCreate, numberToCreate){
	const result = {};
	result.idCommentList = [];
	return new Promise(function(resolve, reject) {
		return request(app)
		.post("/api/public/user")
		.send(user)
		.then((createdUserResponse) => {
			result.userId = createdUserResponse.body._id;
			result.idCommentList.push(createdUserResponse.body._id);
			poemToCreate.author = createdUserResponse.body._id;
			return request(app)
				.post("/api/writer/poem")
				.send(poemToCreate);
		})
		.then((createdPoem) => {
			result.poemId = createdPoem.body._id;
			commentToCreate.author = result.userId;
			commentToCreate.poem =  createdPoem.body._id;
			for (var cursor = 0; cursor < numberToCreate; cursor++) {
				request(app)
				.post("/api/member/comment")
				.send(commentToCreate)
				.then((createdCommentResponse) => {
					result.commentId = createdCommentResponse.body._id;
					if (cursor === numberToCreate) {
						return resolve(result);
					}
				})
				.catch(() => {
					return reject();
				});
			}
		});

	});
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

function createUser(userParams){
	const userToSave = new userServices.userDbAccess(userServices.fillUserModel(userParams));
	return userToSave.save()
		.then((savedUser) => {
			return savedUser;
		});
}

function getUser(id){
	return userServices.userDbAccess.findById(id)
		.then((gettedUser) => {
			return gettedUser;
		});
}

exports = _.extend(exports, {
	getUser,
	createUser,
	failureNotExisting,
	compareTwoComments,
	commentCreator,
	poemCreator,
	compareTwoPoems,
	successCretation,
	failureCreation,
	failureGetting
});
