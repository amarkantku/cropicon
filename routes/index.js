"use strict";

exports.partials = function(req, res){
  var filename = req.params.filename;
  if(!filename) return;  // might want to change this
  res.render("partials/" + filename );
};

exports.index = function(req, res){
  res.render('index', {title: 'Express'});
};
