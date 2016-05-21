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
/*mongoose.connect(app.get('MONGOBD_URI'), function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});*/

var connectToMongoDB = function() {
  	return mongoose.connect(app.get('MONGOBD_URI'), function(err) {
	    if(err) {
	        console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
      		setTimeout(connectToMongoDB, 5000);
	    } else {
	        console.log('connection successful');
	    }
	});
};

mongoose.connection.on('connected', function () {
	console.log('Mongoose connected');
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  	console.log('Mongoose default connection disconnected'); 
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', function() {  
	mongoose.connection.close(function () { 
    	console.log('Mongoose default connection disconnected through app termination'); 
    	process.exit(0); 
  	}); 
}); 

connectToMongoDB();