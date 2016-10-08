"use strict";

var db = require('../config/db');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var crypto =  require('crypto');
var path = require('path');


function getPrivateCert(callback){
	fs.readFile(require('path').resolve(__dirname, '../config/private-rsa-1024.pem'), function read(err, data) {
		if (err) throw err;
	  	callback(data);
	});
}

function getPublicCert(callback){
	fs.readFile(require('path').resolve(__dirname, '../config/public-rsa-1024.pem'), function read(err, data) {
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


module.exports = function(app, express,multer) {
	var api = express.Router();

	var storage =   multer.diskStorage({
  		destination: function (req, file, callback) {
  			var avatarMimeType = ['image/png','image/jpg','image/jpeg'];
  			
  			if(file.fieldname === 'avatar' && avatarMimeType.indexOf(file.mimetype) >= 0){
  				callback(null, './uploads/users/profile/images/');
  			}else{
  				callback(null, './uploads');
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

	var upload = multer({ storage: storage, limits:{ fileSize: 1048576 } });

	// To upload user profile images 
	var userProfileImageUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }]);




	api.post('/users/signup', function(req , res ){
	  	// check user exist ? 

	  	// if user doesn't exist , create new user
	});


	api.post('/users/login', function(req , res ){
	    User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
            if (err) throw err;
            
            // login was successful
            if (user) {

            	var userTokenInfo = {
 					_id : user._id,
 					email:user.email,
 					created_at : Date
            	};

      			createToken(userTokenInfo, function(err , token){
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
	                    // console.log('NOT_FOUND');
	                    message = "User doesn't exist";
	                    break;

	                case reasons.PASSWORD_INCORRECT:
	                    // console.log('PASSWORD_INCORRECT');
	              		message = "Invalid password";
	                    break;

	                 case reasons.IN_ACTIVE:
	              		message = "You've been blocked or de-activated by system admin.";
	                    break;

	                case reasons.MAX_ATTEMPTS:
	                    // console.log('MAX_ATTEMPTS');
	                 	message = "You've reached max attempts! Please verify your credentials and try after 10 minutes.";
	                    break;
	            }
	            res.json({ success:false,message: message,data:{email:req.body.email,password:''}});
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

	api.post('/users/me', function(req , res ){
        if(req.authUser){
        	res.json(req.authUser);
        }
	});

	api.get('/users/image', function(req , res ){
	   if(req.authUser){
	       	res.setHeader('Content-Type', 'image/*');
    		fs.createReadStream(path.join('./uploads/users/profile/images/', req.headers.filename)).pipe(res)
	    }
	});

	api.post('/users/profile' ,function ( req, res, next) {
		userProfileImageUpload(req, res, function (err) {
		    if (err) {
		       res.status(413).send({"error":err});
		    }else{
		    	// Once upload do I/O operations , Save into database
		    	res.status(200).send({"file":req.files});
		    }
		});

		/*if(err){
			console.error(err.stack);
			res.status(413).send('File too large');
		}else{
			console.log(req.files);
			for (var i = 0, len = req.files.avatar.length; i < len; i++) {
			 // console.log(req.files.avatar[i]);
			}

			res.json({error_code:0,err_desc:null, filename: req.files.avatar[req.files.avatar.length - 1 ].filename, message:'file uploaded'});
		}*/

		/*if(typeof req.fileSizeError != "undefined") {
	        res.status(413).send({"error":"File too large"});// to display filesize error
	    } else {
	        res.status(200).send({"file":req.files}); // when file uploaded successfully
	    }*/


		//res.json({error_code:0,err_desc:null, filename: req.files.avatar[req.files.avatar.length - 1 ].filename, message:'file uploaded'});
	  	
	  	/*fs.readFile(req.files.avatar.path, function (err, data) {
		  	var imageName = req.files.avatar.name;
	        if(!imageName){
	            console.log("There was an error")
	            res.end();
	        }else{
	        	var destinationPath = __dirname + "/uploads/users/profile/images/" + imageName;
			  	fs.writeFile(destinationPath, data, function (err) {
			    	res.redirect("back");
			  	});
	        }
		});*/
	});




	return api;
}