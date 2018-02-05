"use strict";

(function(){
	var connectionService = angular.module("connectionService");

	connectionService.factory("connectionFactory",
		["$rootScope", "$state", "CurrentUser", "$http",
		function($rootScope, $state, CurrentUser, $http) {
		var services = {
			signUp: signUp,
			signUpValidation : signUpValidation,
			connectionRedirection : connectionRedirection
		}
		return services;

		function signUp() {
			return $http.post("/api/public/user", body)
				.then(theFunction);
		}

		function signUpValidation(tokenValidation) {
			return $http.get("/api/public/user/validation?key=", + tokenValidation)
				.then(theFunction);
		}

		function connectionRedirection(){
			return {
				dashboard: function () {
					$rootScope.confVariable = {};
					$rootScope.confVariable.titre = "Thiantakones";

					$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
						var requireLogin = toState.data.requireLogin;
						var requireLoginDashboard = toState.data.requireLoginDashboard;
						var status = CurrentUser.getRight();
						var permitWriter = (requireLoginDashboard && status === 2 && toState.name !==
							"dashboard.createPoeme") || (requireLoginDashboard && status < 2);

						if(requireLogin && !CurrentUser.isLoggedIn()) {
							event.preventDefault();
							$state.go('site.connexion');
						} else if(permitWriter) {
							event.preventDefault();
							$state.go('site.accueil');
						}

					})
				}
			}
		}


		function theFunction(res) {
				return res.data;
		}

	}]);


})();
//
// angular.module('connectionService', ['ngResource'])
// 	.factory('SignUp', ['$resource', function ($resource) {
// 		return $resource('/api/users', {}, {})
// 			}])
// 	.factory('Login', ['$resource', function ($resource) {
// 		return $resource('/api/login', {}, {
// 			login: { method: 'POST', isArray: false }
// 		})
// 			}])
// 	.factory('PasseWordRegenerateService', ['$resource', function ($resource) {
// 		return $resource('/api/passwordRegenerate', {}, {
// 			regeneratePassWord: { method: 'POST', isArray: false }
// 		})
// 			}])
// 	.factory('Validation', ['$resource', function ($resource) {
// 		return $resource('/api/validation/signUp/:id', {}, {
// 			getToken: { method: 'GET' }
// 		})
// 			}])
// 	.factory('connectionRedirection', ["$rootScope", "$state", "CurrentUser", function ($rootScope,
// 		$state, CurrentUser) {
// 		return {
// 			dashboard: function () {
// 				$rootScope.confVariable = {};
// 				$rootScope.confVariable.titre = "Thiantakones";
//
// 				$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
// 					var requireLogin = toState.data.requireLogin;
// 					var requireLoginDashboard = toState.data.requireLoginDashboard;
// 					var status = CurrentUser.getRight();
// 					var permitWriter = (requireLoginDashboard && status === 2 && toState.name !==
// 						"dashboard.createPoeme") || (requireLoginDashboard && status < 2);
//
// 					if(requireLogin && !CurrentUser.isLoggedIn()) {
// 						event.preventDefault();
// 						$state.go('site.connexion');
// 					} else if(permitWriter) {
// 						event.preventDefault();
// 						$state.go('site.accueil');
// 					}
//
// 				})
// 			}
// 		}
// 	}]);
