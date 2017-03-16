'use strict';
angular.module('registration', ['ui.router'])
		.config(['$stateProvider', function ($stateProvider) {
				$stateProvider
						.state('site.registration', {
							url: '/registration?validation',
							templateUrl: 'app/site/sign/registration.html',
							controller: 'registrationController'
						});
			}])
		.controller('registrationController', ['$stateParams', '$rootScope', '$scope', '$state', 'SignUp', "Validation",
			function ($stateParams, $rootScope, $scope, $state, SignUp, Validation) {

				$rootScope.titre = "Thiantakones";
				$scope.newUser = {};
				$scope.showValidation = false;
				$scope.registrationForm={};
				$scope.validation = $stateParams.validation;
				if ($scope.validation) {
					$scope.showValidation = true;
					Validation.getToken({id: $scope.validation}, function (res) {
					});
				}

				$scope.info = {};
				$scope.info.showMessage = false;
				$scope.saveNewUser = function (newer) {
						if (newer.password === newer.passwordConfirmation) {
							SignUp.save(newer, function (resp) {
								if (resp.code === 0) {
									$scope.info.message = resp.message;
									$state.go('site.connexion', {registration: true});
								} else {
									$scope.info.message = resp.message;
									$scope.info.type = 'danger';
									$scope.info.showMessage = true;
								}
							}, function (error) {
								$scope.info.message = "un probleme s'est produit. L'enregistrement est temporairement impossible";
								$scope.info.type = 'danger';
								$scope.info.showMessage = true;
							});
						} else {
							$scope.info.message = "les deux mots de passe ne sont pas identiques. Veillez réessayer!!";
							$scope.info.showMessage = true;
							$scope.info.type = 'danger';
						}
					
				};
				$scope.resetRegistrationForm = function () {
					$scope.newUser = {};
				};
			}]);