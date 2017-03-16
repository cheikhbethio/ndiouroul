'use strict';

var mongoose = require('mongoose');
var user = require('./user.js');
var poeme = require('./poeme.js');
var Schema = mongoose.Schema;
var _ = require("underscore");


var CommentaireSchema = new mongoose.Schema({
	id_author : {type : Schema.Types.ObjectId, ref:'user'},
	id_poeme : {type : Schema.Types.ObjectId, ref:'poeme'},
	date : Date,
	content : String,
	denounced : Boolean,
});

var db = mongoose.model('Commentaire',CommentaireSchema);
//-------------------------------------------------------------------
var userDb = user.dbAccess;


//-------------------------------------------------------------------
exports.commentaire = db;

exports.create = function(req,res,next){

	var commentaireObj = {
		id_author: req.body.id_author, 
		id_poeme: req.body.id_poeme,
		date: Date.now(),
		content:req.body.content,
		denounced : false,
	};

	if (!commentaireObj.id_author || !commentaireObj.id_poeme || !commentaireObj.content){
		return res.send({message: "Les parametres sont incorrects", code: 1});
	}

	userDb.findById(commentaireObj.id_author, function (err, userfound) {
		if (!err && userfound){
			var model = new db(commentaireObj);
			model.save(function(err,doc){
		        if(err || !doc){
					res.send({message: err, code: 1});
		        }else{
					res.send({message: "Le commentaire est bien enregistré", code: 0, result: doc});
		        }
			});
		}else {	
			res.send({message: "Impossible de sauver ce doc", code: 4});
		}
	});       
};


exports.edit = function (req, res, next) {

	var id = req.params.id,
			params = req.body;

	if (!params.id_author || !params.id_poeme){
		return res.send({message: "Les parametres sont incorrects", code: 1});
	}

	db.findById(id, function (err, commentFound) {
		if (err){
			res.send({message: "(Probleme serveur).", code: 2});
		} else if (!commentFound) {
			res.send({message: "La Mise à jour impossible de ce doc a échoué.", code: 1});
		} else {
			//à voir apres
			var obj = {
				'denounced': params.denounced
			};

			fillParam(commentFound, obj);
			commentFound.save(function (err, doc) {
				if (err) {res.send(err)} 
				else if (!doc) {
					res.send({message: "La Mise à jour impossible de ce doc a échoué :(Probleme serveur).", code: 1});
				} else {
					res.send({message: "Le doc a bien mis à jour.", code: 0, result: doc});
				}
			});

		}
	});
};


//by poeme
exports.get = function(req,res,next){   
	db.find({_id : req.params.id})
		.populate('id_author', 'local.lastname local.firstname')
		.populate('id_poeme', 'title')
		.exec(function(err,result){
		   	if(err){
				return res.send({message: "Server Error", code: 2});
	    	}
	    	if(!result.length){
				return res.send({message: "document introuvable", code: 1});
	    	}
			return res.send({message: "requête réusie", code: 0, result: result});
		});
}

//allComments
exports.getAll = function(req,res,next){   
	db.find()
		.populate('id_author', 'local.lastname local.firstname')
		.populate('id_poeme', 'title')
		.exec(function(err,result){
		   	if(err){
				res.send([{message: "Error Server", code: 2}]);
	    	}
		   	else if(!result.length){
				res.send([{message: "document introuvable", code: 1}]);
	    	}else {
				// res.send([{message: "requête réusie", code: 0 }, result]);
				res.json(result);
        	}
		});
}

exports.getNbcomment = function(req,res,next){   
	db.find({id_author : req.params.id} ,(function(err,result){
		   	if(err){
		       	return next(err);
	    	}else {
	    		console.log('this is our test comment acount .............. '+ result.length);
	        	var resultat =  result.length
	        	console.log(resultat);
	        	res.json({aaa : resultat});
	        }
		}));
}

exports.delete =function(req, res, next){
    db.findById(req.params.id, function(err,doc){
        if(err || !doc) {
			res.send({message: "la supression est actuellement impossible).", code: 1});
        }else{
        	res.send({message: "Le poeme a bien été suprimé", code: 0, result: doc.remove()});
        }
    });
};  

exports.getLast = function(req,res,next){
	db.find({$query:{} ,$orderby:{date: -1}})
		.populate('id_author', 'local.lastname local.firstname')
		.populate('id_poeme', 'title')
	      .populate('poeme').limit(10).exec(function(err,doc){
	      	   if(err || !doc){
	      	   		res.send({message: "les docs sont introvables ou inexistants", code: 1});
        		} else {
	      	  		res.send({message: "requete reussie", code: 0, result: doc});
       			}
	      });
};  

//recherche par rubric
exports.getByLabel = function (req, res, next) {
	var keyObj = req.param('key') ,
		valueObj = req.param('value');
	var query = {};
	query[keyObj] = valueObj;

	if(_.indexOf(labelList, keyObj)<0){
		res.send({message: "ce document est introuvable", code: 1});
	}else{
		db.find(query)
			.populate('id_author', 'local.lastname local.firstname')
			.populate('id_poeme', 'title')
				.exec(function (err, doc) {
				if (err){
					res.send({message: "Ereur interne du serveur", code: 2});
				} else if (!doc.length) {
					res.send({message: "ces documents sont introuvables", code: 1});} 
				else {
					res.send({message: "ok", code: 0, result: doc});
				}
		});
	}
};



/********************************************************
 * functions Metier
 */

function fillParam(objTo, objFrom) {
	_.each(objFrom, function (value, key) {
		if (value || key === 'denounced') {
			objTo[key] = value;
		} 
	});
}

var labelList = ['id_author', 'denounced', 'id_poeme'];
