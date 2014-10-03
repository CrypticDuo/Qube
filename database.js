var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
    createPlaylist: function(userID, pname, callback) {
        User.find({
            oauthID: userID,
            playlist: {
                "$elemMatch": {
                    name: pname
                }
            }
        }, function(err, user) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
                return;
            }
            console.log("RESULT : " + user);
            if (!user) {
                User.update({
                    oauthID: userID,
                }, {
                    "$push": {
                        playlist: {
                            name: pname,
                            videos: []
                        }
                    }
                }, function(err, user) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("adding new playlist ...");
                        callback({
                            status: "Fail",
                            msg: "Could not add playlist"
                        });
                        return;
                    }
                });
                callback({
                    status: "Success"
                });
                return;
            } else {
                callback({
                    status: "Fail",
                    msg: "Playlist already exists"
                });
                return;
            }
        });
    },
    listAllPlaylist: function(userID) {
        User.find({
            oauthID: userID
        }, function(err, user) {
            if (err) {
                console.log(err);
            }

            return user;
        });
    },
    addVideoToPlaylist: function(userID, pname, vid) {
        User.update({
                oauthID: userID,
                "playlist.name": pname
            }, {
                "$push": {
                    "playlist.$.videos": vid
                }
            }, function(err, user) {
                if (err) {
                    console.log(err);
                }
        });
};

module.exports = database;
