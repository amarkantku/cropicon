(function(window, angular){
	'use strict';
	var Users = angular.module('iUsers',[]);

	Users.controller('LoginController', ['$scope','$rootScope','$log','$location','Auth', function($scope, $rootScope, $log, $location,Auth) {
	    var self = this;
	    self.submit = function() {
	    	Auth.doLogin(self.user).then(function(res){
	    		if(res.success){
	    			$location.path('/');
	    		}
	    	});
	    };
	}]);

	Users.controller('SignUpController', ['$scope','$log', function($scope, $log) {
	    $scope.message = 'Hello From SignUpController';
	    $log.info('SignUpController');

	    /*self.register = function(username, password) {
		  return $http.post(API + '/auth/register', {
		      username: username,
		      password: password
		    })
		}*/

	}]);
})(window, window.angular);