var mongoose = require('mongoose');

// create a user model
var User = mongoose.model('User', {
    oauthID: Number,
    facebookID: Number,
    name: String,
    created: Date,
    playlist: [
    	{
    		name: String,
    		videos:[String]
    	}
    ]
});

module.exports = User;