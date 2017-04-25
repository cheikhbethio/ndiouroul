"use strict";

const chai = require("chai");
const expect = chai.expect;
chai.should();
var sinon = require("sinon");
const userServices = require("../../../users/services");
const userDbAccess = userServices.userDbAccess;



// import our User mongoose model
const connectionServices = require("../../../users/connectionServices");

describe("Users: connectionServices", function () {

	describe("updatePassWord", function() {
		function toto(){
			console.log("<<<<<<<<<<<<<<<<");
		}
		var req = {body : "mmoussasow@gmail.com"}
		var res = {};
		var findOne = sinon.stub(userDbAccess, 'findOne');
		findOne.yields({body : "mmoussasow@gmail.com"}, toto);
		connectionServices.updatePassWord(req, res);
		return;
	});

});
