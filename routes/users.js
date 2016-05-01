'use strict';
var express = require('express');
var router = express.Router();
var User = require('../models/user');


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


router.get('/adduser/:first/:last/:username', function(req, res){
    var user = {
    	name: { first: req.params.first, last: req.params.last },
      	username: req.params.username,
      	password: 'password',
      	location: 'IN'
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