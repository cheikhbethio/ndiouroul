var db_poeme = require('../model/poeme.js');
var job = require('../config/jobs.js');
var mayVar = require('../config/variables.js');
var serviceRoute = "/poeme";
var apiRoute = mayVar.routes.API + serviceRoute;

module.exports = function (app) {
	// app.all('/api/poeme/*', job.isLoggedIn)

	app.post(apiRoute, job.isWritter, db_poeme.create);
	app.delete(apiRoute + '/:id', job.isWritter, db_poeme.delete);
	app.put(apiRoute + '/:id', job.isWritter, db_poeme.edit);

	app.get(apiRoute, db_poeme.view);
	app.get(apiRoute + '/:id', db_poeme.get);
	app.get('/api/last/lastPoeme', db_poeme.getLastPoemes);
	app.get('/api/forpoem/bylabel', db_poeme.getByLabel);
};
