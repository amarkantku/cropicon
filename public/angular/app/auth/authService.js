'use strict';
angular.module('AuthService',[])

.factory('Auth',function($http, $q,$resource ,$rootScope ,$sanitize,AuthToken,API_PATH){


	/*return {
	    jokes: function (token) {
	        return $resource('https://my.backend.com/api/jokes', null, {
	            query: {
	                method: 'GET'
	                headers: {
	                    'Authorization': 'Bearer ' + token
	                }
	            }
	        })
	    }
	};
	myFactory.jokes($scope.myOAuthToken).query({'jokeId': '5'});
*/

	return {
		doLogin : function(params){
			var deferred = $q.defer();

			var payload = {
				email : $sanitize(params.username), 
				password: $sanitize(params.password)
			};

/*
			var message = "Secret Message";
			var key = CryptoJS.enc.Hex.parse('36ebe205bcdfc499a25e6923f4450fa8');
			var iv  = CryptoJS.enc.Hex.parse('be410fea41df7162a679875ec131cf2c');

			// Encription. Works ok
			var encrypted = CryptoJS.AES.encrypt(
			        message,key,
			        {
			            iv: iv,
			            mode: CryptoJS.mode.CBC,
			            padding: CryptoJS.pad.Pkcs7
			        }
			    );
			console.log('encrypted:'+encrypted.ciphertext.toString());



			// Decription. Works ok with "encrypted" parameter
			var decrypted = CryptoJS.AES.decrypt(
			        encrypted,key,
			        {
			            iv: iv,
			            mode: CryptoJS.mode.CBC,
			            padding: CryptoJS.pad.Pkcs7
			        }
			    );
			console.log('decrypted:'+decrypted.toString(CryptoJS.enc.Utf8));
			console.log('decrypted, by hand:'+decrypted.toString(CryptoJS.enc.Utf8));

*/






			
			var LoginResource = $resource(API_PATH + 'users/login', payload, {
				login: {
					method:'POST',
					// headers: { 'Content-Type': 'application/x-www-form-urlencoded'}
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

		isLoggedIn: function(){
			return AuthToken.getToken() ? true : false;
		},

		getLoggedInUser: function(){
			var token  = AuthToken.getToken(); 
			if(token){
				return $http.get(API_PATH + 'users/me?token='+token).then(function(res){
					return res.data.success && res.data.hasOwnProperty('user') ? res.data.user : null;
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
			var token = AuthToken.getToken();
			if(token){
				config.headers['x-access-token'] = token;
			}
			return config;
		},
		response: function(res) {
			//console.log(res);
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