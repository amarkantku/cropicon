"use strict";
var app = angular.module('cropicon', ['ngRoute','ngResource','ngCookies']);  

app.config(function ($routeProvider,$locationProvider) {
	$locationProvider.html5Mode({enabled: true,requireBase: false});
	$routeProvider
		.when('/', {
        	templateUrl: 'partials/home',
        	controller: 'HomeController'
      	})
        .when('/about-us', {
            templateUrl: 'partials/aboutus',
            controller: 'AboutUsController'
        })
        .when('/login', {
            templateUrl: 'users/login',
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/'
        });
})
.run(['$rootScope', '$location','$cookies','$log' , function($rootScope, $location,$cookies,$log) {
    $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){

    	// $log.info(currRoute);
    	// $log.info(prevRoute);


    	//Here you can check whatever you want (servercall, cookie...)

        // var logged = Auth.isLogin();

        // check if the user is going to the login page
        // i use ui.route so not exactly sure about this one but you get the picture
        // var appTo = currRoute.path.indexOf('/secure') !== -1;

        /*if(appTo && !logged) {
            event.preventDefault();
            $location.path('/login');
        }*/
    });
}]);


app.controller('HomeController',function($scope,$log){
	// $log.info('hh');
});

app.controller('AboutUsController', ['$scope','$log', function($scope,$log) {
    $scope.message = 'Hello From Controller';
    $log.info('about-us');
}]);


app.controller('LoginController', ['$scope','$log', function($scope,$log) {
    $scope.headerTitle = 'Login !';
    var self = this;
    self.submit = function() {
        $log.info('User clicked submit with ', self.user);
    };
}]);