"use strict";
const poemServices = require("./services");

module.exports = function (app) {
	app.post("/api/writer/poem", poemServices.create);
	app.get("/api/public/poem/:id", poemServices.get);
	app.get("/api/public/poem/", poemServices.getAll);
	app.get("/api/public/last/poem", poemServices.getLastPoemes);
	app.get("/api/public/bylabel/poem", poemServices.getByLabel);

  //
	// app.post(apiRoute, job.isWritter, db_poeme.create);
	// app.delete(apiRoute + '/:id', job.isWritter, db_poeme.delete);
	// app.put(apiRoute + '/:id', job.isWritter, db_poeme.edit);
  //
	// app.get(apiRoute, db_poeme.view);
	// app.get(apiRoute + '/:id', db_poeme.get);
	// app.get('/api/last/lastPoeme', db_poeme.getLastPoemes);
	// app.get('/api/forpoem/bylabel', db_poeme.getByLabel);


};
