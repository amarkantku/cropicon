"use strict";

var router = require('express').Router(),
    UsersController = require('../controllers/UsersController');

router.get('/login', UsersController.login); 
router.post('/login', UsersController.doLogin); 

router.get('/list', UsersController.ListUser);
router.get('/sign-up', UsersController.signUp); 

module.exports = router;