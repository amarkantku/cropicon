"use strict";

var User = require('../models/user');

exports.ListUser = function(req, res, next){
    /*User.search('rakesh', function (err,users) {
        if (err) return next(err);
        res.json(users);
    })*/
    

	User.find({}).select('-password').exec(function (err, users) {
        if (err) return next(err);
        res.json( {success: true ,count:users.length, results: users});
    });
};


// To render login page view
exports.login = function(req, res){
    res.render( 'users/login', { title : 'Login'});
};


exports.doLogin = function(req, res, next){

    req.assert('password', 'Password is required').notEmpty();
	req.assert('email', 'Email is required').notEmpty();
    req.assert('email', 'A valid email is required').isEmail();

	var errors = req.validationErrors();
	if (errors){
        res.render('users/login', {title : 'Login', errors: errors , email:req.body.email });
    }else{
        // attempt to authenticate user
        User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
            if (err) throw err;

            // login was successful if we have a user
            if (user) {
                // handle login success
                console.log('login success');
                //req.session.user = user;
                return res.redirect('/');   
            }

            // otherwise we can determine why we failed
            var reasons = User.failedLogin;
            switch (reason) {
                case reasons.NOT_FOUND:
                    console.log('NOT_FOUND');
                    break;

                case reasons.PASSWORD_INCORRECT:
                    console.log('PASSWORD_INCORRECT');
                    // note: these cases are usually treated the same - don't tell
                    // the user *why* the login failed, only that it did
                    break;

                case reasons.MAX_ATTEMPTS:
                    console.log('MAX_ATTEMPTS');
                    // send email or otherwise notify user that account is temporarily locked
                    break;
            }
        });
    }  
};

// GET user sign-up form
exports.signUp = function(req, res){
    res.render('users/sign-up', { title: 'Create user', buttonText: "Join!" });
};