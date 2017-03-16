'use strict';
var mailer = require("nodemailer");
var myVar = require("./variables");

//à voir apres
var smtpTransport11 = mailer.createTransport("SMTP", {
	service: "Gmail",
	auth: {
		user: "lespublicationdegrace@gmail.com",
		pass: "mamadou170889"
	}
});

var smtpTransport = mailer.createTransport('smtps://lespublicationdegrace%40gmail.com:mamadou170889@smtp.gmail.com');

var mail = {
	from: "lespublicationdegrace@gmail.com"
};

function fillMail(to, subject, text) {
	mail.to = to;
	mail.subject = subject;
	mail.html = text;
	return mail;
}

function emailSender(to, subject, text) {
	console.log("-----------------envoie---------------");
	var theMail = fillMail(to, subject, text)
	return new Promise(function (resolve, reject) {
		smtpTransport.sendMail(theMail, function (error, response) {
			if (error) {
				console.log(myVar.myMesg.error.mailSendind);
				console.log(error);
				smtpTransport.close();
				return reject();
			} else {
				console.log(myVar.myMesg.success.mailSendind);
				smtpTransport.close();
				return resolve();
			}
		});
	});
}
exports.emailSender = emailSender;
