'use strict';


angular.module('accueil', ['ui.router', 'angular-carousel', 'underscore'])
	.config(['$stateProvider', function($stateProvider){
		$stateProvider
			.state('site.accueil', {
				url :'/',
        css : 'assets/css/body/content.css',
				templateUrl : 'app/site/accueil/accueil.html',
				controller	: 'accueilController'
			})
	}])
	.controller('accueilController', ['_', 'CurrentUser', '$rootScope', '$scope', '$state', 'Poeme', 'myModal',
		function(_, CurrentUser, $rootScope, $scope, $state, Poeme, myModal){

		$rootScope.confVariable.titre = "Thiantakones";
		$rootScope.confVariable.isConnected =  CurrentUser.isLoggedIn();
		$scope.slides = [];
		$scope.anim = [];

		$scope.runAnim = runAnim;
		$scope.rubrique = rubrique;
		$scope.stopAnim = stopAnim;
		$scope.viewPoem = viewPoem;

		function viewPoem(width, poemeId) {
			Poeme.get(poemeId)
				.then(function(res){
					var poemToDisplay = res.result;
					myModal.viewPoem('app/manager/poemes/modals/poemeVue.html', 'lg', poemToDisplay);
				});

		}

		function runAnim(elem){
			$scope.anim[elem] = true;
		}

		function stopAnim(elem){
			$scope.anim[elem] = false;
		}

		function rubrique(id){
			$state.go("site.rubrique", {id:id});
		}

		Poeme.lastPoemes()
			.then(function(res) {
				$scope.lastPoeme = res;
				var i = 0;
				_.each(res, function(elem){
					var imgObjet = {
						_id: elem._id,
						// label: 'slide #' + i,
						img: elem.tof,
						odd: (i % 2 === 0),
						title : elem.title,
						lastname: elem.id_auteur.local.lastname,
						firstname : elem.id_auteur.local.firstname
					};
					$scope.slides.push(imgObjet);
				});
			});

	}]);
