var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var User = require('./user.js');
var config = require('./oauth.js');

var defaultPlaylist = [
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
                            ],
                            isPublic : false,
                            count : 0
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
                            ],
                            isPublic : false,
                            count : 0
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
                            ],
                            isPublic : false,
                            count : 0
                        },
                        {
                            "name" : "Electronic",
                            "videos" : [
                                "K_yBUfMGvzc",
                                "ZvdgyppHp3w",
                                "AW7O0KFpVX4",
                                "maeYZ-dE458",
                                "QvFqyn4kWJk",
                                "ovDcLHa2L1o",
                                "XMJxSM_TBgo",
                                "12W8DtQwWYA",
                                "zq2I6oBeibg",
                                "xWH6mVOZxK8",
                                "auqFostuqUk",
                                "_snOoa8fR4s",
                                "y-75n7PgqxQ",
                                "cXh9QkDigfA",
                                "ZwOVOSi-5nc",
                                "u-VKRbGvg2s",
                                "SrWWl6KEdmo",
                                "LzZdhWkq2HA",
                                "ZaSh4XCyVqU",
                                "IgGjUjQRAxw",
                                "BQwiYUHEePA"
                            ],
                            isPublic : false,
                            count : 0
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
                            ],
                            isPublic : false,
                            count : 0
                        },
                        {
                            "name" : "R & B",
                            "videos" : [
                                "JPIhUaONiLU",
                                "VJOdTVnDCSQ",
                                "REoFWyu4LaI",
                                "fxPBu_vX9Q0",
                                "nxvm4P0jFKY",
                                "ueR5gE4aCW0",
                                "eNogqBij198",
                                "sfBi4H8F5JE",
                                "CEavc5AIRRg",
                                "KrRpGSgkQHI",
                                "m_8B9ZSGNZ0"
                            ],
                            isPublic : false,
                            count : 0
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
                    loginCount: 1,
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
                    loginCount: 1,
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