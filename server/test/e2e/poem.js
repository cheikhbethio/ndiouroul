"use strict";

require("../util");
const request = require("supertest-as-promised");
const chai = require("chai");
const expect = chai.expect;
chai.should();
const app = require("../../server");
const myVar = require("../../config/variables");
const writerUrl = "/api/writer/poem";
const publicUrl = "/api/public/poem";
const lastPoeme = "/api/public/last/poem";
const loginUrl = "/api/login";
const bylabel = "/api/public/bylabel/poem";
const helper = require("../helper");
const ObjectId = require("mongodb").ObjectID;


describe("Pomes tests", function() {
	beforeEach(function(){
		this.httpResponseMessage = myVar.httpMessage.response;
		this.poemToCreate1 = {
			title: "title",
			content: "content",
			author: ObjectId("58f61d381d5e031c9c533e40"),
			rubric: "rubric",
			tof:"to",
			from: "from"
		};
		this.poemToCreate2 = {
			title: "title1",
			content: "content1",
			author: ObjectId("58f61d381d5e031c9c533e43"),
			rubric: "rubric1",
			tof:"tof1",
			from: "from1"
		};
		this.user = {
			firstname :  "moussa",
			lastname : "sow",
			password : "12345",
			login : "baymoussa",
			email : "mmoussasow@gmail.com"
		};
		this.token = undefined;
		this.credentials = {
			password : this.user.password,
			login : this.user.login
		};

		return helper.createUser(this.user)
			.then((createdUser) => {
				this.user = createdUser;
				this.poemToCreate1.author = String(createdUser._id);
				this.poemToCreate2.author = String(createdUser._id);
				return request(app).post(loginUrl).send(this.credentials);
			})
			.then(loginResponse => {
				this.token = loginResponse.body.token;
				return;
			});

	});

	describe("create Poem", function() {
		it("create poem", function() {
			return request(app)
				.post(writerUrl)
				.set("x-access-token", this.token)
				.send(this.poemToCreate1)
				.expect(201)
				.then((response) => {
					return helper.successCretation(response.body);
				});
		});

		it("must not creat poem becouse of bad argument", function() {
			this.poemToCreate1.badPropertie = "bad propertie";
			return request(app)
				.post(writerUrl)
				.set("x-access-token", this.token)
				.send(this.poemToCreate1)
				.expect(500)
				.then((response) => {
					return helper.failureCreation(response.body);
				});
		});


		it("must not creat poem becouse missing a required property", function() {
			delete  this.poemToCreate1.title;
			return request(app)
				.post(writerUrl)
				.set("x-access-token", this.token)
				.send(this.poemToCreate1)
				.expect(500)
				.then((response) => {
					return helper.failureCreation(response.body);
				});
		});

	});

	describe("get poems", function() {
		beforeEach(function() {
			return helper.createPoem(this.poemToCreate1, 1)
				.then((poemListe1) => {
					this.idPoem1= poemListe1[0]._id;
					return helper.createPoem(this.poemToCreate2, 1);
				})
				.then((poemListe2) => {
					this.idPoem2= poemListe2[0]._id;
					return;
				});

		});

		it("get by good _id", function() {
			return request(app)
				.get(publicUrl + "/" + this.idPoem1)
				.expect(200)
				.then((returnedPoemresponse) => {
					const returnedPoem = returnedPoemresponse.body.result;
					helper.compareTwoPoems(returnedPoem, String(this.user._id), this.user.firstname, this.user.lastname,this.poemToCreate1);
					return;
				});
		});

		it("get by bad _id", function() {
			return request(app)
				.get(publicUrl + "/badIdPoem")
				.expect(500)
				.then((response) => {
					expect(response.body).to.deep.equal({
						code : 500,
						message : this.httpResponseMessage.failure.failureMessage
					});
					return;
				});
		});

		it("getAll", function() {
			return request(app)
				.get(publicUrl)
				.expect(201)
				.then((poemListResponse) => {
					const poemsList = poemListResponse.body.result;
					expect(poemListResponse.body.code).to.be.equal(201);
					expect(poemListResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					expect(poemsList.length).to.be.equal(2);
					helper.compareTwoPoems(poemsList[0], String(this.user._id), this.user.firstname, this.user.lastname,this.poemToCreate1);
					return;
				});
		});

		it("getLastPoemes", function() {
			return helper.createPoem(this.poemToCreate1, 10)
				.then(() => {
					return request(app)
						.get(lastPoeme)
						.expect(201)
						.then((poemListResponse) => {
							const poemsList = poemListResponse.body.result;
							// var datesList = _.reduce(poemsList, (memo, elem) => {
							// 	memo.push([elem.created_at ,elem._id]);
							// 	return memo;
							// }, []);
							expect(poemListResponse.body.code).to.be.equal(201);
							expect(poemListResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
							expect(poemsList.length).to.be.equal(10);
							helper.compareTwoPoems(poemsList[0], String(this.user._id), this.user.firstname, this.user.lastname,this.poemToCreate1);
							return;
						});
				});
		});

		it("getByLabel", function() {
			this.key= "title";
			this.value = "title";
			return request(app)
				.get(bylabel + "?key=" + this.key + "&value=" + this.value)
				.expect(201)
				.then((poemResponse) => {
					const poem = poemResponse.body.result[0];
					expect(poemResponse.body.code).to.be.equal(201);
					expect(poemResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					helper.compareTwoPoems(poem, String(this.user._id), this.user.firstname, this.user.lastname,this.poemToCreate1);
					return;
				});
		});


	});

	describe("delete poem", function() {

		it("which exist", function() {
			this.userId = ObjectId("58f61d381d5e031c9c533e40");
			return helper.createPoem(this.poemToCreate1, 1)
				.then((createdPoemsList) => {
					const createdPoem = createdPoemsList[0];
					return request(app)
						.delete(writerUrl + "/" + createdPoem._id)
						.set("x-access-token", this.token)
						.expect(201)
						.then((deletionResponse) => {
							const expectedResponse= {
								code : 201,
								message : this.httpResponseMessage.success.successMessage,
								_id : String(createdPoem._id)
							};
							expect(deletionResponse.body).to.deep.equal(expectedResponse);
							return request(app)
								.get(publicUrl + "/" + createdPoem._id);
						})
						.then((checkDeletedPoem) => {
							expect(checkDeletedPoem.body.result).to.be.null;
							return;
						});
				});
		});

		it("which not exist", function() {
			return request(app)
				.delete(writerUrl + "/" +  ObjectId("58f61d381d5e031c9c533e40"))
				.set("x-access-token", this.token)
				.expect(201)
				.then((deletionResponse) => {
					const expectedResponse= {
						code : 	201,
						message : this.httpResponseMessage.success.successMessage,
						_id : null
					};
					expect(deletionResponse.body).to.deep.equal(expectedResponse);
					return;
				});
		});
	});

	describe("update poem", function() {
		beforeEach(function() {
			this.userId = ObjectId("58f61d381d5e031c9c533e40");
			return helper.createPoem(this.poemToCreate1, 1)
			.then((createdPoemsList) => {
				this.createdPoemId = createdPoemsList[0]._id;
			});
		});

		it("which exist", function() {
			this.body = {content : "contentUpdated"};
			return request(app)
				.patch(writerUrl + "/" + this.createdPoemId)
				.set("x-access-token", this.token)
				.send(this.body)
				.expect(201)
				.then((updatingResponse1) => {
					this.body = {title : "titleUpdated", tof : "tofUpdated"};
					const expectedResponse= {
						code : 201,
						message : this.httpResponseMessage.success.successMessage,
						_id : String(this.createdPoemId)
					};
					expect(updatingResponse1.body).to.deep.equal(expectedResponse);
					return request(app)
						.patch(writerUrl + "/" + this.createdPoemId)
						.set("x-access-token", this.token)
						.send(this.body)
						.expect(201);
				})
				.then(() => {
					return request(app)
					.get(publicUrl + "/" + this.createdPoemId);
				})
				.then((checkUpdatedPoem) => {
					expect(checkUpdatedPoem.body.result.content).to.be.equal("contentUpdated");
					expect(checkUpdatedPoem.body.result.title).to.be.equal("titleUpdated");
					expect(checkUpdatedPoem.body.result.tof).to.be.equal("tofUpdated");
					return;
				});
		});

		it("with bad propertie", function() {
			this.body = {badPropertie : "badPropertie"};
			return request(app)
				.patch(writerUrl + "/" + this.createdPoemId)
				.set("x-access-token", this.token)
				.send(this.body)
				.expect(500)
				.then((updateResponse) => {
					expect(updateResponse.body).to.deep.equal({
						code : 500,
						message : this.httpResponseMessage.failure.failureMessage
					});
					return;
				});
		});

	});
});
