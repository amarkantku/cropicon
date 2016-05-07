// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Hobby = new Schema({
    name: { type: String, required: true, trim: true }
});

// create a schema
var UserSchema = new Schema({
	name: {
	        first: { type: String, required: true, trim: true },
	        last: { type: String, trim: true }
		},
	username: { type: String, required: true, unique: true, trim: true },
	password: { type: String, required: true , trim: true },
	email: { type: String, set: toLower ,unique: true } ,
	location: String,
	hobbies: [Hobby],
	created_at: Date,
	updated_at: Date
});


function toLower (v) {
  return v.toLowerCase();
}



// We can use the Schema pre method to have operations happen before an object is saved
// to add to our Schema to have the date added to created_at if this is the first save, and to updated_at on every save.

UserSchema.pre('save', function(next) {
  // to know when the record was created, get the current date
  var currentDate = new Date();
 
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;
  
  next();
});



// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', UserSchema);

// make this available to our users in our Node applications
module.exports = User;
