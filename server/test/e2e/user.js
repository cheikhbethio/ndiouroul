"use strict";

// const utils = require("./util");
require("./util");
const _ = require("underscore");
const request = require("supertest-as-promised");
const chai = require("chai");
chai.should();
const expect = chai.expect;
const app = require("../../server");
const myVar = require("../../config/variables");
const url = "/api/public/user";
const adminUrl = "/api/admin/user";

describe("User tests", function () {
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
	});

	describe("Creation", function() {

		beforeEach(function(){
			return request(app)
				.post(url)
				.send(this.user)
				.expect(201)
				.then((res) => {
					this.userId = res._id;
					this.createdUser = res.body;
				});
		});

		it("create a user", function () {
			let  messageToRecieve = {
				code : "201",
				message : this.httpResponseMessage.success.successMessage,
				_id : this.createdUser._id
			};
			expect(this.createdUser).to.deep.equal(messageToRecieve);
			return;
		});

		//already exist by email, bay login
		it("msow must not create an exist user grep by the same login", function() {
			this.user.email = "otherEmail@gmail.com";
			return request(app)
				.post(url)
				.send(this.user)
				.then((res) => {
					let  messageToRecieve = {
						code : "500",
						message : this.httpResponseMessage.success.existenceMessage,
					};
					expect(res.body).to.deep.equal(messageToRecieve);
					return;
				});
		});

		it("must not create an exist user grep by the same login", function() {
			this.user.login = "otherLogin";
			return request(app)
				.post(url)
				.send(this.user)
				.then((res) => {
					let  messageToRecieve = {
						code : "500",
						message : this.httpResponseMessage.success.existenceMessage,
					};
					expect(res.body).to.deep.equal(messageToRecieve);
					return;
				});
		});

		it("must not crate user because of bad model", function() {
			this.user = {
				firstname :  "moussa",
				lastname : "sow",
				phone : "1234",
			};
			return request(app)
				.post(url)
				.send(this.user)
				.expect(500)
				.then(res => {
					this.messageToRecieve = {code : "500", message : this.httpResponseMessage.failure.invalidSchema};
					expect(res.body).to.deep.equal(this.messageToRecieve);
					return;
				});
		});
	});

	describe("Find user one or many", function() {

		beforeEach(function() {
			this. userId;
			return request(app)
				.post(url)
				.send(this.user)
				.then((res) => {
					this.userId = res.body._id;
					return;
				});
		});

		it("findUser :  by ID", function() {
			return request(app)
			.get(url + "/"+this.userId)
			.expect(200)
			.then((value) => {
				let res = value.body.user;
				let otherProperties = _.pick(res, "firstname", "lastname", "phone", "login","email","right");

				expect(res._id).to.equal(this.userId);
				expect(res.status).to.deep.equal(myVar.status.watingClicEmail);
				expect(res.password).to.be.a("string");
				expect(res.created_at).to.be.a("string");
				this.user = _.omit(this.user, "password");
				this.user.right = "salsa";
				expect(otherProperties).to.deep.equal(this.user);
				return;
			});

		});

		it("findUser : not user to find with a bad ObjectID", function() {
			return request(app)
			.get(url + "/58c54b21326b5b02beb26fe5")
			.expect(200)
			.then((value) => {
				expect(value.body.user).to.be.null;
				return;
			});
		});

		it("findUser1 : not user to find with a non ObjectID", function() {
			return request(app)
			.get(url + "/1212")
			.expect(500)
			.then((value) => {
				expect(value.body).to.deep.equal({
					code : "500",
					message : this.httpResponseMessage.failure.failureMessage
				});
				return;
			});
		});


	});

	describe("Deletion", function() {
		beforeEach(function() {
			this. userId;
			return request(app)
				.post(url)
				.send(this.user)
				.then((res) => {
					this.userId = res.body._id;
					return;
				});
		});

		it("delete an exist user", function() {
			return request(app)
				.delete(adminUrl + "/" + this.userId)
				.expect(200)
				.then((value) => {
					expect(_.omit(value.body,"_id")).to.deep.equal( {
						code: "200",
						message: this.httpResponseMessage.success.successMessage
					});
					expect(value.body._id).to.be.a("string");
					return;
				});
		});

		it("delete an inexistant user -- good ObjectID", function() {
			return request(app)
				.delete(adminUrl + "/" + "58c54b21326b5b02beb26fe5")
				.expect(200)
				.then((err) => {
					expect(err.body._id).to.be.null;
					return;
				});
		});

		it("delete an inexistant user -- bad ObjectID", function() {
			return request(app)
				.delete(adminUrl + "/" + "132")
				.expect(500)
				.then((err) => {
					expect(err.body).to.deep.equal({
						code : "500",
						message : this.httpResponseMessage.failure.failureMessage
					});
					return;
				});
		});

	});

	describe("Update user", function() {
		beforeEach(function() {
			this.userId;
			return request(app)
				.post(url)
				.send(this.user)
				.then((res) => {
					this.userId = res.body._id;
					return;
				});
		});

		describe("with good elements", function() {
			let tab = ["firstname", "lastname", "phone", "password", "login", "email"];

			tab.forEach(function(elem){
				describe("property " + elem , function() {
					beforeEach(function(){
						this.propertyToUpdate = {};
						this.propertyToUpdate[elem] = "toto";
					});

					it("Update the propertie " + elem, function(){
						return request(app)
							.patch(url + "/" + this.userId)
							.send(this.propertyToUpdate)
							.expect(201)
							.then((res) => {
								this.messageToRecieve = {
									code : "201",
									message : this.httpResponseMessage.success.successMessage,
									_id : res.body._id
								};
								expect(res.body).to.deep.equal(this.messageToRecieve);
								expect(res.body._id).to.be.a("string");
								return;
							});
					});

				});
			});

		});
	});
});
