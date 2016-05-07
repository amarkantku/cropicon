'use strict';

var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/UsersController');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});


router.get('/login', UsersController.login); 
router.post('/login', UsersController.doLogin); 

module.exports = router;
