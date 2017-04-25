"use strict";
var http            = require('http');
var path 			= require('path');
var fs 				= require('fs');
var crypto 			= require('crypto');
var moment          = require('moment');
var request 		= require('request');
var nodemailer 		= require("nodemailer");
var xoauth2 		= require('xoauth2');

var readline 		= require('readline');
var google 			= require('googleapis');
var googleAuth 		= require('google-auth-library');

	
var db 				= require('../config/db');
var User 			= require('../models/user');
var UserProfile 	= require('../models/user_profile');

// var utc = moment.utc().valueOf();
// console.log(moment.utc(utc).toDate());


/*var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    service: "Gmail",
    secure: true, // use SSL 
    auth: {
       user: "amarkantk14@gmail.com",
       pass: ""
   	}
};

*/	//var transporter = nodemailer.createTransport(smtpConfig);

/*var smtpTransport = nodemailer.createTransport("SMTP",{
	service: "Gmail",  // sets automatically host, port and connection security settings
   	auth: {
       user: "amarkantk14@gmail.com",
       pass: ""
   	}
});
*/



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
		console.log(req.sessionID);
		// req.session.userId = 1234;

		res.json(req.session);
	  	// check user exist ? 
	  	//req.checkBody("leader_mobile_no", "Enter a valid phone number.").isMobilePhone("en-IN");


	  	// if user doesn't exist , create new user
	});
 
	api.get('/send-mail', function(req , res ){

		var SCOPES = [
				'https://mail.google.com/',
				'https://www.googleapis.com/auth/gmail.readonly',
				'https://www.googleapis.com/auth/plus.me',
  				'https://www.googleapis.com/auth/calendar',
  				'https://www.googleapis.com/auth/gmail.modify',
    			'https://www.googleapis.com/auth/gmail.compose',
    			'https://www.googleapis.com/auth/gmail.send'
			];

		var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/cropicon/.credentials/';
		var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';


// Load client secrets from a local file.

		fs.readFile(path.resolve(__dirname, '../config/client_secret.json'), function processClientSecrets(err, content) {
		  if (err) {
		    console.log('Error loading client secret file: ' + err);
		    return;
		  }
		  //sconsole.log(JSON.parse(content));
		  // Authorize a client with the loaded credentials, then call the
		  // Gmail API.
		  authorize(JSON.parse(content), listLabels);
		});




/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */



		function authorize(credentials, callback) {
		  var clientSecret = credentials.web.client_secret;
		  var clientId = credentials.web.client_id;
		  var redirectUrl = credentials.web.redirect_uris['0'];
		 // console.log(credentials.web.redirect_uris[0]);

		  var auth = new googleAuth();
		  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

		  // Check if we have previously stored a token.
		  fs.readFile(TOKEN_PATH, function(err, token) {
		    if (err) {
		      getNewToken(oauth2Client, callback);
		    } else {
		      oauth2Client.credentials = JSON.parse(token);
		      callback(oauth2Client);
		    }
		  });
		}
/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url: ', authUrl);

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}


/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function listLabels(auth) {
  var gmail = google.gmail('v1');
  gmail.users.labels.list({
    auth: auth,
    userId: 'me',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    console.log(response)
    var labels = response.labels;
    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('- %s', label.name);
      }
    }
  });
}




