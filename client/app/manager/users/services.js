var userService = angular.module('userService', []);

userService.factory('user', ['$http', function ($http) {

	return {
		save : function(data){
			return $http.post("api/users", data)
				.then(thenFunction)
		},
		get : function(id){
			return $http.get("api/users/" + id)
				.then(thenFunction)
		},
		getAll : function(){
			return $http.get("api/users")
				.then(thenFunction);
		},
		update : function(id, data){
			return $http.put("api/users/" + id, data)
				.then(thenFunction)
		},
		updateProfile : function(id, data){
			return $http.put("api/profile/" + id, data)
				.then(thenFunction)
		},
		remove : function(id){
			return $http.delete("api/users/" + id)
				.then(function thenFunction(res) {
					return res.data;
				})
		}


	}

	function thenFunction(res) {
		return res.data;
	}

	}]);
