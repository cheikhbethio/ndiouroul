const userServices = require("./services");

module.exports = function (app) {
	// app.post(apiRoute, db_user.create);
	// app.delete(apiRoute + "/:id", job.isGod, db_user.delete);
	// app.get(apiRoute, db_user.view);
	// app.get(apiRoute + "/:id", db_user.get);
	// app.put(apiRoute + "/:id", job.isGod, db_user.edit);
	// app.put("/api/profile/:id", db_user.editProfile);

	app.post("/api/public/user", userServices.createUser);
	app.patch("/api/public/user/:id", userServices.updateUser);
	app.get("/api/public/user/:id", userServices.findUser);
	app.delete("/api/admin/user/:id", userServices.deleteUser);

};
