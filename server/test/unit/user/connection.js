"use strict";

const bcrypt = require("bcrypt");
const chai = require("chai");
const expect = chai.expect;
chai.should();
var sinon = require("sinon");
const userServices = require("../../../users/services");
const myVar = require("../../../config/variables");
const userDbAccess = userServices.userDbAccess;
const theMailer = require("../../../config/jobsMailer.js");
const metiers = require("../../../services/metiers");
const _ = require("underscore");
const connectionServices = require("../../../users/connectionServices");

describe("Users: connectionServices", function () {
	beforeEach(function() {
		this.httpResponseMessage = myVar.httpMessage.response;
		this.res ={
			send: sinon.spy(),
			json: sinon.spy(),
			status : function(responseStatus){
				expect(responseStatus).to.be.equal(201);
				return this;
			}
		};
		theMailer.emailSender = sinon.spy();
	});

	describe("updatePassWord", function() {
		beforeEach(function() {
			this.user = {
				_id : "_id",
				firstname :  "moussa",
				lastname : "sow1",
				password : "123",
				login : "momo",
				email : "mmoussasow@gmail.com"
			};
			this.updatedUser = _.extend(this.user, {password : "updated"});
			this.req = {
				body : {email :"mmoussasow@gmail.com"}
			};

		});

		afterEach(function() {
			userDbAccess.findOne.restore();
			this.mock.verify();
		});

		it("for an existing user ", function(done) {
			this.mock = sinon.mock(userDbAccess)
			.expects("findOne")
			.withArgs({email :"mmoussasow@gmail.com"})
			.resolves(this.user);

			sinon.mock(userDbAccess)
			.expects("findByIdAndUpdate")
			.resolves(this.updatedUser);

			this.req = {
				body : {email :"mmoussasow@gmail.com"}
			};

			var functionTotest = connectionServices.updatePassWord(this.req, this.res);
			functionTotest.then(() => {
				sinon.assert.calledWith(this.res.status(201).json, {
					code : 201,
					message : this.httpResponseMessage.success.successMessage,
					_id : "_id"
				});
				userDbAccess.findByIdAndUpdate.restore();
				done();
			})
			.catch((err) => {
				expect(err).to.be.undefined;
			});

		});

		it("for an not found user", function(done) {
			this.req.body = {email : "notFoundEmail"};
			this.mock = sinon.mock(userDbAccess)
				.expects("findOne")
				.withArgs({email :"notFoundEmail"})
				.resolves({});

			this.res.status = function(responseStatus){
				expect(responseStatus).to.be.equal(400);
				return this;
			};

			var functionTotest = connectionServices.updatePassWord(this.req, this.res);
			functionTotest.then(() => {
				sinon.assert.calledWith(this.res.status(400).json, {
					code : 400,
					message : this.httpResponseMessage.failure.docNotFound
				});

				done();
			});
		});
	});

	describe("loginMiddleware", function() {
		beforeEach(function() {
			this.user = {
				_id : "_id",
				firstname :  "moussa",
				lastname : "sow1",
				password : "123",
				login : "momo",
				email : "mmoussasow@gmail.com",
				right : "salsaBatKiz"
			};
			this.req = {
				user : {
					_id : this.user._id,
					login : this.user.login,
					lastname : this.user.lastname,
					firstname : this.user.firstname,
					right : this.user.right
				},
				session : {}
			};
			this.res = {
				send: sinon.spy(),
				json: sinon.spy(),
				cookie : sinon.spy(),
			};

			this.cookie = {
				id: "_id",
				login: "momo",
				lastname: "sow1",
				firstname: "moussa",
				right: 3
			};

		});

		it("with valid properties", function() {
			//GIVEN
			this.res.status = function(responseStatus){
				expect(responseStatus).to.be.equal(201);
				return this;
			};
			//WHEN
			connectionServices.loginMiddleware(this.req, this.res);
			//THEN
			sinon.assert.calledWith(this.res.cookie, "SeugneBethioLaGrace", JSON.stringify(this.cookie), { maxAge: 				myVar.session.session_duration });
			sinon.assert.calledWith(this.res.status(201).json, {
				code : 201,
				message : this.httpResponseMessage.success.successMessage,
				result : this.cookie
			});
		});

		it("with bad properties", function() {
			//GIVEN
			metiers.quitWithFailure = sinon.spy();

			this.req.user  = {
				id: undefined,
				login: false,
				lastname: undefined,
				firstname: false,
				right: 3
			};

			const message ={
				code : 400,
				message : "notConnected"
			};
			//WHEN
			connectionServices.loginMiddleware(this.req, this.res);
			//THEN
			sinon.assert.calledWith(metiers.quitWithFailure, this.req, this.res, message, 400);

		});

	});

	describe("logoutMiddleware", function() {
		it("must Log out", function() {
			//GIVEN
			this.req = {
				logout : sinon.spy()
			};

			//WHEN
			connectionServices.logoutMiddleware(this.req, this.res);

			//THEN
			sinon.assert.called(this.req.logout);
			sinon.assert.calledWith(this.res.status(201).json, {
				code : 201,
				message : this.httpResponseMessage.success.successMessage,
			});
		});
	});

	describe("sessionMiddleware", function() {
		it("must give session id", function() {
			//GIVEN
			const sessionId = "idSession";
			this.req = {
				session : {id : sessionId}
			};

			//WHEN
			connectionServices.sessionMiddleware(this.req, this.res);

			//THEN
			sinon.assert.calledWith(this.res.status(201).json, {
				code : 201,
				message :  this.httpResponseMessage.success.successMessage,
				result : sessionId
			});
		});
	});

	describe("authenticate", function() {
		beforeEach(function() {
			this.httpResponseMessage = myVar.httpMessage.response;
			this.req = {
				body : {
					login : "login",
					password : "13245"
				}
			};
			this.res ={
				send: sinon.spy(),
				json: sinon.spy(),
				status : function(responseStatus){
					expect(responseStatus).to.be.equal(400);
					return this;
				}
			};
			this.user = {
				_id : "_id",
				firstname :  "moussa",
				lastname : "sow1",
				password : "123",
				login : "momo",
				email : "mmoussasow@gmail.com"
			};
			metiers.quitWithFailure = sinon.spy();
			this.next = sinon.spy();

		});

		it("with bad params", function() {
			this.req.body = "badBody";
			connectionServices.authenticate(this.req, this.res, this.next);
			sinon.assert.calledWith(metiers.quitWithFailure, this.req, this.res, this.httpResponseMessage.failure.failureMessage, 500);
		});

		it("with good params but user not found", function() {
			const mock1 = sinon.mock(userDbAccess)
			.expects("findOne")
			.withArgs({$or:[{"login" : this.req.body.login},	{"email" :this.req.body.login}]})
			.resolves({});

			var resAuthentication = connectionServices.authenticate(this.req, this.res, this.next);
			resAuthentication.then(() => {
				sinon.assert.calledWith(this.res.status(400).json, {code : 400, message : this.httpResponseMessage.failure.docNotFound});
			});

			userDbAccess.findOne.restore();
			mock1.verify();
		});

		it("with good params but bad password", function(done) {
			const mock1 = sinon.mock(userDbAccess)
			.expects("findOne")
			.withArgs({$or:[{"login" : this.req.body.login},	{"email" :this.req.body.login}]})
			.resolves(this.user);

			const mock2 = sinon.mock(bcrypt)
			.expects("compareSync")
			.withArgs(this.req.body.password, this.user.password)
			.returns(false);

			var resAuthentication = connectionServices.authenticate(this.req, this.res, this.next);
			resAuthentication.then(() => {
				sinon.assert.calledWith(this.res.status(400).json, {code : 400, message : this.httpResponseMessage.failure.docNotFound});

				userDbAccess.findOne.restore();
				mock1.verify();
				bcrypt.compareSync.restore();
				mock2.verify();
				done();
			});
		});

		it("with all good params and properties", function(done) {
			const mock1 = sinon.mock(userDbAccess)
			.expects("findOne")
			.withArgs({$or:[{"login" : this.req.body.login},	{"email" :this.req.body.login}]})
			.resolves(this.user);

			var mock2 = sinon.mock(bcrypt)
			.expects("compareSync")
			.withArgs(this.req.body.password, this.user.password)
			.returns(true);

			var resAuthentication = connectionServices.authenticate(this.req, this.res, this.next);
			resAuthentication.then(() => {
				sinon.assert.called(this.next);

				userDbAccess.findOne.restore();
				mock1.verify();
				bcrypt.compareSync.restore();
				mock2.verify();

				done();
			});
		});

	});

});
