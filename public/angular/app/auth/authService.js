'use strict';
angular.module('AuthService',[])

.factory('Auth',function($http, $q,$resource ,$rootScope ,AuthToken,API_PATH){

	return {
		doLogin : function(params){
			var deferred = $q.defer();
			var payload = {
				email : params.username, 
				password: params.password
			};
			var LoginResource = $resource(API_PATH + 'users/login', payload, {
				login: {
					method:'POST'
				}
			});

			LoginResource.login(function(res) {
				deferred.resolve(res);
				if(res.success && res.hasOwnProperty('data') && res.data.hasOwnProperty('token')){
			  		if(res.data.token !== ''){
			  			AuthToken.setToken(res.data.token);
			  		}
			  	}
			});
			return deferred.promise;
		},

		logout : function(){
			AuthToken.removeToken();
		},

		isLogin: function(){
			// console.log(API_PATH);
			return AuthToken.getToken() ? true : false;
		},

		getLoggedInUser: function(){
			var token  = AuthToken.getToken(); 
			if(token){
				return $http.get(API_PATH + 'users/me?token='+token).then(function(res){
					return res.data;
				});	
			}
			return $q.reject({message: 'User has no token'});
		} 
	}
})

.factory('AuthToken', ['$window','$cookies', function($window,$cookies) {

	return {
		getToken: function() {
			return $window.localStorage.getItem('token');
		},

		setToken: function(token) {
			if(token){
				$window.localStorage.setItem('token', token);	
			}else{
				$window.localStorage.removeItem('token');
			}
		},

		removeToken: function() {
		   // $window.localStorage.removeItem('token');
		    $window.localStorage.clear();
		}
	};

}])

.factory('AuthInterceptor', ['$location','$q','AuthToken','API_PATH', function($location, $q, AuthToken, API_PATH ) {

	return {
		request: function(config) {
			// console.log(config);
			var token = AuthToken.getToken();
			if(token){
				config.headers['x-access-token'] = token;
				// config.headers['x-csrf-token'] = 'lalalalala';
			}
			return config;
		},
		response: function(res) {
			// console.log(res);
  			/*if(res.config.url.indexOf(API_PATH) === 0 && res.data.token) {
    			// auth.saveToken(res.data.token);
  			}*/
  			return res;
		},
		responseError : function(response) {
			if(response.status === 403 || response.status === 401){
				$location.path('/login')
			}
			return $q.reject(response);
		}
	};

}])

.factory('timestampMarker', [function() {  
    var timestampMarker = {
        request: function(config) {
            config.requestTimestamp = new Date().getTime();
            return config;
        },
        response: function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response;
        }
    };
    return timestampMarker;
}])

.provider('securityInterceptor', [function() {
 	this.$get = function($location, $q) {
    	return function(promise) {
     		return promise.then(null, function(response) {
        		if(response.status === 403 || response.status === 401) {
          			$location.path('/');
        		}
        		return $q.reject(response);
      		});
    	};
  	};
}]);



