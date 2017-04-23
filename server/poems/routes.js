"use strict";
const poemServices = require("./services");

module.exports = function (app) {
	app.post("/api/writer/poem", poemServices.create);
	app.get("/api/public/poem/:id", poemServices.get);
	app.get("/api/public/poem/", poemServices.getAll);
	app.delete("/api/writer/poem/:id", poemServices.deletePoem);
	app.patch("/api/writer/poem/:id", poemServices.edit);

	app.get("/api/public/last/poem", poemServices.getLastPoemes);
	app.get("/api/public/bylabel/poem", poemServices.getByLabel);
};
