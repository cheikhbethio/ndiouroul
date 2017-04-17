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
const url = "/api/writer/poem";

describe("Pomes tests", function() {

	describe("create Poem", function() {
		return request(app)
			.post(url)
			.expect(201)
			.then((response) => {
				console.log("+++++++++++", response.body);
				return;
			});
	});


});
