'use strict';

var express = require('express');
var mongoose = require('mongoose');
var app = express();

// development only
if ('development' === app.get('env')) {
  app.set('MONGOBD_URI', 'mongodb://localhost:27017/expressnode');
}

// mongo ds011912.mlab.com:11912/expressnode -u <dbuser> -p <dbpassword>
// production only
if ('production' === app.get('env')) {
  app.set('MONGOBD_URI', 'mongodb://amar.du2013:amar.du2013@ds011912.mlab.com:11912/expressnode');
}

// connection setup
mongoose.connect(app.get('MONGOBD_URI'), function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});