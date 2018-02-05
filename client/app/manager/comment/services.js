var commentsService  = angular.module('commentsService', []);

commentsService.factory('comment', ['$http', function($http){

	return {
			get : function(id) {
				return $http.get("api/comment/" + id)
					.then(theFunction);
			},
			getAll : function() {
				return $http.get("api/comment")
				.then(theFunction);
			},
			post : function(data) {
				return $http.post("api/comment", data)
					.then(theFunction);
			},
			update : function(id, data) {
				return $http.put("api/comment/" + id, data)
					.then(theFunction);
			},
			delete : function(id) {
				return $http.delete("api/comment/" + id)
					.then(theFunction);
			},
			getCommentByLabel : function(data) {
				return $http.get("/api/forComment/bylabel?key=" + data.key + "&value=" + data.value)
					.then(theFunction);
			}

	}

	/***************Auxiliare function********************/
	function theFunction(res) {
			return res.data;
	}
}]);
