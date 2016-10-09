"use strict";

var mongoose = require('mongoose');
var Schema   = mongoose.Schema; 

var UserProfileSchema = new Schema({
    user_id     : { type : Schema.Types.ObjectId , ref : 'User'},
    images_name : { type : String},
    images_path	: {	type : String},
    created_at  : { type : Date , default : Date.now },
    updated_at  : { type : Date , default : Date.now },
});

UserProfileSchema.pre('update', function(next) {
	this.update({},{ $set: { updated_at: new Date() } });
	next();
});

UserProfileSchema.on('init', function (model) {
    console.log('UserProfileSchema is on...');
});

var UserProfile = mongoose.model('UserProfile', UserProfileSchema);
module.exports = UserProfile;