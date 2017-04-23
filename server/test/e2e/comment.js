"use strict";

require("../util");
const request = require("supertest-as-promised");
const chai = require("chai");
const expect = chai.expect;
chai.should();
const app = require("../../server");
const myVar = require("../../config/variables");
const memberUrl = "/api/member/comment";
const adminUrl = "/api/admin/comment";
const byLabelUrl = "/api/public/bylabel/comment";
const helper = require("../helper");
const ObjectId = require("mongodb").ObjectID;


describe("Comments tests", function() {
	beforeEach(function() {
		this.httpResponseMessage = myVar.httpMessage.response;
		this.commentToCreate = {
			author :  ObjectId("58f61d381d5e031c9c533e43"),
			poem :  ObjectId("58f61d381d5e031c9c533e12"),
			content : "commentcontent"
		};
		this.poemToCreate = {
			title: "title",
			content: "content",
			author: ObjectId("58f61d381d5e031c9c533e40"),
			rubric: "rubric",
			tof:"to",
			from: "from"
		};
		this.user = {
			firstname :  "moussa",
			lastname : "sow",
			password : "123",
			login : "momo",
			email : "mmoussasow@gmail.com"
		};
	});

	describe("creation", function() {
		it("create comment", function() {
			return request(app)
				.post(memberUrl)
				.send(this.commentToCreate)
				.expect(201)
				.then((createdCommentResponse) => {
					return helper.successCretation(createdCommentResponse.body);
				});
		});

		it("must not create comment because of bad property in argument", function() {
			this.commentToCreate.badPropertie = "badPropertie";
			return request(app)
				.post(memberUrl)
				.send(this.commentToCreate)
				.expect(500)
				.then((createdCommentResponse) => {
					return helper.failureCreation(createdCommentResponse.body);
				});
		});

		it("must not create because of missing a required property", function() {
			delete this.commentToCreate.poem;
			return request(app)
				.post(memberUrl)
				.send(this.commentToCreate)
				.expect(500)
				.then((createdCommentResponse) => {
					return helper.failureCreation(createdCommentResponse.body);
				});
		});
	});

	describe("get a comment", function() {

		it("get by id", function() {
			return helper.commentCreator(app, this.user, this.poemToCreate, this.commentToCreate, 1)
				.then((resultConstructor) => {
					return request(app)
						.get(adminUrl + "/" + resultConstructor.commentId)
						.expect(200);
				})
				.then((gettedCommentResponse) => {
					expect(gettedCommentResponse.body.code).to.be.equal(200);
					expect(gettedCommentResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					const gettedComment = gettedCommentResponse.body.result;
					helper.compareTwoComments(gettedComment, this.commentToCreate.content,
						this.poemToCreate.title, this.user.firstname, this.user.lastname);
					return;
				});
		});

		it("get by bad _id", function() {
			return request(app)
				.get(adminUrl + "/badId")
				.expect(500)
				.then((response) => {
					return helper.failureGetting(response.body);
				});
		});

		it("get by not existing poem", function() {
			return request(app)
				.get(adminUrl + "/" + ObjectId("58f61d381d5e031c9c533e43"))
				.expect(200)
				.then((response) => {
					return helper.failureNotExisting(response.body);
				});
		});
	});

	describe("get multiple or by label", function() {
		beforeEach(function() {
			return helper.commentCreator(app, this.user, this.poemToCreate, this.commentToCreate, 2)
				.then((comments) => {
					this.userId = comments.userId;
					this.poemId = comments.poemId;
					return;
				});
		});

		it("getAll", function() {
			return request(app)
				.get(adminUrl)
				.expect(200)
				.then((allCommentResponse) => {
					const responseBody = allCommentResponse.body;
					const allPoems = allCommentResponse.body.result;
					const _this = this;

					expect(responseBody.code).to.be.equal(200);
					expect(responseBody.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					expect(allPoems).to.have.lengthOf(2);
					allPoems.forEach(function(elem){
						helper.compareTwoComments(elem, _this.commentToCreate.content,
							_this.poemToCreate.title, _this.user.firstname, _this.user.lastname);
					});
					return;
				});
		});

		it("get by author", function() {
			return request(app)
				.get(byLabelUrl + "?key=author&value=" + this.userId)
				.expect(200)
				.then((allCommentResponse) => {
					const _this = this;
					const allComments = allCommentResponse.body.result;
					expect(allCommentResponse.body.code).to.be.equal(200);
					expect(allCommentResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					expect(allComments).to.have.lengthOf(2);
					allComments.forEach(function(elem){
						helper.compareTwoComments(elem, _this.commentToCreate.content,
							_this.poemToCreate.title, _this.user.firstname, _this.user.lastname);
					});
					return;
				});
		});

		it("get by poem", function() {
			return request(app)
				.get(byLabelUrl + "?key=poem&value=" + this.poemId)
				.expect(200)
				.then((allCommentResponse) => {
					const _this = this;
					const allComments = allCommentResponse.body.result;
					expect(allCommentResponse.body.code).to.be.equal(200);
					expect(allCommentResponse.body.message).to.be.equal(this.httpResponseMessage.success.successMessage);
					expect(allComments).to.have.lengthOf(2);
					allComments.forEach(function(elem){
						helper.compareTwoComments(elem, _this.commentToCreate.content,
							_this.poemToCreate.title, _this.user.firstname, _this.user.lastname);
					});
					return;
				});
		});

	});

	describe("delete", function() {
		it("delete an existing comment", function() {
			return helper.commentCreator(app, this.user, this.poemToCreate, this.commentToCreate, 1)
				.then((resultConstructor) => {
					return request(app)
						.delete(adminUrl + "/" + resultConstructor.commentId)
						.expect(201)
						.then((deletedComment) => {
							return helper.successCretation(deletedComment.body);
						});
				});
		});
	});

	describe("edition", function() {
		beforeEach(function() {
			this.properties = {};
			return helper.commentCreator(app, this.user, this.poemToCreate, this.commentToCreate, 1)
				.then((createdComment) => {
					this.createdComment = createdComment;
					return;
				});
		});

		it("success with denounced flag", function() {
			this.properties = {denounced : true};
			return request(app)
				.patch(memberUrl + "/" + this.createdComment.commentId)
				.send(this.properties)
				.expect(201)
				.then((updatedCommentResponse) => {
					const updatedComment = updatedCommentResponse.body;
					return helper.successCretation(updatedComment);
				});
		});

		it("failed with content property", function() {
			this.properties = {content : true};
			return request(app)
				.patch(memberUrl + "/" + this.createdComment.commentId)
				.send(this.properties)
				.expect(500)
				.then((updatedCommentResponse) => {
					const updatedComment = updatedCommentResponse.body;
					expect(updatedComment.code).to.be.equal(500);
					expect(updatedComment.message).to.be.equal(this.httpResponseMessage.failure.failureMessage);
					return;
				});
		});
	});
});
