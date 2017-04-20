"use strict";

const chai = require("chai");
chai.should();
const expect = chai.expect;
const myVar = require("../config/variables");
const request = require("supertest-as-promised");
const _ = require("underscore");
var httpResponseMessage = myVar.httpMessage.response;

let  messageToRecieve;

function successCretation(responseBody){
	messageToRecieve = {
		code : "201",
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
			.then(() => {
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

exports = _.extend(exports, {
	poemCreator,
	compareTwoPoems,
	successCretation,
	failureCreation
});
