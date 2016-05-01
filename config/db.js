var mongoose = require('mongoose');

// mongo ds011912.mlab.com:11912/expressnode -u <dbuser> -p <dbpassword>
// mongodb://localhost:27017/expressnode
mongoose.connect('mongodb://amar.du2013:amar.du2013@ds011912.mlab.com:11912/expressnode', function(err) {
    if(err) {
        console.log('connection error', err);
    } else {
        console.log('connection successful');
    }
});