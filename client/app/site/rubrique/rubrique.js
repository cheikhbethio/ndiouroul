(function () {
	'use strict';
	angular.module('rubrique', ['ui.router'])
			.config(['$stateProvider', function ($stateProvider) {
					$stateProvider
							.state('site.rubrique', {
								url: '/rubrique/:id',
								templateUrl: 'app/site/rubrique/rubrique.html',
								controller: 'rubriqueController'
							})
				}])
			.controller('rubriqueController', rubriqueController)
			.controller('viewPoemController', viewPoemController);



	viewPoemController.$inject = ['Poeme','CurrentUser', 'comment','$scope', '$uibModalInstance','poeme'];
	function viewPoemController(Poeme, CurrentUser, comment, $scope, $uibModalInstance, poeme) {
		$scope.poemToDisplay = poeme;
		$scope.addComment = addComment;
		$scope.newComment = {};
		$scope.info ={};
		$scope.commentList =[];
		$scope.tooltipInfo;
		$scope.showInputComment = false;
		$scope.isLoggedIn = CurrentUser.isLoggedIn();

		$scope.denounceComment = denounceComment;
		$scope.denouncePoem = denouncePoem;
		$scope.toggleComment = toggleComment;



		getComment();

		function denounceComment(commentDoc){
			commentDoc.denounced =!commentDoc.denounced;
			comment.update(commentDoc._id, commentDoc);
		}


		function denouncePoem(){
			$scope.poemToDisplay.denounced = !$scope.poemToDisplay.denounced;
			Poeme.update($scope.poemToDisplay._id, $scope.poemToDisplay);
		}

		function addComment(){
			$scope.newComment.id_poeme = poeme._id;
			$scope.newComment.id_author = CurrentUser.getId();
			comment.post($scope.newComment)
				.then(function(res) {
					$scope.info.message = res.message;
					$scope.info.showMessage = true;
					if (res.code === 0) {
						getComment();
						$scope.info.type = "success";
						$scope.info.showMessage = true;
					}else{
						$scope.info.type = "danger";
						$scope.info.showMessage = true;
					}
					$scope.newComment.content = "";
					$scope.showInputComment = false;
				})
		}

		function getComment(){
			comment.getCommentByLabel({key :"id_poeme", value : poeme._id})
				.then(function(res){
					$scope.commentList = res.result;
				});
		}
		function toggleComment(){
			if($scope.isLoggedIn){
				$scope.showInputComment = !$scope.showInputComment;
			}
		}

	}


	rubriqueController.$inject = ['$state', '$stateParams','Poeme', 'myModal', '$rootScope', '$scope', '$uibModal'];
	function rubriqueController($state, $stateParams, Poeme, myModal, $rootScope, $scope, $uibModal) {
		var idParam = $stateParams.id;
		$scope.viewPoem = viewPoem;
		$scope.poemToDisplay;
		$scope.info = {};
		$scope.info.showMessage = false;
		$scope.rubricList = ['Dieureudieuf Serigne Bethio', 'L\'esprit universel', 'Histoire sacrées',
			'Gatt Saf', 'Les plus appréciés', 'L\'originalité spiritelle'];
		$rootScope.confVariable.titre = $scope.rubricList[idParam-1];

		Poeme.getPoemsByLabel({key :"rubric", value : idParam})
			.then(function(res) {
				if (res.code===0) {
					$scope.poemlist = res.result;
				} else {
					$scope.info.message = "Rubrique vide pour le moment. Aucun poème présent";
					$scope.info.type = 'info';
					$scope.info.showMessage = true;
				}
			});

		function viewPoem(width, poemeId) {
			Poeme.get(poemeId)
				.then(function(res){
					$scope.poemToDisplay = res.result;
					myModal.viewPoem('app/manager/poemes/modals/poemeVue.html', 'lg', $scope.poemToDisplay);
				});
		}

	}
})();
