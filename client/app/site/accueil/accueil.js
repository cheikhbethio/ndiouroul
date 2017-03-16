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
	.controller('accueilController', ['_', 'LastPoemes','CurrentUser', '$rootScope', '$scope', '$state', 'Poeme', 'myModal',
		function(_, LastPoemes, CurrentUser, $rootScope, $scope, $state, Poeme, myModal){

		$rootScope.confVariable.titre = "Thiantakones";
		$rootScope.confVariable.isConnected =  CurrentUser.isLoggedIn();
		$scope.slides = [];
		$scope.anim = [];

		$scope.runAnim = runAnim;
		$scope.rubrique = rubrique;
		$scope.stopAnim = stopAnim;
		$scope.viewPoem = viewPoem;

		function viewPoem(width, poemeId) {
			Poeme.get({id: poemeId}, function (res) {
				var poemToDisplay = res.result;
				var poemModal = myModal.viewPoem('app/manager/poemes/modals/poemeVue.html', 'lg', poemToDisplay);
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

		LastPoemes.query(function (list) {
			$scope.lastPoeme = list;
			var i = 0;
			_.each(list, function(elem){
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

		// $scope.addSlide = addSlide;
		// $scope.goToPoeme = goToPoeme;
		// function goToPoeme(poem) {
		// 	$scope.poemToDisplay = poem;
		// }

	}]);
