var myAlerter = angular.module('myAlerter', []);
myAlerter.directive('myInfo', myInfo);

function myInfo() {
	return {
		restrict: 'E',
		scope: {
			info: '='
		},
		template: "<uib-alert type='{{info.type}}' ng-if='info.showMessage' close='closeAlert()'>\n\
		<span class='glyphicon glyphicon-info-sign' aria-hidden='true'></span> \n\
		{{info.message}}\n\
		</uib-alert>",
		controller: myInfoContoller
	};

	myInfoContoller.$inject = ['$scope'];

	function myInfoContoller($scope) {
		$scope.closeAlert = closeAlert;
		$scope.info;

		function closeAlert() {
			$scope.info.showMessage = false;
			$scope.newPoeme = {};
		}
	}
}