"use strict";
const mailer = require("nodemailer");
const smtpTransport = mailer.createTransport("smtps://lespublicationdegrace%40gmail.com:mamadou170889@smtp.gmail.com");

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
	var theMail = fillMail(to, subject, text);
	return new Promise(function (resolve, reject) {
		smtpTransport.sendMail(theMail, function (error) {
			if (error) {
				smtpTransport.close();
				return reject();
			} else {
				smtpTransport.close();
				return resolve();
			}
		});
	});
}
exports.emailSender = emailSender;
