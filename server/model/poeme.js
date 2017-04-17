/***
 * requis :  titre  contenue  publication
 */
var mongoose = require('mongoose');
var user = require('./user.js');
var _ = require("underscore");

var schema = mongoose.Schema;
//
var poemeSchema = mongoose.Schema({
	title: String,
	content: String,
	from: String,
	id_auteur: { type: schema.Types.ObjectId, ref: 'user' },
	denounced: Boolean,
	isPublic: Boolean,
	date: Date,
	updateAt: Date,
	histo: Boolean,
	rubric: String,
	tof: String
});


// create the model for users and expose it to our app
var db = mongoose.model('poeme', poemeSchema);
module.exports.poeme = db;

//
exports.create = function (req, res, next) {
	var params = req.body;
	var newPoeme = new db();

	newPoeme.title = params.title,
		newPoeme.content = params.content,
		newPoeme.from = params.from,
		newPoeme.rubric = params.rubric,
		newPoeme.id_auteur = params.id_auteur,
		newPoeme.denounced = false,
		newPoeme.date = Date.now(),
		newPoeme.isPublic = params.isPublic ? params.isPublic : false,
		newPoeme.updateAt = undefined;
	newPoeme.histo = false;
	newPoeme.tof = params.tof;

	if(!newPoeme.title || !newPoeme.content || !newPoeme.rubric || !newPoeme.tof) {
		return res.send({ message: "Les parametres sont incorrects", code: 1 });
	}

	newPoeme.save(function (err, doc) {
		if(err || !doc) {
			res.send({ message: err, code: 1 });
		} else {
			res.send({ message: "Le poeme a bien été créer.", code: 0, result: doc });
		}
	});
};

exports.view = function (req, res, next) {
	db.find({ $query: {}, $orderby: { date: -1 } }).populate('id_auteur',
		'local.lastname local.firstname').exec(function (err, doc) {
		if(err || !doc) {
			res.send([{ message: "Les poemes sont introuvables.", code: 1 }]);
		} else {
			res.json(doc);
		}
	});
};

//un doc par son id avec populate sur l'auteur
exports.get = function (req, res, next) {
	db.findById(req.params.id).populate('id_auteur', 'local.lastname local.firstname')
		.exec(function (err, poeme) {
			if(err || !poeme) {
				res.send({ message: "Le poeme est introuvables.", code: 1 });
			} else {
				res.send({ message: "ok", code: 0, result: poeme });
			}
		});
};

//les 10 derniers doc avec populate sur l'auteur
exports.getLastPoemes = function (req, res, next) {
	db.find({ $query: {}, $orderby: { date: -1 } }).populate('id_auteur',
		'local.lastname local.firstname').limit(10).exec(function (err, doc) {
		if(err || !doc) {
			res.send([{ message: "Les poemes sont introuvables.", code: 1 }]);
		} else {
			res.json(doc);
		}
	});
};

exports.getByLabel = function (req, res, next) {
	var keyObj = req.param('key'),
		valueObj = req.param('valu');
	var query = {};
	query[req.param('key')] = req.param('valu');
	if(_.indexOf(labelList, keyObj) < 0) {
		res.send({ message: "ce document est introuvable", code: 1 });
	} else {
		db.find(query).populate('id_auteur', 'local.lastname local.firstname')
			.exec(function (err, doc) {
				if(err || doc.length < 1) {
					res.send({ message: "ce document est introuvable", code: 1 });
				} else {
					res.send({ message: "ok", code: 0, result: doc });
				}
			});
	}


};

exports.delete = function (req, res, next) {
	var id = req.params.id;
	db.findById(id, function (err, doc) {
		if(err || !doc) {
			res.send({ message: "la supression est actuellement impossible (Probleme serveur).", code: 1 });
		} else {
			var res_deletion = doc.remove();
			res.send({ message: "Le poeme a bien été suprimé", code: 0, result: res_deletion });
		}
	});

};

exports.edit = function (req, res, next) {

	var id = req.params.id,
		params = req.body;

	if(!params.title || !params.content || !params.rubric || !params.title || !params.tof) {
		return res.send({ message: "Les parametres sont incorrects", code: 1 });
	}

	db.findById(id, function (err, poemeFound) {
		if(err || !poemeFound) {
			res.send({
				message: "La Mise à jour impossible de ce poeme a échoué :(Probleme serveur).",
				code: 1
			});
		} else {
			//à voir apres
			var obj = {
				'title': params.title,
				'content': params.content,
				'from': params.from,
				'denounced': params.denounced,
				'isPublic': params.isPublic,
				'updateAt': Date.now(),
				'histo': params.histo,
				'rubric': params.rubric,
				'tof': params.tof
			};

			fillParam(poemeFound, obj);
			poemeFound.save(function (err, doc) {
				if(err || !doc) {
					res.send({
						message: "La Mise à jour impossible de ce poeme a échoué :(Probleme serveur).",
						code: 1
					});
				} else {
					res.send({ message: "Le poeme a bien mis à jour.", code: 0, result: doc });
				}
			});

		}
	});
};


/********************************************************
 * functions Metier
 */
function fillParam(objTo, objFrom) {
	_.each(objFrom, function (value, key) {
		if(value || key === 'isPublic' || key === 'denounced') {
			objTo[key] = value;
		}
	});
}

var labelList = ['id_auteur', 'denounced', 'isPublic', 'histo', 'rubric', 'tof'];
