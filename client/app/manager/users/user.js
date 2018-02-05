(function () {
	'use strict';

	angular.module('user', ['ui.router', 'ui.bootstrap', 'underscore'])
			.config(['$stateProvider', function ($stateProvider) {
					$stateProvider
							.state('dashboard.user', {
								url: '/user',
								abstract: true,
								template: "<div ui-view></div>"
							})
							.state('dashboard.user.show', {
								url: '/show/:id',
								templateUrl: 'app/manager/users/show.html',
								controller: 'showUserController',
								resolve: {
									userToDisplay: getAUser,
									poemsList: getPoemByAuthor
								}
							})
							.state('dashboard.user.edit', {
								url: '/edit/:id',
								templateUrl: 'app/manager/users/edit.html',
								controller: 'editUserController',
								resolve: {
									userToEdit: getAUser
								}
							})
							.state('dashboard.user.all', {
								url: '/all',
								templateUrl: 'app/manager/users/all.html',
								controller: 'allUserController',
								resolve: {
									usersList: getAllUser
								}
							});
				}])
			.controller('editUserController', editUserController)
			.controller('showUserController', showUserController)
			.controller('allUserController', allUserController);


	showUserController.$inject = ['myModal', 'poemsList', 'userToDisplay', '$state', 'user', '$scope'];
	function showUserController(myModal, poemsList, userToDisplay, $state, user, $scope) {
		$scope.userToDisplay = userToDisplay;
		$scope.poemsList = poemsList.result;
		$scope.deleteUser = deleteUser;

		function deleteUser() {
			var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
			modalConfirm.result.then(function (res) {
				if (res) {
					user.remove(userToDisplay._id)
						.then(function (res) {
						if (res.code === 0) {
							$state.go('dashboard.user.all');
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

	}

	editUserController.$inject = ['_', 'myModal', 'CurrentUser', 'user', 'userToEdit', '$scope', '$state'];
	function editUserController(_, myModal, CurrentUser, user, userToEdit, $scope, $state) {
		$scope.saveUser = saveUser;
		$scope.isMe = isMe;
		$scope.cancel = cancel;
		$scope.validateUser = validateUser;
		$scope.deleteUser = deleteUser;
		$scope.updateUser = updateUser;

		$scope.user = userToEdit;
		$scope.message;
		$scope.theStatus;
		var rightObj = {
			salsa: "0",
			salsaBat: "1",
			salsaBatKiz: "2"
		};
		$scope.right = rightObj[$scope.user.local.right];
		$scope.info = {};
		$scope.info.showMessage = false;

		init();
		function init() {
			switch ($scope.user.local.status.code) {
				case  1442 :
					$scope.message = "La verification du mail de cet utilisateur est en cours.";
					$scope.theStatus = "InProcess";
					break;
				case 191 :
					$scope.message = "On attend que tu valide son inscription, son email a déjà été vérifié.";
					$scope.theStatus = "ForValidation";
					break;
				case 451 :
					$scope.message = "Cet Utlisateur est incript et bien validé";
					$scope.theStatus = "Validated";
					break;
				case 660 :
					$scope.message = "Cet Utlisateur a été supprimé";
					$scope.theStatus = "Removed";
					break;
			}
		}

		function updateUser(right) {
			if (right !== rightObj[$scope.user.local.right]) {
				_.each(rightObj, function (value, key) {
					if (value === right) {
						$scope.user.local.right = key;
					}
				});
				upUser(user, $scope, $state);
			}
		}

		function deleteUser() {
			deleter(myModal, user, $state, $scope);
		}

		function validateUser() {
			$scope.user.local.status = {code: 451, msg: "Actif"};
			user.update($scope.user._id, $scope.user)
					.then(function (resp) {
						if (resp.code === 0) {
							$state.go('dashboard.user.show', {id: $scope.user._id});
						} else {
							$scope.info.message = resp.message;
							$scope.info.type = 'danger';
							$scope.info.showMessage = true;
						}
					},
					function (error) {
						$scope.info.message = "un probleme s'est produit. L'enregistrement est temporairement impossible";
						$scope.info.type = 'danger';
						$scope.info.showMessage = true;
					});
		}

		function isMe() {
			return $scope.user._id === CurrentUser.getId();
		}

		function saveUser() {
			if ($scope.userForm.$valid) {
				user.update($scope.user._id, $scope.user)
						.then(function (resp) {
							if (resp.code === 0) {
								$state.go('dashboard.user.show', {id: $scope.user._id});
							} else {
								$scope.info.message = resp.message;
								$scope.info.type = 'danger';
								$scope.info.showMessage = true;
							}
						},
						function (error) {
							$scope.info.message = "un probleme s'est produit. L'enregistrement est temporairement impossible";
							$scope.info.type = 'danger';
							$scope.info.showMessage = true;
						});

			} else {
				$scope.info.message = 'Les données sont incorrectes, Veillez recommencer svp'
				$scope.info.showMessage = true;
				$scope.info.type = 'danger';
			}
		}

		function cancel() {
			$state.go('dashboard.user.show', {id: $scope.user._id});
		}
	}

	allUserController.$inject = ["myModal", "user", "$scope", "usersList", "$state"];
	function allUserController(myModal, user, $scope, usersList, $state) {
		$scope.usersList = usersList;
		$scope.deleteUser = deleteUser;

		function deleteUser(param) {
			var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
			modalConfirm.result.then(function (res) {
				if (res) {
					user.remove(param._id)
					 .then(function (res) {
						if (res.code === 0) {
							$state.reload();
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
	}

	//get a user by id
	getAUser.$inject = ['user', '$stateParams'];
	function getAUser(user, $stateParams) {
		return user.get($stateParams.id)
			.then(function(res) {
				return res;
			});
	}

	//get all users
	getAllUser.$inject = ['user'];
	function getAllUser(user) {
		return user.getAll()
			.then(function(res) {
				return res;
			});
	}

	//get allpoeme by author
	getPoemByAuthor.$inject = ['Poeme', '$stateParams'];
	function getPoemByAuthor(Poeme, $stateParams) {
		return Poeme.getPoemsByLabel({key: "id_auteur", value: $stateParams.id})
			.then(function(res) {
				return res;
			});
	}

	//deleteUser
	function deleter(myModal, user, $state, $scope) {
		var modalConfirm = myModal.confirm('app/common/modalView/confirm.html', 'sm');
		modalConfirm.result.then(function (res) {
			if (res) {
				user.remove($scope.user._id)
					.then(function (res) {
					if (res.code === 0) {
						$state.go("dashboard.user.all");
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

	//updateUser
	function upUser(user, $scope, $state) {
		user.update($scope.user._id, $scope.user)
				.then(function (resp) {
					if (resp.code === 0) {
						$state.go('dashboard.user.show', {id: $scope.user._id});
					} else {
						$scope.info.message = resp.message;
						$scope.info.type = 'danger';
						$scope.info.showMessage = true;
					}
				},
				function (error) {
					$scope.info.message = "un probleme s'est produit. L'enregistrement est temporairement impossible";
					$scope.info.type = 'danger';
					$scope.info.showMessage = true;
				});
	}

})();
