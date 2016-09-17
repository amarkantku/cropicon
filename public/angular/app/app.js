"use strict";
var app = angular.module('cropicon', ['ngRoute','ngResource','ngCookies']);  

app.config(function ($routeProvider,$locationProvider) {
	$locationProvider.html5Mode({enabled: true,requireBase: false});
	$routeProvider
		.when('/', {
            title: 'Home',
        	templateUrl: 'partials/home',
        	controller: 'HomeController'
      	})
        .when('/about-us', {
            title: 'About us',
            templateUrl: 'partials/aboutus',
            controller: 'AboutUsController'
        })
        .when('/login', {
            templateUrl: 'users/login',
            controller: 'LoginController'
        })
        .when('/sign-up', {
            templateUrl: 'users/signup',
            controller: 'SignUpController'
        })
        .otherwise({
            redirectTo: '/'
        });
})
.run(['$rootScope', '$location','$cookieStore','$log','$window' , function($rootScope, $location,$cookieStore,$log,$window) {
    $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
        $rootScope.title = '';
        if(currRoute.$$route.title !== undefined){
            $rootScope.title = currRoute.$$route.title;
        }
         
           // $window.document.title = currRoute.$$route.title;
            $cookieStore.put('test',11);

            if($cookieStore.get('loggedIn')){
                $log.info('logged in');
            }else{
                // $log.error('Try to login');
            }

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

app.controller('SignUpController', ['$scope','$log', function($scope,$log) {
    $scope.message = 'Hello From SignUpController';
    $log.info('SignUpController');
}]);


app.controller('LoginController', ['$scope','$log', function($scope,$log) {
    $scope.headerTitle = 'Login !';
    var self = this;
    self.submit = function() {
       $log.info('User clicked submit with ', self.user);
    };
}]);