"use strict";

// require("should");
const chai = require("chai");
chai.should();
const metiers = require("../../services/metiers.js");

describe("test des fonctions métier", function () {
	describe("isValidModel : validation of model users", function () {
		beforeEach(() =>{
			this.instance = {
				nom : "nom",
				prenom : "prenom",
				adresse : {
					ville : "Bordeaux",
					pays : "France"
				}
			};
			this.schemaValidator = {
				type : "object",
				properties : {
					nom : {type : "string", required :  true},
					prenom : {type : "string",required :  true},
					adresse : {
						type : "object",
						properties : {
							ville : {type : "string"},
							pays : {type : "string"}
						}
					}
				},
				additionalProperties: false
			};
		});
		it("t1 : must validate a good model ", () => {
			let resultOfValidation  = metiers.isValidModel(this.instance, this.schemaValidator);
			resultOfValidation.valid.should.equal(true);
		});
		it("t2 : missing properties nom", () => {
			delete this.instance.nom;
			let resultOfValidation  = metiers.isValidModel(this.instance, this.schemaValidator);
			resultOfValidation.valid.should.equal(false);
		});
		it("t3 : missing properties prenom", () => {
			delete this.instance.prenom;
			let resultOfValidation  = metiers.isValidModel(this.instance, this.schemaValidator);
			resultOfValidation.valid.should.equal(false);
		});
		it("t4 : bad  -> additionalProperties", () =>{
			this.instance.addedProperties =  "toto";
			let resultOfValidation  = metiers.isValidModel(this.instance, this.schemaValidator);
			resultOfValidation.valid.should.equal(false);
		});
	});
});
