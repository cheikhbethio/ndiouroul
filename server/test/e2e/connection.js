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
// const logoutUrl = "/api/logout";

xdescribe("connection", function() {

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
		it("login with valid password and email", function() {
			this.body = {	login : this.user.login,	password : this.password };
			console.log("----", this.body);

			return request(app)
			.post(loginUrl)
			.send(this.body)
			.expect(201)
			.then((response) => {
				console.log("+++++", response.body);
				return;
			});

		});
	});

	describe("logoutMiddleware", function() {
		// body...
	});

	describe("sessionMiddleware", function() {
		// body...
	});

});
