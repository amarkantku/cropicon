'use strict';
var express = require('express');
var router = express.Router();
var User = require('../models/user');

var UsersController = require('../controllers/UsersController');



/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({},function (err, users) {
    if (err) return next(err);
    res.json(users);

   /* res.render( 'index', {
      title : 'User listing',
      users : users
    });*/
  });
});

/* POST /users */
router.post('/', function(req, res, next) {
  User.create(req.body, function (err, user) {
    if (err) return next(err);
    res.json(user);
  });
});

//router.get('/other', function(req, res, next) {
    router.get('/list', UsersController.ListUser); 
//});


/* GET /users/id */
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function (err, user) {
    if (err) return next(err);
    res.json(user);
  });
});

/* PUT /users/:id */
router.put('/:id', function(req, res, next) {
  User.findByIdAndUpdate(req.params.id, req.body, function (err, user) {
    if (err) return next(err);
    res.json(user);
  });
});

/* DELETE /users/:id */
router.delete('/:id', function(req, res, next) {
  User.findByIdAndRemove(req.params.id, req.body, function (err, user) {
    if (err) return next(err);
    res.json(user);
  });
});


router.get('/adduser/:first/:last/:username/:email', function(req, res){
    var user = {
    	name: { first: req.params.first, last: req.params.last },
      	username: req.params.username,
      	password: 'password',
      	location: 'IN',
        email:req.params.email
    };

    var user = new User(user);
    user.save( function(err, data){
       	if(err){
            res.json(err);
        }else{
            res.json(data);
        }
    });
});


router.get('/check-pwd/:username', function(req, res){
     // fetch user and test password verification
    /*User.findOne({ username: req.params.username }, function(err, user) {
        if (err) throw err;
        // test a matching password
        user.comparePassword('Password123', function(err, isMatch) {
            if (err) throw err;
            console.log('Password123:', isMatch); // -> Password123: false
        });

        // test a failing password
        user.comparePassword('password', function(err, isMatch) {
            if (err) throw err;
            console.log('password:', isMatch); // -> password: true
        });
        res.json(user);
    });*/


     // attempt to authenticate user
    User.getAuthenticated('akash.123', 'password', function(err, user, reason) {
        if (err) throw err;

        // login was successful if we have a user
        if (user) {
            // handle login success
            console.log('login success');
            return;
        }

        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
                console.log('NOT_FOUND');break;
            case reasons.PASSWORD_INCORRECT:
                console.log('PASSWORD_INCORRECT');
                // note: these cases are usually treated the same - don't tell
                // the user *why* the login failed, only that it did
                break;
            case reasons.MAX_ATTEMPTS:
                console.log('MAX_ATTEMPTS');
                // send email or otherwise notify user that account is
                // temporarily locked
                break;
        }
    });
})



router.get('/addhobby/:username/:hobby', function(req, res){
    User.findOne({ username: req.params.username }, function(err, user){
        if (err) res.json(err);
        if(user == null){
            res.json('no such user!')
        }
        else{
            user.hobbies.push({ name: req.params.hobby });
            user.save( function(err, data){
               if(err){
		            res.json(err);
		        }else{
		            res.json(data);
		        }
            });
        }
    });
});



module.exports = router;