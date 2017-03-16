var job = require('../config/jobs.js');
var myVar = require('../config/variables.js');
var col = "/poeme";

var theMailer = require('../config/jobsMailer.js');


module.exports = function (app) {

	/***** Users ******/
	app.post('/api/test', testFuncion);
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

function testFuncion(req, res, next) {
	var params = req.body;
	theMailer.emailSender(params.email, myVar.forMail.signUp.subject, myVar.forMail.signUp.text)
			.then(function () {
				console.log("viennnnnnnnnnn");
				res.send({message: myVar.forMail.signUp.popupMsg, code: 0, result: results});
			});
	console.log("test is running : ", params);
	res.send({message: params});
}

