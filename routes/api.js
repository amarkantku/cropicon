"use strict";

var db 		= require('../config/db');
var User 	= require('../models/user');
var fs 		= require('fs');
var crypto 	= require('crypto');
var path 	= require('path');


module.exports = function(app, express, multer) {

	// API Object to intract with REST API.
	var api = express.Router();

	/******* Configure Upload documents & images path **********************/
	let imageUploadPath = {
		USER_IMAGES_PATH	: './uploads/users/profile/images/',
		
	}

	let documentsUploadPath ={
		USER_DOCUMENTS_PATH	: './uploads',
	}
	/******** Configure Upload documents & images path end here ***********/


	// HTTP Response code for APIes response  
	let httpResponseCode = {
    	OK			: 200,
    	BAD_REQUEST	: 400, 
    	FORBIDDEN	: 403,
    	NOT_FOUND	: 404 
	};

	/*********** File storage [Storage on disk ] configuration ***********/
	var storage =   multer.diskStorage({
  		destination: function (req, file, callback) {
  			var mimeType = ['image/png','image/jpg','image/jpeg'];
  			
  			if(file.fieldname === 'avatar' && mimeType.indexOf(file.mimetype) >= 0){
  				callback(null, imageUploadPath.USER_IMAGES_PATH);
  			}else{
  				callback(null, documentsUploadPath.USER_DOCUMENTS_PATH);
  			}
  		},
		filename: function (req, file, callback) {
			/*crypto.pseudoRandomBytes(8, function (err, raw) {
			    if (err) return callback(err)
				callback(null, raw.toString('hex') + Date.now() + path.extname(file.originalname))
			});*/

			callback(null, req.authUser._id + path.extname(file.originalname))
			// callback(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
		}
	});

	// File size for user images 
	var upload = multer({ storage: storage, limits:{ fileSize: 1048576 } });

	// To upload user profile images settings
	var userProfileImageUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);

	/***********************************************************************/


	/***********************APIies Start Here ******************************/

	// To Register / sign up new user 
	api.post('/users/signup', function(req , res ){
	  	// check user exist ? 

	  	// if user doesn't exist , create new user
	});


	// To login existing user into application 
	api.post('/users/login', function(req , res ){
		req.assert('password', 'Password is required').notEmpty();
		req.assert('email', 'Email is required').notEmpty();
    	req.assert('email', 'A valid email is required').isEmail();

		var errors = req.validationErrors();
		if (errors){
        	res.status(httpResponseCode.BAD_REQUEST).send({ success:false,code: "400XXX" ,message:"Invalid state !", errors: errors , data: [{email:req.body.email}] } );
    	}else{
    		User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
        	    if (err) throw err;
            
	            // login was successful
	            if (user) {
	            	var userTokenInfo = {
	 					_id : user._id,
	 					email:user.email,
	 					created_at : Date
	            	};

	      			User.createToken(userTokenInfo, function(err , token){
	      				if(token){
	                		res.status(httpResponseCode.OK).send({success:true,code: "200XXX", message:"Successfuly login!", data:[{token:token,email:req.body.email,user_id:user._id}] });
	      				}else{
	      					delete err.path;
	      					res.status(httpResponseCode.BAD_REQUEST).send({success:false, code: "400XXX", message:"Unable to create token ! Try again.", errors: err});
	      				}
	                });
	                
	            }else{
	            	// otherwise we can determine why we failed
		            let reasons = User.failedLogin;
		            let message = "";
		            let statusCode = 0;

		            switch (reason) {
		                case reasons.NOT_FOUND:
		                    message = "User doesn't exist";
		                    statusCode = httpResponseCode.NOT_FOUND; // NOT FOUND: requested resource is not found, it doesn't exist
		                    break;

		                case reasons.PASSWORD_INCORRECT:
		                    message = "Invalid password"; 
		              		statusCode = httpResponseCode.BAD_REQUEST; // 400 (BAD REQUEST) request would cause an invalid state. Domain validation errors, missing data,
		                    break;

		                 case reasons.IN_ACTIVE:
		                 	statusCode = httpResponseCode.FORBIDDEN; // 403 (FORBIDDEN) user not authorized to perform the operation, doesn't have rights to access the resource, or the resource is unavailable for some reason
		              		message = "You've been blocked or de-activated by system admin.";
		                    break;

		                case reasons.MAX_ATTEMPTS:
		                    statusCode = httpResponseCode.BAD_REQUEST; // BAD REQUEST 
		                 	message = "You've reached max attempts! Please verify your credentials and try after 10 minutes.";
		                    break;
		            }
		            res.status(statusCode).send({ success:false, code: statusCode+'XXX', message: message, data:[{email:req.body.email,password:''}]});
	            }
	        });
    	}	    
	});


	/**************************Middleware****************************/

	api.use(function(req, res, next){

		// To read token from request object 
		var token = req.body.token || req.params.token || req.headers['x-access-token'];

		// If token is not empty or null or undefined 
		if(token){

			// To verify token is valid or not 
			User.verifyToken(token,function(err, payload){

				if(err){
					if(err.code == 'ENOENT' && err.errno == -2){
						// Unavailable to open key certificate file 
						delete err.path;
						res.status(httpResponseCode.BAD_REQUEST).send({success:false,code: "400XXX",message:"Token passcode not found, User authentication failed.", errors : err});
					}else{		
						// If token is invalid 
						res.status(httpResponseCode.BAD_REQUEST).send({success:false,code: "400XXX",message:"Invalid token, User authentication failed.", errors : err});
					}
				}

				// If token is valid & passed without any error
	            req.authUser = payload;

	            // To execute next matching route
	            next();
        	});
		}else{
			res.status(httpResponseCode.BAD_REQUEST).send({success:false,code: "400XXX",message:"No Token Provided."});
		}
	});


	/**************************Middleware end***********************/

	api.get('/users/me', function(req , res ){
        if(req.authUser){
        	res.json(req.authUser);
        }
	});



	api.get('/users/:email', function(req , res ){
		 User.searchByEmailId(req.params.email, function (err,users) {
        	if (err) res.json(err);
        	res.json(users);
    	})
	});


	api.get('/users', function(req , res ){
    	User.find({}).select('-password').exec(function (err, users) {
        	if (err) {
        		res.status(httpResponseCode.BAD_REQUEST).send({success:false,code: "400XXX",message:"Internal Error.",error:err});
        	}
        	res.status(httpResponseCode.OK).send( {success: true ,code: "200XXX", message: "Records found.",count:users.length, results: users} );
    	});
	});


	api.get('/users/image', function(req , res ){
	   if(req.authUser){
	       	res.setHeader('Content-Type', 'image/*');
    		fs.createReadStream(path.join(imageUploadPath.USER_IMAGES_PATH, req.headers.filename)).pipe(res)
	    }
	});

	api.post('/users/profile' ,function ( req, res, next) {
		userProfileImageUpload(req, res, function (err) {
		    if (err) {
		       res.status(httpResponseCode.BAD_REQUEST).send({error:err});
		    }else{
		    	// Once upload do I/O operations , Save into database
		    	res.status(httpResponseCode.OK).send({file :req.files});
		    }
		});
	});

	return api;
}