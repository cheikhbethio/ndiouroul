"use strict";

(function(){

angular.module('registration', ['ui.router'])
		.config(['$stateProvider', function ($stateProvider) {
				$stateProvider
						.state('site.registration', {
							url: '/registration?validation',
							templateUrl: 'app/site/sign/registration.html',
							controller: 'registrationController'
						});
			}])
		.controller('registrationController', ['$stateParams', '$rootScope', '$scope', '$state',
			'connectionFactory',
			function ($stateParams, $rootScope, $scope, $state, connectionFactory) {

				$scope.newUser = {};
				$scope.info = {};
				$scope.registrationForm= {};
				$scope.info.showMessage = false;
				$scope.showValidation = false;
				$rootScope.titre = "Thiantakones";

				$scope.saveNewUser = saveNewUser;
				$scope.resetRegistrationForm = resetRegistrationForm;

				if ($stateParams.validation) {
					$scope.showValidation = true;
					connectionFactory.signUpValidation($stateParams.validation);
				}


				function saveNewUser(newer) {
					var message;
						if (newer.password === newer.passwordConfirmation) {
							return connectionFactory.signUp(newer)
								.then(function (resp) {
									if (resp.code === 201) {
										$scope.info.message = resp.message;
										$state.go('site.connexion', {registration: true});
									} else {
										fillInfo(resp.message, "danger", true);
									}
								})
								.catch(function (error) {
										message : "un probleme s'est produit. L'enregistrement est temporairement impossible";
										fillInfo(message, "danger", true);
									});
						}
						message : "les deux mots de passe ne sont pas identiques. Veillez réessayer!!",
						fillInfo(message, "danger", true);
				}

				function resetRegistrationForm() {
					$scope.newUser = {};
				}

				function fillInfo(message, type, showMessage){
					$scope.info = {
						message : message,
						type : type,
						showMessage : showMessage
					};
				}

			}]);
})();
