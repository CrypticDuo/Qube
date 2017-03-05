var mongoose = require('mongoose');

// create a user model
var User = mongoose.model('User', {
    oauthID: Number,
    facebookID: Number,
    name: String,
    created: Date,
    lastLogin: Date,
    loginCount: Number,
    playlist: [
    	{
    		name: String,
    		videos:[String]
    	}
    ]
});

module.exports = User;
