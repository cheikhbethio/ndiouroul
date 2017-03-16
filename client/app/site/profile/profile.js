(function () {
	'use strict';

	angular.module('profile', ['ui.router'])
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider
				.state('site.profile', {
					url: '/profile',
					abstract: true,
					templateUrl: 'app/site/profile/profile.html',
					controller: 'profileHomeController'
				})
				.state('site.profile.edit', {
					url: '/edit',
					templateUrl: 'app/site/profile/edit.html',
					controller: 'profileEditController',
					resolve: {
						userToUp: getMe,
					}
				})
				.state('site.profile.favoris', {
					url: '/favoris',
					templateUrl: 'app/site/profile/favoris.html',
					controller: 'profileFavorisController'
				})
				.state('site.profile.poems', {
					url: '/poem',
					templateUrl: 'app/site/profile/poem.html',
					controller: 'profilePoemController',
					resolve: {
						poemsList: getPoemByAuthor
					}
				})
				.state('site.profile.me', {
					url: '/me',
					templateUrl: 'app/site/profile/me.html',
					controller: 'profileMeController',
					resolve: {
						myProfile: getMe
					}
				})
				}])
		.controller('profileHomeController', profileHomeController)
		.controller('profileEditController', profileEditController)
		.controller('profileFavorisController', profileFavorisController)
		.controller('profilePoemController', profilePoemController)
		.controller('profileMeController', profileMeController);

	profileHomeController.$inject = ["$scope"];

	function profileHomeController($scope) {
		$scope.hasRight = !false;
	}


	profileEditController.$inject = ["_", "ProfileService", "myModal", "user", "$scope", "userToUp"]

	function profileEditController(_, ProfileService, myModal, user, $scope, userToUp) {
		$scope.user = userToUp;
		$scope.reseteditForm = reseteditForm;

		$scope.pwdToggle = false;
		$scope.user.local.passwordConfirmation = "";
		$scope.info = {};
		$scope.info.showMessage = false;

		$scope.upUser = upUser;


		function reseteditForm(){
			$scope.user.local.lastname = "";
			$scope.user.local.firstname = "";
			$scope.user.local.lastname = "";
			$scope.user.local.email = "";
			$scope.user.local.phone = "";
			console.log("user ", $scope.user);
		}

		function upUser(param) {
			console.log(" *****Param***** ", param);
			if($scope.pwdToggle && $scope.user.local.passwordConfirmation !== $scope.user.local.newPassword) {
				$scope.info.message = "Les deux mot de passe ne sont pas les mêmes";
				$scope.info.type = 'danger';
				$scope.info.showMessage = true;
			} else {
				myModal.givePwd("app/common/modalView/pwdForm.html", "md")
					.result.then(function (res) {
						console.log("res modal : ", res);
						$scope.user.local.login = res.login;
						$scope.user.local.password = res.password;
						console.log("********2222*******", $scope.user);
						ProfileService.update({ id: $scope.user._id }, _.pick($scope.user.local, "email",
								"firstname", "idPic",
								"lastname", "login", "newPassword", "password", "phone"),
							function (res) {
								console.log("======= : ", res);
								if(res.code === 0) {
									$scope.info.message = "Votre Profile est bien a bien été mis à jour";
									$scope.info.type = 'success';
									$scope.info.showMessage = true;
								} else if(res.code === 2) {
									$scope.info.message = "l'adresse email est déja utilisé est indisponible";
									$scope.info.type = 'danger';
									$scope.info.showMessage = true;
								} else if(res.code === 3) {
									$scope.info.message = "Les identifiants ne sont pas bons. veillez reessayer";
									$scope.info.type = 'danger';
									$scope.info.showMessage = true;
								}
							});
					});

			}
		}

	}

	profileFavorisController.$inject = []

	function profileFavorisController() {}

	profilePoemController.$inject = ["$scope", "poemsList"]

	function profilePoemController($scope, poemsList) {
		$scope.poemsList = poemsList.result;
	}

	profileMeController.$inject = ["$scope", "myProfile"];

	function profileMeController($scope, myProfile) {
		$scope.myProfile = myProfile;
	}

	getMe.$inject = ["user", "CurrentUser"];

	function getMe(user, CurrentUser) {
		var my_id = CurrentUser.getId();
		return user.get({ id: my_id }).$promise;
	}

	//get allpoeme by author
	getPoemByAuthor.$inject = ['getPoemsByLabel', 'CurrentUser'];

	function getPoemByAuthor(getPoemsByLabel, CurrentUser) {
		return getPoemsByLabel.get({ key: "id_auteur", valu: "577e12686f2c7ed4794451ad" }).$promise;
	}

	function upUser(user, $scope, $state) {
		user.update({ id: $scope.user._id }, $scope.user,
			function (resp) {
				if(resp.code === 0) {
					$state.go('dashboard.user.show', { id: $scope.user._id });
				} else {
					$scope.info.message = resp.message;
					$scope.info.type = 'danger';
					$scope.info.showMessage = true;
				}
			},
			function (error) {
				$scope.info.message =
					"un probleme s'est produit. L'enregistrement est temporairement impossible";
				$scope.info.type = 'danger';
				$scope.info.showMessage = true;
			});
	}

})()
