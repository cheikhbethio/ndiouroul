"use strict";

const userServices = require("./services");

module.exports = function (app) {
	app.post("/api/public/user", userServices.createUser);
	app.get("/api/public/user/validation", userServices.getKeyValidation);
	app.put("/api/member/user/:id", userServices.updateUser);
	app.get("/api/member/user/:id", userServices.findUser);
	app.get("/api/admin/user", userServices.getAll);
	app.delete("/api/admin/user/:id", userServices.deleteUser);
};
