'use strict';

var _ = require('underscore');
var db_user = require('../model/user.js');
var connectionModel = require('../model/connection.js');

module.exports = function (app, passport) {

	app.get('/api/session', connectionModel.sessionMiddleware);

	app.get('/api/validation/signUp/:id', db_user.getKeyValidation); //done

	app.get('/api/logout', connectionModel.loginMiddleware);

	app.post("/api/login",  passport.authenticate('local-login'), connectionModel.loginMiddleware);

	app.post("/api/passwordRegenerate", connectionModel.updatePassWord);
};
