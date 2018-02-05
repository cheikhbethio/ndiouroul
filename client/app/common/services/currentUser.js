var currentUserModule = angular.module('currentUser', ['ngCookies', 'ngResource']);

currentUserModule.factory('CurrentUser', ['$cookies', '$localStorage',  '$resource',
	function($cookies, $localStorage, $resource) {
		var cookieName = 'SeugneBethioLaGrace';
  	return {

		getUser: function() {
			var cookievalue = $cookies.get(cookieName);
			if (cookievalue) {
				return JSON.parse(cookievalue);
			}
			return undefined;
		},

		clear: function() {
			$cookies.remove(cookieName);
		},

		isLoggedIn: function() {
 			return angular.isDefined($cookies.get(cookieName));
		},

		getId: function(){
			// var cookievalue = JSON.parse($cookies.get(cookieName));
			var cookievalue = this.getUser();
			return cookievalue.id
		},

		getRight : function(){
			// var cookievalue = $cookies.get('SeugneBethioLaGrace');
			var cookievalue = this.getUser();
			if (cookievalue) {
				// cookievalue = JSON.parse(cookievalue);
				return cookievalue.right;
			}
			return null;
		},

		set: function(user) {
			$localStorage.currentUser = angular.copy(user);
		},

		isAdmin: function(){
			if($localStorage.currentUser === undefined)
				return false;
			else
				if(this.getRight() === 3)
					return true;
				else
					return false;
		},

		hasProfilePic: function(){
			if($localStorage.currentUser === undefined)
				return false;
			else
				if($localStorage.currentUser.picture == "")
					return false;
				else
					return true;
		},

		profilePicUrl: function(){
            if(this.hasProfilePic()){
                return $localStorage.currentUser.picture;
            } else {
                return "components/res/default.png";
            }
        }

	};
}]);
