"use strict";

const mongoose = require('mongoose');
const user = require('./user.js');
const _ = require("underscore");


const schema = mongoose.Schema;
const poemSchema = schema({
	title: String,
	content: String,
	from: String,
	id_auteur: { type: schema.Types.ObjectId, ref: "users" },
	denounced: Boolean,
	isPublic: Boolean,
	date: Date,
	updateAt: Date,
	histo: Boolean,
	rubric: String,
	tof: String
});


// create the model for users and expose it to our app
var poemDbAccess = mongoose.model("poem", poemSchema);

function create (req, res) {
	var params = req.body;
	var newPoeme = new db();

	newPoeme.title = params.title,
		newPoeme.content = params.content,
		newPoeme.from = params.from,
		newPoeme.rubric = params.rubric,
		newPoeme.id_auteur = params.id_auteur,
		newPoeme.tof = params.tof;

		newPoeme.denounced = false,
		newPoeme.date = Date.now(),
		newPoeme.isPublic = params.isPublic ? params.isPublic : false,
		newPoeme.updateAt = undefined;
	newPoeme.histo = false;

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