/*
		var transporter = nodemailer.createTransport({
    		service: 'gmail',
    		auth: {
        		xoauth2: xoauth2.createXOAuth2Generator({
        			scope: 'https://mail.google.com/',
            		user: "amarkantk14@gmail.com", 
			    	clientId: "",
			    	clientSecret: "",
            		refreshToken: "",
            		accessToken: ""
        		})
    		}
		});


		var mailOptions = {
			from: "Amarkant Kumar<amarkantk14@gmail.com>",
			to: "Amarkant Kumar <amar.du2013@gmail.com>",
			subject: "Hello",
			generateTextFromHTML: true,
			html: "<b>Hello world</b>"
		};


		transporter.sendMail(mailOptions, function(error, response) {
			  if (error) {
			    console.log(error);
			  } else {
			    console.log(response);
			  }
		});*/
	});

 	// route for logging out
    api.get('/logout', function(req, res) {
       /* req.logout();
        res.redirect('/');*/
    });



	// To login existing user into application 
	api.post('/users/login', function(req , res ){

		req.sanitize('password').trim();
		req.assert('password', 'Password is required').notEmpty();
		req.assert('password', '6 to 10 characters required').len(6, 10);

		req.sanitize('email').trim();
		req.assert('email', 'Email is required').notEmpty();
    	req.assert('email', 'A valid email is required').isEmail();

    	// req.assert("mobile_no", "Enter a valid phone number.").isMobilePhone("en-IN");

    	// req.assert("xd", "Enter a valid xd number.").isAlpha();

    	//req.assert(['admins', '0', 'name'], 'must only contain letters').isAlpha();

			




		var errors = req.validationErrors();
		if (errors){
        	res.status(httpResponseCode.BAD_REQUEST).send({ success:false,code: "400XXX" ,message:"Invalid state !", errors: errors } );
    	}else{

    		let email = req.params.email || req.query.email || req.body.email;
    		let password = req.params.password || req.query.password || req.body.password;

    		User.getAuthenticated(email,password, function(err, user, reason) {
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
	                		res.status(httpResponseCode.OK).send({success:true,code: "200XXX", message:"Successfuly login!", data:{token:token,email:req.body.email,user_id:user._id} });
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
		            res.json({ success:false, code: statusCode+'XXX', message: message, data:[{email:req.body.email,password:''}]});
	            }
	        });
    	}	    
	});


	/**************************Middleware****************************/

	api.use(function(req, res, next){

		// To read token from request object 
		var token = req.body.token || req.params.token || req.headers['x-access-token'] || req.query.token;

		// If token is not empty or null or undefined 
		if(token){

			// To verify token is valid or not 
			User.verifyToken(token,function(err, payload){
				if(err){
					if(err.code == 'ENOENT' && err.errno == -2){
						// Unavailable to open key certificate file 
						delete err.path;
						res.json({success:false,code: httpResponseCode.BAD_REQUEST+"XXX",message:"Token passcode not found, User authentication failed.", errors : err});
					}else{		
						// If token is invalid 
						res.json({success:false,code: httpResponseCode.BAD_REQUEST+"XXX",message:"Invalid token, User authentication failed.", errors : err});
					}
				}

				// If token is valid & passed without any error
	            req.authUser = payload;

	            // To execute next matching route
	            next();
        	});
		}else{
			res.json({success:false,code: httpResponseCode.BAD_REQUEST+"XXX",message:"No Token Provided."});
		}
	});


	/**************************Middleware end***********************/

	api.get('/users/me', function(req , res ){

		/*var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log(ip);
		console.log(req.connection.remoteAddress);*/

        if(req.authUser){
        	 User.findOne({_id: req.authUser._id}).select('-password').exec(function(err, user) {
        		if(err){
        			res.json({success:false,code: httpResponseCode.BAD_REQUEST+"XXX",message:"Something went wrong."});
        		}else{
        			res.json({ success:true, code: httpResponseCode.OK+'XXX', message: 'User records found.', user: user})
        		}
        	});
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
		    	let profileInfo = new UserProfile({
					user_id : req.authUser._id,
					images_path : req.files.avatar[0].path,
					images_name	: req.files.avatar[0].originalname	    		
		    	});

		    	UserProfile.findOne({user_id:req.authUser._id} , function(err , profile){
		    		if(err) res.send(err);
		    		if(profile){
		    			profile.images_path= req.files.avatar[0].path;
		    			profile.images_name= req.files.avatar[0].originalname;
		    			
		    			profile.save(function(err , profile){
		    				if(err) {
		    					res.send(err);
		    				}else{
		    					res.send(profile);
		    				}
		    				
		    			});
		    		}else{
		    			profileInfo.save(function(err , profile){
		    				if(err) {
		    					res.send(err);
		    				}else{
		    					res.send(profile);
		    				}
		    				
		    			});
		    		}
		    	});
		    }
		});
	});

	return api;
}
