
module.exports = function(app) {
	'use strict';
	app.io.on('connection',function(socket){
		//socket.broadcast.emit('user connected x');

	  	console.log('New user connected');
		socket.on( 'disconnect', function() {
			console.log('User disconnected');
		});
	});

	/*var nsp = app.io.of( '/about-us' );
		nsp.on( 'connection', function ( socket ) {
			console.log( '[about-us] someone connected' );
	});*/
}