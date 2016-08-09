"use strict";

var db = require('../config/db');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var fs = require('fs');

function getPrivateCert(callback){
	fs.readFile(require('path').resolve(__dirname, '../config/private.pem'), function read(err, data) {
		if (err) throw err;
	  	callback(data);
	});
}

function getPublicCert(callback){
	fs.readFile(require('path').resolve(__dirname, '../config/public.pem'), function read(err, data) {
	   	if (err) throw err;
	   	callback(data);  
	});
}

function createToken(user ,callback){
	getPrivateCert(function(privateCert){
    	jwt.sign(user, privateCert, { algorithm: 'RS256' }, function(err, token) {
			// if(err) throw err;
			callback(err, token);
		});
    });
}


function verifyToken(token , callback){
	getPublicCert(function(publicCert){
        jwt.verify(token, publicCert,{ algorithm: 'RS256' }, function (err, payload) {
			//if(err) throw err;
			callback(err,payload);
		});       
    });
}


module.exports = function(app, express) {
	var api = express.Router();

	api.post('/user/signup', function(req , res ){
	
	});

	api.post('/user/login', function(req , res ){
	    User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
            if (err) throw err;
            
            // login was successful
            if (user) {
            	var userTokenInfo = {
 					_id : user._id,
 					email:user.email,
 					username : user.username
            	};
      			createToken(userTokenInfo,function(err , token){
      				if(token){
                		res.json({success:true,message:"Successfuly login!",token:token});
      				}else{
      					res.status(403).send({success:false,message:"Unable to create token ! Try again."});
      				}
                });
                
            }else{
            	// otherwise we can determine why we failed
	            var reasons = User.failedLogin;
	            var message = "";
	            switch (reason) {
	                case reasons.NOT_FOUND:
	                    console.log('NOT_FOUND');
	                    message = "User doesn't exist";
	                    break;

	                case reasons.PASSWORD_INCORRECT:
	                    console.log('PASSWORD_INCORRECT');
	              		message = "Invalid password";
	                    break;

	                case reasons.MAX_ATTEMPTS:
	                    console.log('MAX_ATTEMPTS');
	                 	message = "MAX_ATTEMPTS";
	                    break;
	            }
	            res.json({message: message});
            }
        });
	});

	/**************************Middleware****************************/

	api.use(function(req, res, next){
		var token = req.body.token || req.params.token || req.headers['x-access-token'];
		if(token){
			verifyToken(token,function(err, payload){
				if(err){
					res.status(403).send({success:false,message:"User authentication failed"});
				}
	            req.authUser = payload;
	            next();
        	});
		}else{
			res.status(403).send({success:false,message:"No Token Provided"});
		}
	});

	/**************************Middleware end***********************/

	api.post('/user/me', function(req , res ){
        if(req.authUser){
        	res.json(req.authUser);
        }
	});


	return api;
}