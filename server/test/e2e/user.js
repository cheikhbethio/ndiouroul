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
const memberUrl = "/api/member/user";
const userServices = require("../../users/services");

describe("User tests", function () {
	beforeEach(function() {
		this.httpResponseMessage = myVar.httpMessage.response;
		this.messageToRecieve ;
		this.user1 = {
			firstname :  "moussa",
			lastname : "sow",
			password : "123",
			login : "momo",
			email : "mmoussasow@gmail.com"
		};
		this.user2 = {
			firstname :  "moussa1",
			lastname : "sow2",
			password : "1232",
			login : "momo2",
			email : "mmoussasow2@gmail.com"
		};
	});

	describe("Creation", function() {

		it("create a user", function () {
			return request(app)
				.post(url)
				.send(this.user1)
				.expect(201)
				.then((res) => {
					this.createdUserReponse = res.body;
					let  messageToRecieve = {
						code : "201",
						message : this.httpResponseMessage.success.successMessage,
						_id : this.createdUserReponse._id
					};
					expect(this.createdUserReponse).to.deep.equal(messageToRecieve);
					return;
				});
		});

		//already exist by email, bay login
		it("must not create an exist user grep by the same login", function() {
			const clonedUser = _.clone(this.user1);
			const userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			return userToSave1.save()
				.then(() => {
					clonedUser.email = "otherEmail@gmail.com";
					return request(app)
						.post(url)
						.send(clonedUser)
						.expect(400);
				})
				.then((res) => {
					let  messageToRecieve = {
						code : 400,
						message : this.httpResponseMessage.success.existenceMessage,
					};
					expect(res.body).to.deep.equal(messageToRecieve);
					return;
				});
		});

		it("must not create an exist user grep by the same email", function() {
			const clonedUser = _.clone(this.user1);
			clonedUser.login = "otherLogin";
			const userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			return userToSave1.save()
				.then(() => {
					return request(app)
					.post(url)
					.send(clonedUser)
					.expect(400);
				})
				.then((res) => {
					let  messageToRecieve = {
						code : 400,
						message : this.httpResponseMessage.success.existenceMessage,
					};
					expect(res.body).to.deep.equal(messageToRecieve);
					return;
				});
		});

		it("must not crate user because of bad model", function() {
			const userModel = {
				firstname :  "moussa",
				lastname : "sow",
				phone : "1234",
			};
			return request(app)
				.post(url)
				.send(userModel)
				.expect(500)
				.then(res => {
					this.messageToRecieve = {code : 500, message : this.httpResponseMessage.failure.invalidSchema};
					expect(res.body).to.deep.equal(this.messageToRecieve);
					return;
				});
		});
	});

	describe("get and getAll", function() {

		beforeEach(function() {
			this.usersListLenght = 2;
			const userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			const userToSave2 = new userServices.userDbAccess(userServices.fillUserModel(this.user2));
			return userToSave1.save()
				.then((doc1) => {
					this.userId1 = doc1._id;
					return userToSave2.save();
				})
				.then((doc2) => {
					this.userId2 = doc2._id;
					return;
				});
		});

		it("findUser : by _id", function() {
			return request(app)
			.get(memberUrl + "/"+this.userId1)
			.expect(200)
			.then((value) => {
				let res = value.body.user;
				let otherProperties = _.pick(res, "firstname", "lastname", "phone", "login","email","right");
				expect(res.status).to.deep.equal(myVar.status.watingClicEmail);
				expect(res.password).to.be.a("string");
				expect(res.created_at).to.be.a("string");
				expect(otherProperties).to.deep.equal(_.pick(this.user1, "firstname", "lastname", "phone", "login","email","right"));
				return;
			});
		});

		it("find many users", function() {
			return request(app)
				.get(adminUrl)
				.expect(200)
				.then((response) => {
					const usersList = response.body.result;
					const returnedUser1 = _.pick(usersList[0], "firstname", "lastname", "login", "email");
					const returnedUser2 = _.pick(usersList[1], "firstname", "lastname", "login", "email");
					expect(usersList.length).to.be.equal(2);
					expect(returnedUser1).to.deep.equal(_.pick(this.user1, "firstname", "lastname", "login", "email"));
					expect(returnedUser2).to.deep.equal(_.pick(this.user2, "firstname", "lastname", "login", "email"));
					return;
				});
		});

		it("findUser : not user to find with a bad ObjectID", function() {
			return request(app)
			.get(memberUrl + "/58c54b21326b5b02beb26fe5")
			.expect(200)
			.then((value) => {
				expect(value.body.user).to.be.null;
				return;
			});
		});

		it("findUser : not user to find with a non ObjectID", function() {
			return request(app)
			.get(memberUrl + "/1212")
			.expect(500)
			.then((value) => {
				expect(value.body).to.deep.equal({
					code : 500,
					message : this.httpResponseMessage.failure.failureMessage
				});
				return;
			});
		});

	});

	describe("Deletion", function() {
		beforeEach(function() {
			const userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			return userToSave1.save()
				.then((doc1) => {
					this.userId1 = doc1._id;
					return;
				});
		});

		it("delete an exist user", function() {
			return request(app)
				.delete(adminUrl + "/" + this.userId1)
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
						code : 500,
						message : this.httpResponseMessage.failure.failureMessage
					});
					return;
				});
		});

	});

	describe("Update user", function() {
		beforeEach(function() {
			this.propertyToUpdate = {};
			this.userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			return this.userToSave1.save()
				.then((doc) => {
					this.userId1 = doc._id;
					this.password = doc.password;
					return;
				});
		});

		describe("with good elements", function() {
			const tab = ["firstname", "lastname", "phone", "login", "email"];

			tab.forEach(function(elem){
				describe("property " + elem , function() {
					beforeEach(function(){
						this.propertyToUpdate[elem] = "toto";
						this.propertyToUpdate.password= "123";
					});

					it("Update the propertie " + elem, function(){
						return request(app)
							.put(memberUrl + "/" + this.userId1)
							.send(this.propertyToUpdate)
							.expect(201)
							.then((res) => {
								this.messageToRecieve = {
									code : "201",
									message : this.httpResponseMessage.success.successMessage,
									_id : String(this.userId1)
								};
								expect(res.body).to.deep.equal(this.messageToRecieve);
								return userServices.userDbAccess.findById(this.userId1);
							})
							.then((value) => {
								expect(value[elem]).to.equal(this.propertyToUpdate[elem]);
								return;
							});
					});
				});
			});
			it("update password", function() {
				this.propertyToUpdate = {
					password : "123",
					newPassword : "123456"
				};
				return request(app)
					.put(memberUrl + "/" + this.userId1)
					.send(this.propertyToUpdate)
					.expect(201)
					.then((response) => {
						this.messageToRecieve = {
							code : "201",
							message : this.httpResponseMessage.success.successMessage,
							_id : String(this.userId1)
						};
						expect(response.body).to.deep.equal(this.messageToRecieve);
						return userServices.userDbAccess.findById(this.userId1);
					})
					.then((value) => {
						expect(value.password).to.be.not.equal(this.password);
						expect(value.password).to.be.a("string");
						return;
					});

			});
		});

		describe("with bad elements", function() {

			it("with bad password", function() {
				this.propertyToUpdate = {login : "newlogin", password : "badPassword"};
				return request(app)
					.put(memberUrl + "/" + this.userId1)
					.send(this.propertyToUpdate)
					.then((response) => {
						this.messageToRecieve = {
							code : 400,
							message : this.httpResponseMessage.failure.badPassword
						};
						expect(response.body).to.deep.equal(this.messageToRecieve);
					});
			});

			it("must not update user because of login presence", function() {
				this.propertyToUpdate = {login : "momo", password : "123"};
				return request(app)
					.put(memberUrl + "/" + this.userId1)
					.send(this.propertyToUpdate)
					.expect(400)
					.then((response) => {
						this.messageToRecieve = {
							code : 400,
							message : this.httpResponseMessage.failure.loginPresence,
						};
						expect(response.body).to.deep.equal(this.messageToRecieve);
					});
			});

			it("must not update user because of email presence", function() {
				this.propertyToUpdate = {email : "mmoussasow@gmail.com", password :"123"};
				return request(app)
					.put(memberUrl + "/" + this.userId1)
					.send(this.propertyToUpdate)
					.expect(400)
					.then((response) => {
						this.messageToRecieve = {
							code : 400,
							message : this.httpResponseMessage.failure.emailPresence,
						};
						expect(response.body).to.deep.equal(this.messageToRecieve);
					});
			});

		});


	});

	describe("GetKeyValidation", function() {
		beforeEach(function(){
			const userToSave1 = new userServices.userDbAccess(userServices.fillUserModel(this.user1));
			return userToSave1.save()
				.then((user) => {
					this.hashkey = user.hashkey;
					this.userId1 = user._id;
					return;
				});
		});

		it("with a valid key for a found user", function() {
			return request(app)
				.get(url+"/"+this.userId1 + "/validation?key=" + this.hashkey)
				.expect(201)
				.then((response) => {
					expect(response.body).to.deep.equal({
						code : 201,
						message : this.httpResponseMessage.failure.getKeyValidation.validation
					});
					return;
				})
				.then(() => {
					return userServices.userDbAccess.findById(this.userId1);
				})
				.then((userToCheck) => {
					expect(userToCheck.hashkey).to.be.undefined;
					return;
				});
		});

		it("withno found user", function() {
			return request(app)
				.get(url+"/"+this.userId1 + "/validation?key=" + "badkey")
				.expect(400)
				.then((response) => {
					expect(response.body).to.deep.equal({
						code : 400,
						message : this.httpResponseMessage.failure.getKeyValidation.invalidAccount
					});
					return;
				});
		});

	});
});
