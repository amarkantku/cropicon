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
var routes = require('./routes/index');
var users = require('./routes/users');
var aboutus = require('./routes/aboutus');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(cookieParser());
app.use(cookieParser('FE268B42-BA94-D3C1-B080-B85ADFDAF7FD'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(helmet());
app.use(validator());
app.use(csrf({ cookie: true }));

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
  secret: 'B8C7682F9668B22760FBA9456B0D3C105ADF6310',
  key: 'sessionId' ,
  cookie: { 
    httpOnly: true, secure: true
  }, 
  resave: true, 
  saveUninitialized: true 
}));

//app.use(csrf());

/**
 * disable X-Powered-By header
 * app.disable('x-powered-by');
 */

app.set('x-powered-by', false);

// Setting for JSON Format
app.set('json spaces', 4);


app.use(function (req, res, next) {
 // var token = req.csrfToken();
  res.cookie('XSRF-TOKEN', req.csrfToken());
  res.locals.csrfToken = req.csrfToken();
  console.log('%s %s — %s', (new Date).toString(), req.method, req.url);
  console.log(app.get('env'));
  next();
});


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
