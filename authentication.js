var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GithubStrategy = require('passport-github').Strategy;/*
var TwitterStrategy = require('passport-twitter').Strategy;*/
var GoogleStrategy = require('passport-google').Strategy;
var User = require('./user.js');
var config = require('./oauth.js');

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
                    playlist: [
                        {
                            "name" : "Radio",
                            "videos" : [
                                "hT_nvWreIhg",
                                "y6Sxv-sUYtM",
                                "450p7goxZqg",
                                "O-zpOMYRi0w",
                                "zKX_zR022QY",
                                "pB-5XG-DbAA",
                                "nfWlot6h_JM",
                                "qpgTC9MDx1o"
                            ]
                        },
                        {
                            "name" : "Pop",
                            "videos" : [
                                "qpgTC9MDx1o",
                                "iD2rhdFRehU",
                                "SYM-RJwSGQ8",
                                "6ACl8s_tBzE",
                                "e-ORhEE9VVg",
                                "pUjE9H8QlA4",
                                "yw04QD1LaB0",
                                "g5qU7p7yOY8"
                            ]
                        },
                        {
                            "name" : "Country",
                            "videos" : [
                                "BkpuLMsDn48",
                                "mH9kYn4L8TI",
                                "RPILrZTBedY",
                                "_MOavH-Eivw",
                                "BuMiMBjcvWU",
                                "inAj-sbwP7I",
                                "-NPqM3vPDg8"
                            ]
                        },
                        {
                            "name" : "Electronic",
                            "videos" : [
                                "pUjE9H8QlA4",
                                "6ACl8s_tBzE",
                                "m-M1AtrxztU",
                                "L8eRzOYhLuw",
                                "a7SouU3ECpU",
                                "EVr__5Addjw",
                                "HMUDVMiITOU",
                                "VPRjCeoBqrI",
                                "fiore9Z5iUg",
                                "ebXbLfLACGM"
                            ]
                        },
                        {
                            "name" : "Classical",
                            "videos" : [
                                "dyM2AnA96yE",
                                "7jh-E5m01wY",
                                "GRxofEmo3HA",
                                "izQsgE0L450",
                                "qVn2YGvIv0w",
                                "XRU1AJsXN1g",
                                "9E6b3swbnWg"
                            ]
                        },
                        {
                            "name" : "R & B",
                            "videos" : [
                                "cZaJYDPY-YQ",
                                "avFq9errZCk",
                                "k4YRWT_Aldo",
                                "vJwKKKd2ZYE",
                                "wzMrK-aGCug",
                                "9ycBvqm9LFQ",
                                "u3u22OYqFGo",
                                "REcABXTDrwA",
                                "nGt_JGHYEO4",
                                "BU769XX_dIQ"
                            ]
                        }
                    ]
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
                    playlist: []
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

/*passport.use(new TwitterStrategy({
        consumerKey: config.twitter.consumerKey,
        consumerSecret: config.twitter.consumerSecret,
        callbackURL: config.twitter.callbackURL
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
                    name: profile.displayName,
                    created: Date.now()
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
));*/

passport.use(new GoogleStrategy({
        returnURL: config.google.returnURL,
        realm: config.google.realm
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
                    name: profile.displayName,
                    created: Date.now()
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