"use strict";

require("../util");
const _ = require("underscore");
const request = require("supertest-as-promised");
const chai = require("chai");
chai.should();
const expect = chai.expect;
const helper = require("../helper");
const app = require("../../server");
const userServices = require("../../users/services");
const myVar = require("../../config/variables");
const passwordRegenerateUrl = "/api/passwordRegenerate";
// const url = "/api/public/user";
// const adminUrl = "/api/admin/user";
// const memberUrl = "/api/member/user";
// const userServices = require("../../users/services");


describe("connection", function() {
	before(function() {

	});
	beforeEach(function() {
		this.httpResponseMessage = myVar.httpMessage.response;
		this.messageToRecieve ;
		this.user = {
			firstname :  "moussa",
			lastname : "sow",
			password : "123",
			login : "momo",
			email : "mmoussasow@gmail.com"
		};
		this.body;
	});

	describe("updatePassWord", function() {

		it("with a found user", function() {
			var createUser;
			return helper.createUser(this.user)
				.then((helperResponseCreation) => {
					createUser = helperResponseCreation;
					this.body = {email : this.user.email};
					return request(app)
						.post(passwordRegenerateUrl)
						.send(this.body)
						.expect(201);
				})
				.then((updatedUserResponse) => {
					return helper.getUser(updatedUserResponse.body._id);
				})
				.then((gettedUser) => {
					expect(createUser.password).to.be.not.equal(gettedUser.password);
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

});
