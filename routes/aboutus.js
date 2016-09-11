/*'use strict';

var express = require('express');
var router = express.Router();

router.get('/:filename', function(req, res, next) {
   	var filename = req.params.filename;
  	if(!filename) return;  
  	res.render("partials/" + filename );
});

module.exports = router;
*/