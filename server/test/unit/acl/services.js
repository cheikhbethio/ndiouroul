"use strict";

const myVars = require("../../../config/variables");
const _ = require("lodash");
const sinon = require("sinon");
const chai = require("chai");
const expect = chai.expect;
const helper = require("./helper");

describe("tests des services e l'acl", function() {
	beforeEach(function() {
		//WHEN
		this.right = undefined;
		this.next = sinon.spy();
		this.req = {
			session : {
				curentUser : { right : undefined},
				destroy : sinon.spy()
			}
		};
		this.res = {
			send: sinon.spy(),
			json: sinon.spy(),
			status : function(responseStatus){
				expect(responseStatus).to.be.equal(201);
				return this;
			}
		};
	});

	describe("isMember", function() {
		[
				{right : _.get(myVars.darajas, "SIMPLE")},
				{right : _.get(myVars.darajas, "MIDDLE")},
				{right : _.get(myVars.darajas, "HIGHT")},
		].forEach(function(element){
			describe("good right", function() {
				helper.goodRight(element, "isMember");
			});

		});

		[
			{right : undefined},
			{right : "toto"}
		].forEach(function(element){
			describe("bad Right", function() {
				helper.badRight(element, "isMember");
			});
		});

	});

	describe("isWritter", function() {
		[
			{right : _.get(myVars.darajas, "MIDDLE")},
			{right : _.get(myVars.darajas, "HIGHT")},
		].forEach(function(element){
			helper.goodRight(element, "isWritter");
		});

		[
			{right : _.get(myVars.darajas, "SIMPLE")},
			{right : undefined},
			{right : "toto"},
		].forEach(function(element){
			describe("bad right", function() {
				helper.badRight(element, "isWritter");
			});
		});

	});

	describe("isGod", function() {
		[
			{right : _.get(myVars.darajas, "HIGHT")},
		].forEach(function(element){
			helper.goodRight(element, "isGod");
		});

		[
			{right : _.get(myVars.darajas, "SIMPLE")},
			{right : _.get(myVars.darajas, "MIDDLE")},
			{right : undefined},
			{right : "toto"},
		].forEach(function(element){
			helper.badRight(element, "isGod");
		});

	});

});
