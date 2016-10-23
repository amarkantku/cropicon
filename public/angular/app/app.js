"use strict";
var app = angular.module('cropicon', [
        'ngRoute',
        'ngResource',
        'ngCookies',
        'ngSanitize',
        'iUsers',
        'AuthService',
        'iPublicAccess'
    ])

    .config(function ($routeProvider, $locationProvider, $httpProvider, $sceDelegateProvider) {

    	$locationProvider.html5Mode({enabled: true,requireBase: false});
        $httpProvider.interceptors.push('AuthInterceptor');
        $httpProvider.interceptors.push('timestampMarker');

        // Allow same origin resource loads.
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://*.youtube.com/**'
        ]);

    	$routeProvider
    		.when('/', {
                title: 'Home',
            	templateUrl: 'partials/home',
            	controller: 'HomeController',
                access: {
                    isFree: true
                }
          	})
            .when('/about-us', {
                title: 'About us',
                templateUrl: 'partials/aboutus',
                controller: 'AboutUsController',
                access: {
                    isFree: true
                }
            })
            .when('/how-it-works', {
                title: 'How It Works',
                templateUrl: 'partials/howitworks',
                controller: 'HowItWorksController',
                access: {
                    isFree: true
                }
            })
            .when('/login', {
                templateUrl: 'users/login',
                controller: 'LoginController',
                access: {
                    isFree: true
                }
            })
            .when('/logout', {
                controller: 'LogoutController',
                access: {
                    isFree: false
                }
            })
            .when('/sign-up', {
                templateUrl: 'users/signup',
                controller: 'SignUpController',
                access: {
                    isFree: true
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    })


    .run(['$rootScope', '$location','$log','$window','Auth' ,function($rootScope, $location, $log, $window, Auth) {
        
        $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute){
            $rootScope.title = '';
            if(currRoute.$$route.title !== undefined){
                $rootScope.title = currRoute.$$route.title ;
            }
          //  $rootScope.userLoggedIn = {name : 'Hi, '+ 'Amar'}    
        
            let checkIsLoggedInForRoute = ['/login','/sign-up'];
            let isFreeAccess = currRoute.$$route.access.isFree;
            let isLoggedIn = Auth.isLogin();

            if(isFreeAccess){
                if(checkIsLoggedInForRoute.indexOf($location.path()) !== -1 && isLoggedIn){
                    event.preventDefault();
                    $location.path('/')   
                }
            }else if(!isFreeAccess){
                let isLogoutRoute = currRoute.$$route.originalPath.indexOf('/logout') !== -1;
                if(isLogoutRoute && isLoggedIn){
                    Auth.logout();           
                    $location.path('/');    
                }else if(isLogoutRoute && !isLoggedIn){ 
                    $location.path('/login');
                } 
            }
        });
    }]);


// app.constant('API_PATH','https://cropicondev.herokuapp.com/api/v1/')
app.constant('API_PATH', 'http://localhost:3000/api/v1/');