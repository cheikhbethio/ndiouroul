var userService = angular.module('userService', ['ngResource']);

userService.factory('user', ['$resource', function ($resource) {
		return $resource('api/users/:id', {}, {
			query: {method: 'GET', isArray: true},
			get: {method: 'GET'},
			save: {method: 'POST'},
			update: {method: 'PUT', isArray: false},
			remove: {method: 'DELETE'}
		});
	}]);

userService.factory('ProfileService', ['$resource', function ($resource) {
		return $resource('api/profile/:id', {}, {
			update: {method: 'PUT', isArray: false},
		});
	}]);
