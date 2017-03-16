'use strict';


angular.module('management', ['ui.router', 'ngAnimate', 'ui.bootstrap'])

	.controller('manBodyController', ['$scope', '$state', '$stateParams', '$rootScope', 'CurrentUser',
	function ($scope, $state, $stateParams, $rootScope, CurrentUser) {
			$rootScope.confVariable.titreGestion = "différentes fonctionnalités";
			$scope.menuOpen = false;
			$scope.snapOpts = {
				disable: 'right'
			};
			$scope.rightToDo = CurrentUser.getRight() === 3;

}]);
