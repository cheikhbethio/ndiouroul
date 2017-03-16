var commentsService  = angular.module('commentsService', ['ngResource']);

commentsService.factory('comment', ['$resource', function($resource){
	return $resource('api/comment/:id', {}, {
		query: {method: 'GET', isArray: true},
		get: {method: 'GET'},
		save: {method: 'POST'},
		update: {method: 'PUT',isArray: false},
		remove: {method: 'DELETE'}
	});
}]);

commentsService.factory('getCommentByLabel', ['$resource', function ($resource) {
				return $resource('/api/forComment/bylabel', {}, {
					get: {method: 'GET'}
				});
			}]);
