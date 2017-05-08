"use strict";

require("../util");
const request = require("supertest-as-promised");
const chai = require("chai");
chai.should();
const expect = chai.expect;
const helper = require("../helper");
const app = require("../../server");
const myVar = require("../../config/variables");
const passwordRegenerateUrl = "/api/passwordRegenerate";
const loginUrl = "/api/login";
const logoutUrl = "/api/logout";
const sessionUrl = "/api/session";
const _ = require("underscore");
// const logoutUrl = "/api/logout";

describe("connection", function() {

	beforeEach(function() {
		this.httpResponseMessage = myVar.httpMessage.response;
		this.messageToRecieve ;
		this.password = "12345";
		this.user = {
			firstname :  "moussa",
			lastname : "sow",
			password : this.password,
			login : "baymoussa",
			email : "mmoussasow@gmail.com"
		};
		this.body = {};
		return helper.createUser(this.user)
			.then((createdUser) => {
				this.user = createdUser;
				return;
			});
	});

	describe("must be connected", function() {
		
	});

	describe("updatePassWord", function() {

		it("with a found user", function() {
			this.body = {email : this.user.email};
			return request(app)
				.post(passwordRegenerateUrl)
				.send(this.body)
				.expect(201)
				.then((updatedUserResponse) => {
					return helper.getUser(updatedUserResponse.body._id);
				})
				.then((gettedUser) => {
					expect(this.user.password).to.be.not.equal(gettedUser.password);
					expect(this.user.password).to.be.not.equal(gettedUser.password);
					return;
				});
		});

		it("with not found user", function() {
			this.body = {email : "ttotototototo"};
			return  request(app)
				.post(passwordRegenerateUrl)
				.send(this.body)
				.expect(400)
				.then((response) => {
					expect(response.body).to.deep.equal({
						code: 400,
						message: this.httpResponseMessage.failure.docNotFound });
					return;
				});
		});

	});

	describe("authenticate -- loginMiddleware", function() {
		it("with valid password and login", function() {
			this.body = {	login : this.user.login,	password : this.password };
			return request(app)
			.post(loginUrl)
			.send(this.body)
			.expect(201)
			.then((response) => {
				const resultResponse = response.body;
				const expected = {
					login: this.user.login,
					lastname: this.user.lastname,
					firstname: this.user.firstname,
					right: 1
				};

				expect(resultResponse.code).to.be.equal(201);
				expect(resultResponse.message).to.be.equal(this.httpResponseMessage.success.successMessage);
				expect(resultResponse.result.id).to.be.exist;
				expect(_.omit(resultResponse.result, "id")).to.deep.equal(expected);
				return;
			});

		});

		it("with valid email and login", function() {
			this.body = {	login : this.user.email,	password : this.password };
			return request(app)
			.post(loginUrl)
			.send(this.body)
			.expect(201)
			.then((response) => {
				const resultResponse = response.body;
				const expected = {
					login: this.user.login,
					lastname: this.user.lastname,
					firstname: this.user.firstname,
					right: 1
				};

				expect(resultResponse.code).to.be.equal(201);
				expect(resultResponse.message).to.be.equal(this.httpResponseMessage.success.successMessage);
				expect(resultResponse.result.id).to.be.exist;
				expect(_.omit(resultResponse.result, "id")).to.deep.equal(expected);
				return;
			});

		});

		it("with valid login and bad password", function() {
			this.body = {login : this.user.login, password : "badPassword"};
			return request(app)
			.post(loginUrl)
			.send(this.body)
			.expect(400)
			.then((response) => {
				const expected = {
					code : 400,
					message : this.httpResponseMessage.failure.docNotFound
				};
				expect(response.body).to.deep.equal(expected);
				return;
			});
		});

		it("with notFound email", function() {
			this.body = {login : "notFound@email.com", password : this.password};
			return request(app)
			.post(loginUrl)
			.send(this.body)
			.expect(400)
			.then((response) => {
				const expected = {
					code : 400,
					message : this.httpResponseMessage.failure.docNotFound
				};
				expect(response.body).to.deep.equal(expected);
				return;
			});

		});
	});

	describe("logoutMiddleware", function() {
		it("logout", function() {
			return request(app)
				.get(logoutUrl)
				.expect(201)
				.then((response) => {
					const result = response.body;
					expect(result).to.deep.equal({code : 201, message :  this.httpResponseMessage.success.successMessage});
					return;
				});
		});
	});

	describe("sessionMiddleware", function() {
		it("sessionMiddleware", function() {
			return request(app)
			.get(sessionUrl)
			.expect(201)
			.then((response) => {
				const resultResponse = response.body;
				const expected = {
					code : 201,
					message : this.httpResponseMessage.success.successMessage
				};
				expect(resultResponse.result).to.be.exist;
				expect(_.omit(resultResponse, "result")).to.deep.equal(expected);

				return;
			});
		});
	});

});
