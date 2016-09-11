"use strict";

exports.actions = function(req, res){
	var filename = req.params.filename;
  	if(!filename) return;
  	res.render("users/" + filename );
};