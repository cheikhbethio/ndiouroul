angular.module('poemeServices', ['ngResource'])
		.factory('Poeme', ['$resource', function ($resource) {
				return $resource('/api/poeme/:id', {}, {
					query: {method: 'GET', isArray: true},
					get: {method: 'GET'},
					save: {method: 'POST'},
					update: {method: 'PUT'},
					remove: {method: 'DELETE'}
				});
			}])
		.factory('LastPoemes', ['$resource', function ($resource) {
				return $resource('/api/last/lastPoeme', {}, {
					query: {method: 'GET', isArray: true}
				});
			}])
		.factory('getPoemsByLabel', ['$resource', function ($resource) {
				return $resource('/api/forpoem/bylabel', {}, {
					get: {method: 'GET'}
				});
			}]);
