var db_comment = require('../model/comment.js');
var job = require('../config/jobs.js');
var mayVar = require('../config/variables.js');
var serviceRoute = "/comment";
var apiRoute = mayVar.routes.API + serviceRoute;

module.exports = function (app) {

	app.post(apiRoute, job.isLoggedIn, db_comment.create);
	app.delete(apiRoute + '/:id', job.isWritter, db_comment.delete);
	app.get(apiRoute, db_comment.getAll);
	app.get(apiRoute + '/:id', db_comment.get);
	app.put(apiRoute + '/:id', job.isLoggedIn, db_comment.edit);

	app.get('/api/forComment/lastComment', db_comment.getLast);
	app.get('/api/forComment/bylabel', db_comment.getByLabel);
};
