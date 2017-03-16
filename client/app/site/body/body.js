'use strict';

angular.module('siteBody', [])
	.controller('siteBodyController', ['$scope', 'CurrentUser', '$state', '$rootScope',
			function ($scope, CurrentUser, $state, $rootScope) {

			$scope.cookieUser = CurrentUser.getUser();

			$scope.toDisconnect = function () {
				CurrentUser.clear();
				$state.go("site.connexion", { disconnected: true });
				$rootScope.confVariable.isConnected = false;
			};

			$rootScope.confVariable.isConnected = CurrentUser.isLoggedIn();
			$rootScope.confVariable.forManagement = CurrentUser.getRight() > 2;
			}]);
