const connectionServices = require("./connectionServices");

module.exports = function (app) {

	app.post("/api/passwordRegenerate", connectionServices.updatePassWord);
	app.post("/api/login",  connectionServices.authenticate, connectionServices.loginMiddleware);
	app.get("/api/logout", connectionServices.logoutMiddleware);
	app.get("/api/session", connectionServices.sessionMiddleware);

};
