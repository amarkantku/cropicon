(function(window, angular){
	'use strict';
	var Users = angular.module('iUsers',[]);

	Users.controller('LoginController', ['$scope','$rootScope','$log','$location', function($scope, $rootScope, $log, $location) {
	    $scope.headerTitle = 'Login !';
	    var self = this;
	    self.submit = function() {
	       $log.info('User clicked submit with ', self.user);
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