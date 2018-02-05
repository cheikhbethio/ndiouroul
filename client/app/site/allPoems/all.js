(function () {
	'use strict';

	angular.module('allPoems', ['ui.router'])
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider
				.state('site.allPoems', {
					url: '/allPoems',
					templateUrl: 'app/site/rubrique/rubrique.html',
					controller: 'allPoemsController'
				})
      }])
		.controller('allPoemsController', allPoemsController);

	allPoemsController.$inject = ["$scope", "Poeme", "myModal"];

	function allPoemsController($scope, Poeme, myModal) {
		$scope.viewPoem = viewPoem;
		function viewPoem(width, poemeId) {
			Poeme.get(poemeId)
				.then(function(res) {
					$scope.poemToDisplay = res.result;
					var poemModal = myModal.viewPoem('app/manager/poemes/modals/poemeVue.html', 'lg', $scope.poemToDisplay);
				});
		}

		Poeme.getAll()
		 	.then(function(res) {
				$scope.poemlist = res;
			});
	}

})()
