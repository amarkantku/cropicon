'use strict';

var express       	= require('express');
var http            = require("http");
var path          	= require('path');
var fs            	= require('fs');
var favicon       	= require('serve-favicon');
var logger        	= require('morgan');
var cookieParser  	= require('cookie-parser');
var bodyParser    	= require('body-parser');
var multer        	= require('multer');
var methodOverride  = require('method-override');
  

// security & validation
var compression   	= require('compression');
var session       	= require('express-session');
var csrf          	= require('csurf');
var helmet        	= require('helmet');
var validator     	= require('express-validator');
var pug           	= require('pug');
var secretKEY 		  = require('./config/secret-key');






// To include response time header in client request
var responseTime    = require('response-time');


// https://redislabs.com/node-js-redis 
// To redis cache 

var redis           = require('redis');



// create a new redis client and connect to our local redis instance
var redisClient = redis.createClient();


// if an error occurs, print it to the console
redisClient.on('error', function (err) {
  // To install => sudo apt-get install redis-server
  // To check => sudo service redis-server status

    console.log("Error " + err);
});

redisClient.on('ready',function() {
 console.log("Redis is ready");

});


redisClient.set("language","nodejs",function(err,reply) {
 console.log(err);
 console.log(reply);
});


redisClient.get("language",function(err,reply) {
  //  client.setex(username, 60, totalStars); // set expiry of 1 minute
 console.log(err);
 console.log(reply);
});



redisClient.hmset("tools","webserver","expressjs","database","mongoDB","devops","jenkins",function(err,reply){
 console.log(err);
 console.log(reply);
});

redisClient.hgetall("tools",function(err,reply) {
 console.log(err);
 console.log(reply);
});


redisClient.exists('language',function(err,reply) {
 if(!err) {
  if(reply === 1) {
   console.log("Key exists");
  } else {
   console.log("Does't exists");
  }
 }
});


redisClient.del('redisClient',function(err,reply) {
 if(!err) {
  if(reply === 1) {
   console.log("Key is deleted");
  } else {
   console.log("Does't exists");
  }
 }
});




// https://codeforgeek.com/2016/06/node-js-redis-tutorial-installation-commands/





// For socket connection 
var app           	= express();
	app.io        	  = require('socket.io')();

var routes        	= require('./routes/index');
var users         	= require('./routes/users');
var api           	= require('./routes/api')(app, express, multer);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// disable X-Powered-By header
app.set('x-powered-by', false);

// Setting for JSON Format
app.set('json spaces', 4);

// uncomment after placing your favicon in /public

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(secretKEY.APP_SECRET));
app.use(compression());
app.use(helmet());
app.use(validator());


app.use(express.static(path.join(__dirname, 'public'),{ maxAge: 864000000 }));

/*app.get('/*', function (req, res, next) {
  if (req.url.indexOf("/images/") === 0 || req.url.indexOf("/stylesheets/") === 0) {
    res.setHeader("Cache-Control", "public, max-age=2592000");
    res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
  }
  next();
});*/

app.use('/img', express.static(__dirname + '/public/images'));
app.use('/ngs', express.static(__dirname + '/public/angular',{
  maxAge: 86400000,
  setHeaders: function(res, path) {
    res.setHeader('Cache-Control', 'public, max-age=345600'); // 4 days = 4*864000
    res.setHeader('Expires', new Date(Date.now() + 31556952000).toUTCString());
  }
}));
app.use('/js', express.static(__dirname + '/public/javascripts',{
  maxAge: 86400000,
  setHeaders: function(res, path) {
    res.setHeader('Cache-Control', 'public, max-age=345600'); // 4 days = 4*864000
    res.setHeader('Expires', new Date(Date.now() + 31556952000).toUTCString());
  }
}));
app.use('/socket', express.static(__dirname + '/public/javascripts/socket.io'));
app.use('/css', express.static(__dirname + '/public/stylesheets',{
  maxAge: 86400000,
  setHeaders: function(res, path) {
    res.setHeader('Cache-Control', 'public, max-age=345600'); // 4 days = 4*864000
    res.setHeader('Expires', new Date(Date.now() + 31556952000).toUTCString());
  }
}));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));


//app.use(csrf({ cookie: true }));

//	Security shyts
// 	app.use(helmet());
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(helmet.frameguard('deny'));
app.use(helmet.hsts({maxAge: 7776000000, includeSubdomains: true}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.noCache());

var sessObj = { 
  secret: process.env.APP_SECRET || secretKEY.APP_SECRET,
  name: 'session_id',
  cookie: { httpOnly: true, expires: new Date(Date.now() + 60 * 60 * 1000), maxAge: 60 * 60 * 1000 },
  resave: false,
  saveUninitialized: true 
};


if(app.get('env') === 'production'){
  app.set('trust proxy', 1)
  sessObj.cookie.secure = true;
}else if(app.get('env') === 'development'){
  sessObj.cookie.secure = false;
}
app.use(session(sessObj));


fs.readFile('/etc/hosts', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});


fs.readdir(process.cwd(), function (err, files) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(files);
});







// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

app.use(function(req,res,next ){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers','Content-Type');
  res.header('X-Powered-By', 'FreeScript');
  next();
});

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))


// set up the response-time middleware
app.use(responseTime());


// APIes Route
app.use('/api/v1',api);

app.use(csrf({ cookie: true }));

var time = Date.now || function() { 
  return +new Date;
};
app.locals.version = time();


app.use(function (req, res, next) {
  var token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token,{secure:true});
  res.locals.csrfToken = token;
  next();
});

// routes  
app.get('/partials/:filename', routes.partials);
app.get('/users/:filename', users.actions);
app.use(routes.index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	  message: err.message,
	  error: err
	});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
	message: err.message,
	error: {}
  });
});

var socketio = require('./socket/io')(app);
module.exports = app;