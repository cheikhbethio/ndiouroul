angular.module('poemeServices', [])
		.factory('Poeme', ['$http',function ($http) {
			return {
				post : function(data){
					return $http.post("/api/poeme", data)
						.then(function(res){
							return res.data;
						})
				},
				get : function(id){
					return $http.get("/api/poeme/" + id)
						.then(function(res){
							return res.data
						})
				},
				getAll : function(){
					return $http.get("/api/poeme")
						.then(function(res){
							return res.data
						})
				},
				update : function(id, data){
					return $http.put("/api/poeme/" + id, data)
						.then(function(res){
							return res.data
						})
				},
				delete : function(id){
					return $http.delete("/api/poeme/" + id)
						.then(function(res){
							return res.data
						})
				},
				lastPoemes : function(){
					return $http.get("/api/last/lastPoeme")
					.then(function(res){
						return res.data
					})
				},
				getPoemsByLabel : function(data){
					return $http.get("/api/forpoem/bylabel?key=" + data.key + "&value=" + data.value)
					.then(function(res){
						return res.data
					})
				}
			}
		}]);
