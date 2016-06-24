'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// security & validation
var compression = require('compression');
var session = require('express-session');
var csrf = require('csurf');
var helmet = require('helmet');
var validator = require('express-validator');
var pug = require('pug');


var db = require('./config/db');
var secretKEY = require('./config/secret-key');


var routes = require('./routes/index');
var users = require('./routes/users');
var aboutus = require('./routes/aboutus');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// disable X-Powered-By header
app.set('x-powered-by', false);

// Setting for JSON Format
app.set('json spaces', 4);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(cookieParser());
app.use(cookieParser(secretKEY.COOKIES_SECRET));
app.use(compression());
app.use(helmet());
app.use(validator());
app.use(csrf({ cookie: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/public/stylesheets'));
app.use('/img', express.static(__dirname + '/public/images'));
app.use('/js', express.static(__dirname + '/public/javascripts'));

//Security shyts
app.use(helmet());
app.use(helmet.xssFilter({ setOnOldIE: true }));
app.use(helmet.frameguard('deny'));
app.use(helmet.hsts({maxAge: 7776000000, includeSubdomains: true}));
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.noCache());

app.use(session({ 
  secret: process.env.SESSION_SECRET || secretKEY.SESSION_SECRET,
  key: 'sessionID',
  cookie: { httpOnly: true, secure: true, expires: new Date(Date.now() + 60 * 10000), maxAge: 60*10000 }, 
  resave: true, 
  saveUninitialized: true 
}));

//app.use(csrf());

app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrfToken = req.csrfToken();
  next();
});

// routes  
app.use('/', routes);
app.use('/users', users);
app.use('/about-us', aboutus);


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

module.exports = app;