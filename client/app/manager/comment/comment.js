(function () {
	'use strict';

	angular.module('comments', ['ui.router', 'ui.bootstrap', 'underscore'])
			.config(['$stateProvider', function ($stateProvider) {
					$stateProvider
							.state('dashboard.comment', {
								url: '/comment',
								templateUrl: 'app/manager/comment/all.html',
								controller: 'commentController'
							})
							.state('dashboard.showComment', {
								url: '/comment/:id',
								templateUrl: 'app/manager/comment/show.html',
								controller: 'showCommentController',
								resolve: {
									commentToDisplay: getAComment
								}
							});
				}])
			.controller('commentController', commentController)
			.controller('showCommentController', showCommentController)
			.controller('viewCommentController', viewCommentController);


	showCommentController.$inject = ['$http','myModal', 'commentToDisplay', '$state', 'comment', '$scope'];
	function showCommentController($http, myModal, commentToDisplay, $state, comment, $scope) {
		$scope.commentToDisplay = commentToDisplay.result[0];
		$scope.info;

		$scope.deleteComment = deleteComment;
		$scope.denounceComment = denounceComment;

		function deleteComment() {
			var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
			modalConfirm.result.then(function (res) {
				if (res) {
					comment.delete({id: $scope.commentToDisplay._id}, function (res) {
						if (res.code === 0) {
							$state.go('dashboard.comment');
						} else {
							$scope.info = {
								message: res.message,
								type: 'danger'
							};
						}
					});
				}
			});
		}
		function denounceComment(){
			var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
			modalConfirm.result.then(function (res) {
				if (res) {
					$scope.commentToDisplay.denounced =!$scope.commentToDisplay.denounced;
						comment.update({id : $scope.commentToDisplay._id}, $scope.commentToDisplay, function(res){
					});
				}});
		}


	}
	commentController.$inject = ['myModal','comment', '$scope'];
	function commentController(myModal, comment, $scope) {
		comment.query(function(res){
			$scope.commentList = res;
		});
		$scope.deleteComment=deleteComment;

		function deleteComment(indComment) {
			var toDel = $scope.commentList[indComment];
			var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
			modalConfirm.result.then(function(res){
				if (res) {
					comment.delete({id: toDel._id}, function (res) {
						if (res) {
							$scope.commentList.splice(indComment, 1);
						} else {
							console.log("## non : ", res.message);
						}

					});
				}
			});
		}

	}

	viewCommentController.$inject = ['Poeme','CurrentUser', 'comment', 'getCommentByLabel','$scope', '$uibModalInstance','poeme'];
	function viewCommentController(Poeme, CurrentUser, comment, getCommentByLabel, $scope, $uibModalInstance, poeme) {
		$scope.commentToDisplay = comment;
		$scope.addComment = addComment;
		$scope.newComment = {};
		$scope.info ={};
		$scope.commentList =[];
		$scope.tooltipInfo;

		$scope.denounceComment = denounceComment;
		$scope.denouncePoem = denouncePoem;


		getComment();

		function denounceComment(commentDoc){
			commentDoc.denounced =!commentDoc.denounced;
			comment.update({id : commentDoc._id}, commentDoc, function(res){
			});

		}


		function denouncePoem(){
			$scope.poemToDisplay.denounced = !$scope.poemToDisplay.denounced;
			Poeme.update({id : $scope.poemToDisplay._id}, $scope.poemToDisplay, function(res){});
		}

		function addComment(){
			$scope.newComment.id_poeme = poeme._id;
			$scope.newComment.id_author = CurrentUser.getId();
			comment.save($scope.newComment, function (resp) {
				$scope.info.message = resp.message;
				$scope.info.showMessage = true;
				if (resp.code === 0) {
					getComment();
					$scope.info.type = "success";
					$scope.info.showMessage = true;
				}else{
					$scope.info.type = "danger";
					$scope.info.showMessage = true;
				}
				$scope.newComment.content = "";
				$scope.showInputComment = false;
			});
		}

		function getComment(){
			getCommentByLabel.get({key :"id_poeme", value : poeme._id},function(res){
				$scope.commentList = res.result;
			});
		}

	}

	getAComment.$inject = ['comment', '$stateParams'];
	function getAComment(comment, $stateParams) {
		return comment.get({id: $stateParams.id}).$promise;
	}
})();
