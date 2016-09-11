"use strict";

/*var express = require('express');
var router = express.Router();
*/
/* GET home page. */
/*router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express'});
});*/

//module.exports = router;


exports.partials = function(req, res){
  var filename = req.params.filename;
  if(!filename) return;  // might want to change this
  res.render("partials/" + filename );
};

exports.index = function(req, res){
  res.render('index', {title: 'Express'});
};
