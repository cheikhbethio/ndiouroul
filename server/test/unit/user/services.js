"use strict";

const chai = require("chai");
const expect = chai.expect;
chai.should();

// import our User mongoose model
const userService = require("../../../users/services");

describe("Users: services", function () {

	describe("FillUserModel : must create obj for saving :", function(){
		beforeEach(()=>{
			this.result = undefined;
			this.myVar = {
				darajas : {SIMPLE : "SIMPLE"},
				status : { watingClicEmail : "waitEmail"	}
			};
			this.source = {
				password : "123",
				login: "baymoussa",
				lastname: "Sow",
				firstname: "moussa",
				email: "mmoussasow@gmail.com"
			};
		});

		it("a good object", () => {
			this.result =  userService.fillUserModel(this.source);
			expect(this.result).to.not.equal(undefined);
		});
		it("undefined obj ", () => {
			this.source = {	password : "123"};
			this.result =  userService.fillUserModel(this.source);
			expect(this.result).to.equal(undefined);
		});
	});

});
