var custumModal = angular.module('custumModal', ['underscore']);
custumModal.factory('myModal', ['_', '$uibModal', function (_, $uibModal) {
		return {
			givePwd: function (template, size) {
				return $uibModal.open({
					animation: true,
					templateUrl: template,
					controller: function ($uibModalInstance, $scope) {
						$scope.yes = yes;
						$scope.exit = exit;
						$scope.credit = {};

						function yes() {
							$uibModalInstance.close($scope.credit);
						}

						function exit() {
							$uibModalInstance.dismiss('cancel');
						}
					},
					size: size
				});
			},
			confirm: function (template, size) {
				return $uibModal.open({
					animation: true,
					templateUrl: template,
					controller: function ($uibModalInstance, $scope) {
						$scope.yes = yes;
						$scope.no = no;

						function yes() {
							$uibModalInstance.close("ok");
						}

						function no() {
							$uibModalInstance.dismiss('cancel');
						}
					},
					size: size
				});
			},
			info: function (template, size) {
				return $uibModal.open({
					animation: true,
					templateUrl: template,
					controller: function ($uibModalInstance, $scope, message) {
						$scope.message = message;
						$scope.yes = yes;
						function yes() {
							$uibModalInstance.close("ok");
						}
					},
					size: size
				});
			},
			viewPoem: function (template, size, resolve) {
				return $uibModal.open({
					animation: true,
					templateUrl: template,
					controller: 'viewPoemController',
					size: size,
					resolve: {
						poeme: function () {
							return resolve;
						}
					}
				});
			},
			tofChoice: function (template, size, resolve) {
				return $uibModal.open({
					animation: true,
					templateUrl: template,
					controller: function ($uibModalInstance, $scope, linkList) {
						$scope.linkList = linkList;
						$scope.selectedTof = "";
						$scope.showError = false;

						$scope.checkTof = checkTof;

						$scope.yes = yes;
						$scope.exit = exit;

						function yes() {
							if ($scope.selectedTof) {
								$uibModalInstance.close($scope.selectedTof);
							} else {
								$scope.showError = true;
							}
						}

						function exit() {
							$uibModalInstance.dismiss('cancel');
						}

						function checkTof(elem) {
							$scope.selectedTof = elem;
						}
					},
					size: size,
					resolve: {
						linkList: function () {
							return resolve;
						}
					}
				});
			}
		};
	}]);
