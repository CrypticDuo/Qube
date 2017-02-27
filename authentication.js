var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var User = require('./user.js');
var config = require('./oauth.js');

var defaultPlaylist = [
                        {
                            "name" : "Pop Music",
                            "videos" : [
                                "JGwWNGJdvx8",
                                "FM7MFYoylVs",
                                "D5drYkLiLI8",
                                "7F37r50VUTQ",
                                "8gsGhdZDC-0",
                                "34Na4j8AVgA",
                                "UqyT8IEBkvY",
                                "YQHsXMglC9A"
                            ]
                        },
                        {
                            "name" : "Jimmy Fallon",
                            "videos" : [
                                "2OFKM2G-dE8",
                                "RYI8KU7PKc0",
                                "7PzjIXixe24",
                                "wkSYGykMiwE",
                                "0Yw-U34X4sc",
                                "0PRFAh602kU",
                                "svOElhHUb38"
                            ]
                        },
                        {
                            "name" : "BuzzFeed",
                            "videos" : [
                                "5SSfwEuP6xU",
                                "YK4ptwHgIJo",
                                "R-uJviYD2T4",
                                "1vARrao4HH8",
                                "w2-FtU2pZes",
                                "Q8IWkdGLm70",
                                "n0tAXKkfvxk"
                            ]
                        }
                     ];

// config
module.exports = passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile.displayName + " has logged in.");
        User.findOne({
            oauthID: profile.id
        }, function(err, user) {
            if (err) {
                console.log(err);
            }
            if (!err && user != null) {
                done(null, user);
            } else {
                var user = new User({
                    oauthID: profile.id,
                    facebookID: profile._json.id,
                    name: profile.displayName,
                    created: Date.now(),
                    lastLogin: Date.now(),
                    loginCount: 0,
                    playlist: defaultPlaylist
                });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("saving user ...");
                        done(null, user);
                    };
                });
            };
        });
    }
));

module.exports = passport.use(new GithubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
        console.log(profile.displayName + " has logged in.");
        User.findOne({
            oauthID: profile.id
        }, function(err, user) {
            if (err) {
                console.log(err);
            }
            if (!err && user != null) {
                done(null, user);
            } else {
                var user = new User({
                    oauthID: profile.id,
                    facebookID: profile._json.id,
                    name: profile.displayName,
                    created: Date.now(),
                    lastLogin: Date.now(),
                    loginCount: 0,
                    playlist: defaultPlaylist
                });
                user.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("saving user ...");
                        done(null, user);
                    };
                });
            };
        });
    }
));
