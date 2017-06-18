"use strict";

const acl = require("../../../acl/services");
const _ = require("lodash");
const sinon = require("sinon");

module.exports = {
	badRight,
	goodRight
};

function goodRight(element, functionToCall){
	describe("good rigth", function() {
		beforeEach(function() {
			this.req.session.curentUser.right = _.get(element, "right");
		});
		it(element.right +"Right", function() {
			//GIVEN
			acl[functionToCall](this.req, this.res, this.next);
			//THEN
			sinon.assert.called(this.next);
		});

	});
}

function badRight(element, functionToCall){
	describe("bad right", function() {
		beforeEach(function() {
			this.req.session.curentUser.right = _.get(element, "right");
		});
		it(element.right +"Right", function() {
			//GIVEN
			acl[functionToCall](this.req, this.res, this.next);
			//THEN
			sinon.assert.notCalled(this.next);
			sinon.assert.called(this.req.session.destroy);
			sinon.assert.calledWith(this.res.status(201).json, {
				code :201,
				message : "disconnection"
			});
		});
	});
}

//
// exports = _.extend(exports,{
// 	badRight
// });
