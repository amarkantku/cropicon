"use strict";

/*

Methods are used to to interact with the current instance of the model.
"Model" which is used to interact with that table

Models are defined by passing a Schema instance to mongoose.model.

*/

// grab the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

// no of round , default it is 10
const SALT_WORK_FACTOR = 12;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 2 * 60 * 60 * 1000;


var Hobby = new Schema({
    name: { type: String, required: true, trim: true }
});

// create a schema
var UserSchema = new Schema({
	name: {
	        first: { 
	        	type: String, 
	        	required: true, 
	        	trim: true,
	        	validate: /[ A-Za-z]/
	        },
	        last: { 
	        	type: String, 
	        	trim: true 
	        }
		},
	username: { 
		type: String, 
		required: true, 
		unique: true, 
		trim: true 
	},
	password: { 
		type: String, 
		required: true , 
		trim: true 
	},
	email: { 
		type: String, 
		set: toLower , 
		unique: true 
	} ,
	email_list: {
        type: [String],
        unique: true,
        default : ['john@doe.com', 'foo@bar.com']
    },
	role: {
		type:String,
		default:'guest'
	},
	gender: { 
		type: String, 
		enum: ['M', 'F', 'T'] ,
		default:'M' 
	},
	address: String,
    phone: {
    	type:String
    },
	dob : { 
		type: Date, 
		default: Date.now 
	},
	login_attempts: { 
		type: Number, 
		required: true, 
		default: 0 
	},
    lock_until: { 
    	type: Number 
    },
	location: String,
	hobbies: [Hobby],
	created_at: Date,
	updated_at: Date
});


// a setter

function toLower (v) {
  return v.toLowerCase();
}

UserSchema.path('role')
    .get(function(value) {
        return value;
    })
    .set(function(value) {
    return value.toUpperCase();
});


UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lock_until && this.lock_until > Date.now());
});

// We can use the Schema pre method to have operations happen before an object is saved
// to add to our Schema to have the date added to created_at if this is the first save, and to updated_at on every save.

UserSchema.pre('save', function(next) {
	var user = this;
  	var currentDate = new Date();
 
  	// change the updated_at field to current date
  	user.updated_at = currentDate;
	
  	// if created_at doesn't exist, add to that field
  	if(!user.created_at)
  	 	user.created_at = currentDate;
	
  	if (!user.isModified('password')) return next();

    if (user.isModified('password') || user.isNew) {
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password using our new salt
            bcrypt.hash(user.password, salt,null, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });  
    }else{
        return next();
    }
  	
});

// to compare user password
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    // Asynchronous call 
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

// Statics 
/*
	Statics are pretty much the same as methods but allow for defining functions that exist 
	directly on your Model.
*/

UserSchema.statics.search = function search (name, callback) {
  return this.where('name.first', new RegExp(name, 'i')).exec(callback);
}

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,PASSWORD_INCORRECT: 1, MAX_ATTEMPTS: 2
};

// to check login system & locking protocol
UserSchema.statics.getAuthenticated = function(username, password, cb) {
    this.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
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


UserSchema.statics.createUser = function(callback) {
	 var user = {
    	name: { first: 'Rakesh', last: 'Kumar' },
      	username: 'rakesh.789',
      	password: 'kumar@789',
      	location: 'IN',
        email:'rakesh.789@gmail.com',
        role:'admin',
    };

   var user = new User(user);
   user.save(callback);
};



UserSchema.on('init', function (model) {
  // do stuff with the model, 
  // the init event will be emitted on the schema, passing in the model. This is helpful for some plugins that need to hook directly into the model.
  console.log('UserSchema is on...');
});


// the schema is useless so far
// we need to create a model using it
// UserSchema is <a Schema> of type User
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;



/* TIPS: */

// Mongoose middleware is not invoked on update() operations, so you must use a save() if you want to update user passwords.
