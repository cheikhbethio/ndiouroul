"use strict";

var status = {
	watingClicEmail: { code: 1442, msg: "Verification email" },
	watingValidation: { code: 191, msg: "En attente de Validation" },
	active: { code: 451, msg: "Actif" },
	removed: { code: 660, msg: "Suppimé" }
};

var myUrl = {
	princiaplURL: "http://137.74.172.146:8000/#/",
	emailValidation: "registration?validation="
};

var routes = {
	API: "/api",
	APIWRT: "/api/writter",
	APIMAN: "/api/manange"
};

var darajas = {
	SIMPLE: "salsa",
	MIDDLE: "salsaBat",
	HIGHT: "salsaBatKiz"
};

var session = {
	session_duration: 10000000000
};

var forMail = {
	admin: "lespublicationdegrace@gmail.com",
	signUp: {
		subject: "PDG - Votre inscription sur les publications de Grâce",
		text: "Pour valider votre inscription veillez cliquez sur ce lien : ",
		popupMsg: "un email de vailidation vient de vous être envoyé. Veillez consulter votre messagerie pour activer votre compte"
	},
	signUpValidation: {
		subject: "PDG - Nouvelle inscription à Valider dans 48h",
		text: "Un nouveau compte vient d'être créé et est en attende de validation. T'as 48h sinon c'est la merde. bilahi"
	},
	poemeCreation: {
		subject: "PDG - Confirmation de rédaction",
		text: "Votre derniere rédaction a bien été prise en compte et est attente de validation par nos équipes"
	},
	poemeValidation: {
		subject: "PDG - Validation nouveau Poême",
		text: "Un nouveau poême vient d'être créé et est en attende de validation",
		to: "mmoussasow@gmail.com"
	},
	regeneratePassword : {
		subject: "PDG - Nouveau mot de passe",
		text: "Vous avez demandé un nouveau mot de passe. Nous vous envoyons celui là. Vous pouvez le changer dans votre profil apres connexion. \n Nouveau mot de passe : "
	}
};

var myMsg = {
	error: {
		mailSendind: "Erreur lors de l'envoye du mail"
	},
	success: {
		mailSendind: "Mail envoyé avec succès!"
	}
};

const successMessage = "Succes de l'operation";
const failureMessage = "Echec de l'operation";
const existenceMessage  = "Ce document existe déjà";
const invalidSchema = "json-schema invalid";
const httpMessage = {
	response : {
		success : {
			successMessage,
			existenceMessage
		},
		failure : {
			failureMessage,
			invalidSchema
		}
	}
};

module.exports = {
	httpMessage,
	status,
	myUrl,
	session,
	darajas,
	routes,
	myMsg,
	forMail
};
