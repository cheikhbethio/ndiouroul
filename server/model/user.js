/* global Promise */
"use strict";

// load the things we need
var mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var _ = require("underscore");
var myVar = require("../config/variables.js");
var theMailer = require("../config/jobsMailer.js");

var userProperties = ["email", "password", "firstname", "lastname", "login", "right", "idPic",
	"phone", "status", "hashkey"];

var userSchema = mongoose.Schema({
	local: {
		email: String,
		password: String,
		firstname: String,
		lastname: String,
		login: String,
		right: String,
		idPic: String,
		phone: String,
		status: Object,
		hashkey: String,
		created_at: Date
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	}
});

// generating a hash
userSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
var db = mongoose.model('user', userSchema);
module.exports.user = db;

exports.dbAccess = db;

exports.create = function (req, res, next) {
	var params = req.body;
	var newUser = new db();
	newUser.local.email = params.email;
	newUser.local.firstname = params.firstname;
	newUser.local.lastname = params.lastname;
	newUser.local.login = params.login;

	newUser.local.password = bcrypt.hashSync(params.password, bcrypt.genSaltSync(8), null);
	newUser.local.right = myVar.darajas.SIMPLE;
	newUser.local.date = Date.now();
	newUser.local.status = myVar.status.watingClicEmail;
	newUser.local.idPic = "";
	newUser.local.phone = "";

	db.findOne({ 'local.email': params.email }, function (err, user) {
		if(err)
			next(err);
		else {
			if(user) {
				// console.log("*******************: ", user);
				res.send({ message: "email is already used!", code: 1 });
				return next();
			}

			db.findOne({ 'local.login': params.login }, function (errLogin, userLogin) {
				if(errLogin) {
					next(errLogin);
				} else {
					if(userLogin) {
						console.log("login is already used!");
						res.send({ message: "login is already used!", code: 2 });
						return next();
					}
					var hashed = bcrypt.hashSync(newUser.local.email + newUser.local.firstname + newUser.local
						.lastname, bcrypt.genSaltSync(8), null) + "end";
					newUser.local.hashkey = hashed;
					newUser.local.created_at = new Date();
					newUser.save(function (err, results) {
						if(err) {
							res.send({ message: err });
						} else {
							console.log("#### signup succes!!");
							var textSent = myVar.forMail.signUp.text + myVar.myUrl.princiaplURL + myVar.myUrl.emailValidation +
								hashed;
							theMailer.emailSender(params.email, myVar.forMail.signUp.subject, textSent)
								.then(function () {
									res.send({ message: myVar.forMail.signUp.popupMsg, code: 0, result: results });
								});
						}
					});
				}
			});
		}
	});
};

exports.view = function (req, res, next) {
	db.find().exec(function (err, results) {
		if(!err) {
			return res.send(results);
		} else {
			console.log(err);
			next(err);
		}
	});
};

exports.get = function (req, res) {
	var id = req.params.id;
	db.findById(id, function (err, user) {
		if(err || !user) {
			res.send({ message: "Le poeme est introuvables.", code: 1 });
		} else {
			var pwdDeleter = new Promise(function (resolve, reject) {
				user.local.password = "";
				return resolve();
			});
			pwdDeleter.then(function () {
				res.send(user);
			})
		}
	});
};

exports.getKeyValidation = function (req, res) {
	db.findOne({ 'local.hashkey': req.params.id }, function (err, user) {
		if(err || !user) {
			console.log(err);
			res.send({
				message: "Désolé mais ce compte est invalide. Veillez vous réinscrire et faire la valivation dans les plus bref délais.",
				code: 1
			});
		} else {
			toEdit(user._id, { status: myVar.status.watingValidation });
			theMailer.emailSender(myVar.forMail.admin, myVar.forMail.signUpValidation.subject, myVar.forMail
				.signUpValidation.text);
			res.send({
				message: "Votre inscription a bien été pris en compte et sera validée par nos équipes dans les plus brefs délais. Merci et à très bientôt",
				code: 0
			});
		}
	});
};

exports.delete = function (req, res, next) {
	var id = req.params.id;
	db.findById(id, function (err, doc) {
		if(err || !doc) {
			res.send({
				message: "Suppression impossible : utilissateur introuvable ou probleme server",
				code: 1
			});
		} else {
			res.send({ message: "Le doc a bien été suprimé", code: 0, result: doc.remove() });
		}
	});

};

exports.editProfile = function (req, res) {
	var id = req.params.id;
	var params = req.body;
	var tabProm = [];

	console.log("pram ", req.params.id, "body :", req.body);
	//check user par _id : first elem of tab
	tabProm.push(simpleRecherche("_id", id));
	//check if email exit in db : second elem
	tabProm.push(simpleRecherche('local.email', params.email));

	Promise.all(tabProm).then((values) => {
			var rep = {};
			if(values[0].code !== 0 || values[0].result.local.login !== params.login) {
				rep.message = "not_connected";
				rep.code = 3;
				return res.send(rep);
			}
			//update email
			if(values[0].result.local.email !== params.email && values[1].code === 0) {
				console.log("email is already");
				return res.send({ code: 2, message: "email_is_already_use" });
			}

			// if (values[0].code === 0 && values[0].result.local.login === params.login){
			var isLogged = bcrypt.compareSync(params.password, values[0].result.local.password);
			if(isLogged) {
				//updatepwd
				if(params.newPassword) {
					params.password = bcrypt.hashSync(params.newPassword, bcrypt.genSaltSync(8), null);
				} else {
					delete params.password;
				}

				//do edition
				return toEdit(id, _.pick(params, "email", "firstname", "idPic",
						"lastname", "login", "password", "phone"))
					.then(function (response) {
						return res.send(response)
					})
					.catch(function (error) {
						return res.send(error)
					});
			}else {
				return res.send({ message: "not_connected : ", code: 3 });
			}
		})
		.catch((error) => {
			return res.send({ message: "not_connected : ", code: 3 });
		});
}

exports.edit = function (req, res, next) {
	var id = req.body._id;
	var params = req.body.local;

	toEdit(id, params)
		.then(function (response) {
			res.send(response)
		})
		.catch(function (error) {
			res.send(error)
		});
};

function fillParam(objTo, objFrom) {
	_.each(objFrom, function (value, key) {
		if(userProperties.indexOf(key) >= 0) {
			objTo[key] = value;
		}
	});
}

function simpleRecherche(key, value) {
	var query = {};
	query[key] = value;
	return new Promise(function (resolve, reject) {
		db.findOne(query, function (err, user) {
			if(err) {
				return reject({ message: "Le doc recherché est introuvable.", code: 1 });
			}
			if(!user) {
				return resolve({ message: "Le doc recherché est introuvable.", code: 1, result: user });
			}
			return resolve({ message: "Le doc a bien été retrouvé.", code: 0, result: user });
		});
	});
}

var toEdit = function (id, params) {
	return new Promise(function (resolve, reject) {
		db.findById(id, function (err, user) {
			if(err || !user) {
				return reject({ message: "le document est introuvable!!!", code: 2 });
			} else {
				fillParam(user.local, params);
				user.save(function (updateErr, updateResp) {
					if(updateErr) {
						console.log(updateErr);
						return reject({
							message: "La Mise à jour impossible de ce doc a échoué :(Probleme serveur).",
							code: 1
						});
					} else if(!updateResp) {
						return reject({
							message: "La Mise à jour impossible de ce doc a échoué :Introuvable.",
							code: 2
						});
					} else {
						return resolve({ message: "Le doc a bien mis à jour.", code: 0, result: updateResp });
					}
				});
			}
		});
	});
}

exports.toEdit = toEdit;
