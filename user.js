var mongoose = require('mongoose');

// create a user model
var User = mongoose.model('User', {
    oauthID: Number,
    facebookID: Number,
    name: String,
    created: Date,
    lastLogin: Date,
    loginCount: Number,
    userName: String,
    playlist: [{
            isDefault: false,
    		name: String,
    		videos:[String],
            isPublic: Boolean,
            isDefault: false,
            likes:[String],
            followers:[String],
            count: Number
    	}
    ]
});

module.exports = User;
