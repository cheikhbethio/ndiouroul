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
const bylabel = "/api/public/bylabel/poem";
const helper = require("../helper");
const ObjectId = require("mongodb").ObjectID;


describe("Pomes tests", function() {
	beforeEach(function(){
		this.httpResponseMessage = myVar.httpMessage.response;
		this.poemToCreate = {
			title: "title",
			content: "content",
			author: ObjectId("58f61d381d5e031c9c533e40"),
			rubric: "rubric",
			tof:"to",
			from: "from"
		};
		this.poemToCreate1 = {
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
			password : "123",
			login : "momo",
			email : "mmoussasow@gmail.com"
		};

	});

	describe("create Poem", function() {
		it("create poem", function() {
			return request(app)
				.post(writerUrl)
				.send(this.poemToCreate)
				.expect(201)
				.then((response) => {
					return helper.successCretation(response.body);
				});
		});

		it("must not creat poem becouse of bad argument", function() {
			this.poemToCreate.badPropertie = "bad propertie";
			return request(app)
				.post(writerUrl)
				.send(this.poemToCreate)
				.expect(500)
				.then((response) => {
					return helper.failureCreation(response.body);
				});
		});


		it("must not creat poem becouse missing a required property", function() {
			delete  this.poemToCreate.title;
			return request(app)
				.post(writerUrl)
				.send(this.poemToCreate)
				.expect(500)
				.then((response) => {
					return helper.failureCreation(response.body);
				});
		});

	});

	describe("get poems", function() {
		beforeEach(function() {
			return request(app)
				.post("/api/public/user")
				.send(this.user)
				.then((createdUserResponse) => {
					this.userId = createdUserResponse.body._id;
					this.poemToCreate1.author = createdUserResponse.body._id;
					return request(app)
						.post(writerUrl)
						.send(this.poemToCreate1);
				})
				.then((secondCreatedPoem) => {
					this.poemId1 = secondCreatedPoem.body._id;
					this.poemToCreate.author = this.userId;
					return request(app)
						.post(writerUrl)
						.send(this.poemToCreate)
						.then((createdPoemResponse) => {
							this.poemId = createdPoemResponse.body._id;
						});
				});
		});

		it("get by good _id", function() {
			return request(app)
				.get(publicUrl + "/" + this.poemId)
				.expect(200)
				.then((returnedPoemresponse) => {
					const returnedPoem = returnedPoemresponse.body.result;
					helper.compareTwoPoems(returnedPoem, this.userId, this.user.firstname, this.user.lastname,this.poemToCreate);
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
			return helper.poemCreator(app, this.userId, this.poemToCreate, 10)
				.then(() => {
					return request(app)
						.get(publicUrl)
						.expect(201)
						.then((poemListResponse) => {
							const poemsList = poemListResponse.body.result;
							expect(poemListResponse.body.code).to.be.equal(201);
							expect(poemListResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
							expect(poemsList.length).to.be.at.least(10);
							helper.compareTwoPoems(poemsList[0], this.userId, this.user.firstname, this.user.lastname,this.poemToCreate1);
							return;
						});
				});
		});

		it("getLastPoemes", function() {
			return helper.poemCreator(app, this.userId, this.poemToCreate, 10)
				.then(() => {
					return request(app)
						.get(lastPoeme)
						.expect(201)
						.then((poemListResponse) => {
							const poemsList = poemListResponse.body.result;
							expect(poemListResponse.body.code).to.be.equal(201);
							expect(poemListResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
							expect(poemsList.length).to.be.equal(10);
							helper.compareTwoPoems(poemsList[0], this.userId, this.user.firstname, this.user.lastname,this.poemToCreate1);
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
					helper.compareTwoPoems(poem, this.userId, this.user.firstname, this.user.lastname,this.poemToCreate);
					return;
				});
		});


	});

	describe("delete poem", function() {

		it("which exist", function() {
			this.userId = ObjectId("58f61d381d5e031c9c533e40");
			return helper.poemCreator(app, this.userId, this.poemToCreate, 1)
				.then((createdPoem) => {
					return request(app)
						.delete(writerUrl + "/" + createdPoem._id)
						.expect(201)
						.then((deletionResponse) => {
							const expectedResponse= {
								code : 201,
								message : this.httpResponseMessage.success.successMessage,
								_id : createdPoem._id
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
			return helper.poemCreator(app, this.userId, this.poemToCreate, 1)
			.then((createdPoem) => {
				this.createdPoemId = createdPoem._id;
			});
		});

		it("which exist", function() {
			this.body = {content : "contentUpdated"};
			return request(app)
				.patch(writerUrl + "/" + this.createdPoemId)
				.send(this.body)
				.expect(201)
				.then((updatingResponse1) => {
					this.body = {title : "titleUpdated", tof : "tofUpdated"};
					const expectedResponse= {
						code : 201,
						message : this.httpResponseMessage.success.successMessage,
						_id : this.createdPoemId
					};
					expect(updatingResponse1.body).to.deep.equal(expectedResponse);
					return request(app)
						.patch(writerUrl + "/" + this.createdPoemId)
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
