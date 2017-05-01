"use strict";

const config = require("../config/database");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

process.env.NODE_ENV = "test";

beforeEach(function (done) {
	function clearDB() {
		for (var i in mongoose.connection.collections) {
			mongoose.connection.collections[i].remove();
		}
		return done();
	}

	function reconnect() {
		mongoose.connect(config.db.test, function (err) {
			if (err) {
				throw err;
			}
			return clearDB();
		});
	}

	function checkState() {
		mongoose.disconnect();
		switch (mongoose.connection.readyState) {
		case 0:
			reconnect();
			break;
		case 1:
			clearDB();
			break;
		default:
			process.nextTick(checkState);
		}
	}

	checkState();
});

afterEach(function (done) {
	for (var i in mongoose.connection.collections) {
		mongoose.connection.collections[i].remove();
	}
	mongoose.connection.removeAllListeners();
	mongoose.disconnect();
	return done();
});
