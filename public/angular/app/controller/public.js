(function(window, angular){
	'use strict';
	var iPublic = angular.module('iPublicAccess',[]);

	iPublic.controller('HomeController', ['$scope','$log','$interval', function($scope,$log,$interval) {
    	// $log.info('home');

		$scope.greeting = "Hello Amar";

		$scope.clock = "loading clock..."; // initialise the time variable
    	/*$scope.tickInterval = 1000 //ms

	    var tick = function() {
	        $scope.clock = Date.now() // get the current time
	        $timeout(tick, $scope.tickInterval); // reset the timer
	    }
	    // Start the timer
	    $timeout(tick, $scope.tickInterval);

*/

	    var clockTick = function() {
    		$scope.clock = Date.now();
  		}
  		clockTick();
  		$interval(clockTick, 1000);

	}]);


	iPublic.controller('AboutUsController', ['$scope','$log', function($scope,$log) {
    	$scope.message = 'Hello From Controller';
    	// $log.info('about-us');
	}]);


	iPublic.controller('HowItWorksController', ['$scope','$log', function($scope,$log) {
    	$scope.message = 'Hello From HowItWorksController';
    	// $log.info('HowItWorksController');
	}]);


	iPublic.factory('SessionStorage', ['$window','$http', function($window, $http) {
		return {
			get: function(key) {
				// get from browser session storage 
		        return $window.sessionStorage.getItem(key);
		    },
			set: function(key, value) {
				// do action to save @server side OR in database
		        $window.sessionStorage.setItem(key, value);
		    },
			destroy: function(key) {
				// do action to destroy from all location ,if it is stored in database or somewhere else 
		       return $window.sessionStorage.removeItem(key);
		    }
		};
	}]);

	iPublic.factory('LocalStorage', ['$window', function($window) {
		return {
			get: function(key) {
		        return $window.localStorage.getItem(key);
		    },
			set: function(key, value) {
		        $window.localStorage.setItem(key, value);
		    },
			destroy: function(key) {
		       	return $window.localStorage.removeItem(key);
		    }		
		};
	}]);
})(window, window.angular);