'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});


router.post('/login', function(req, res){

  req.assert('password', 'Password is required').notEmpty();
  req.assert('email', 'A valid email is required').notEmpty().isEmail();
  var errors = req.validationErrors();
  if (errors)
    res.render('index', {errors: errors});
  else
   //response.render('login', {email: request.email});
    res.render('index', {title: 'Express',email: request.email});
});

module.exports = router;
