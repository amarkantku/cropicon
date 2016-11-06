"use strict";

/* 
 * Methods are used to interact with the current instance of the model."Model" which is used to interact 
 * with that table and Models are defined by passing a Schema instance to mongoose.model.
 */

var jwt      = require('jsonwebtoken');
var fs       = require('fs');
var path     = require('path');


// grab the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Schema   = mongoose.Schema; // Schema is a mongoose method to create database schema .


// no of round , default it is 10
const SALT_WORK_FACTOR = 12;
const MAX_LOGIN_ATTEMPTS = 3;
// resulting in a 2 hour lock
const LOCK_TIME = 2 * 60 * 60 * 1000;


// create a schema
var UserSchema = new Schema({
	username       : { type: String, required: true, unique: true, trim: true },
	email          : { type: String, set: toLower ,  unique: true } ,
    password       : { type: String, required: true , trim: true , select: false },
	role           : { type: String, default:'guest'},
    mobile_no      : { type: String },
	login_attempts : { type: Number, required: true, default: 0 },
    lock_until     : { type: Number },
	verified       : { type: Boolean, default: false },
    is_active      : { type: String, enum: ['Y', 'N'] , default:'Y' },
	created_at     : Date,
	updated_at     : Date,
    deleted_at     : Date
});

/************************ TO CREATE TOKEN and VERIFY TOKEN ********************************************/

function getPrivateCert(callback){
    fs.readFile(path.resolve(__dirname, '../config/private-512.pem'), function read(err, data) {
        if (err) {
            callback(err);
        }else{
            callback(null, data);   
        }
    });
}

function getPublicCert(callback){
    fs.readFile(path.resolve(__dirname, '../config/public-512.pem'), function read(err, data) {
        if (err) {
            callback(err);
        }else{
            callback(null, data);   
        }
    });
}

/***************************************************************************************************/

// a setter method
function toLower (value) {
  return value.toLowerCase();
}


UserSchema.path('role')
    .get(function(value) {
        return value;
    })
    .set(function(value) {
    return value.toLowerCase();
});



UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lock_until && this.lock_until > Date.now());
});



UserSchema.virtual('isActive').get(function() {
    return this.is_active == 'Y' ? true : false;
});



// We can use the Schema pre method to have operations happen before an object is saved

UserSchema.pre('save', function(next) {
	var user = this;
  	var currentDate = new Date();
 
  	// change the updated_at field to current date
  	user.updated_at = currentDate;
	
  	// if created_at doesn't exist, add to that field
  	if(!user.created_at) 
        user.created_at = currentDate;
	
    // if password is not modified , go for next matching route
  	if (!user.isModified('password')) return next();

    // if password is modified or creating new user 
    if (user.isModified('password') || user.isNew) {

        // generate a salt : round[optional] & callback, callback fired once salt has been generated.
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt [data , salt , progress - cb ,callback]
            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) return next(err); 

                // override the cleartext password with the hashed one
                user.password = hash;

                // goto next matching route
                next();
            });
        });  
    }
});


// to compare user password
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


// Increments login attempts
UserSchema.methods.incLoginAttempts = function(cb) {

    // if we have a previous lock that has expired, restart at 1
    if (this.lock_until && this.lock_until < Date.now()) {
        return this.update({
            $set: { login_attempts: 1 },
            $unset: { lock_until: 1 }
        }, cb);
    }

    // otherwise we're incrementing
    var updates = { $inc: { login_attempts: 1 } };
    
    // lock the account if we've reached max attempts and it's not locked already
    if (this.login_attempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lock_until: Date.now() + LOCK_TIME };
    }
    
    return this.update(updates, cb);
};


UserSchema.pre('update', function(next) {
	this.update({},{ $set: { updated_at: new Date() } });
	next();
});

// Methods and Statics ,Each Schema can define instance and static methods for its model.
/*
	Statics are pretty much the same as methods but allow for defining functions that exist 
	directly on your Model.
*/

UserSchema.statics.search = function search (email, callback) {
    return this.where('email', new RegExp(email, 'i')).exec(callback);
}

UserSchema.statics.searchByEmailId = function search (email, callback) {
    return this.where('email', new RegExp(email, 'i')).exec(callback);
}


// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0, PASSWORD_INCORRECT: 1, MAX_ATTEMPTS: 2 , IN_ACTIVE: 3
};

// to check login system & locking protocol
UserSchema.statics.getAuthenticated = function(username, password, cb) {
    
    this.findOne({ username: username }).where('is_active').equals('Y').select('+password').exec(function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            // callback parameter is error, user object and reason text.
            return cb(null, null, reasons.NOT_FOUND);
        }

        if(!user.isActive){
            return cb(null, null, reasons.IN_ACTIVE);
        }

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.login_attempts && !user.lock_until) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { login_attempts: 0 },
                    $unset: { lock_until: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};


// To create token after successful login 
UserSchema.statics.createToken = function(user, cb) {

    // Get private certificate to generate token for loggedin user
     getPrivateCert(function(error, privateCert){
        if(privateCert){

            // Sign Token with RSA-256 Algorithm
            jwt.sign(user, privateCert, { algorithm: 'RS256' }, function(err, token) {

                // If error then return error 
                if (err) return cb(err);

                // If not error & token signed successfully return token 
                if(token){
                    return cb(null, token);
                } 
            });  
        }else{
            // If unable to open private certificate file , return error to callback function 
            return cb(error);
        }
    });
}


// To verify token on request
UserSchema.statics.verifyToken = function(token, cb) {

    // Get public certificate to verify token 
     getPublicCert(function( error, publicCert){

        // If certificate found , verify input token from request & return palyload to move next request 
        if(publicCert){

            // Verify token using public certifcate & RSA-256 Algorithm
            jwt.verify(token, publicCert,{ algorithm: 'RS256' }, function (err, payload) {

                // If error , return err
                if (err) return cb(err);

                // if successfully verified , return payload to requested client.
                if(payload){
                    return cb(null, payload);
                } 
            });  
        }else{

            // Unable to open public certificate key file
            return cb(error);
        }
    });
}




UserSchema.on('init', function (model) {
    // do stuff with the model, 
    // the init event will be emitted on the schema, passing in the model. This is helpful for some plugins that need to hook directly into the model.
    console.log('UserSchema is on...');
});



// the schema is useless so far we need to create a model using it
// UserSchema is <a Schema> of type User
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;


/* TIPS: */

// Mongoose middleware is not invoked on update() operations, so you must use a save() if you want to update user passwords.