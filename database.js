var User = require('./user.js');
var ObjectId = require('mongodb').ObjectID;
var database = {
    createPlaylist: function(userID, pname, callback) {
        console.log(pname);
		User.find({
            oauthID: userID,
            "playlist.name": pname
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
            if (!user.length) {
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
                        callback({
                            status: "Fail",
                            msg: "Could not add playlist"
                        });
                        return;
                    } else {
                        console.log("adding new playlist ...");
                        callback({
		                    status: "Success"
		                });
		                return;
                    }
                });
                
            } else {
                console.log("imback");
				callback({
                    status: "Fail",
                    msg: "Playlist already exists"
                });
                return;
            }
        });
    },
    listAllPlaylist: function(userID, callback) {
        User.find({
            oauthID: userID
        }, function(err, user) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
                return;
            }
            if(!err && user != null){
                callback({
                    status: "Success",
                    data: user.playlist
                });
                return;
            }
        });
    },
    listAllVideo: function(userID, pname, callback) {
        User.find({
            oauthID: userID 
        },
        {
            playlist: {
                "$elemMatch": {
                    name : "name123"
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
            if(!err && user != null){
                callback({
                    status: "Success",
                    data: user.playlist[0].videos
                });
                return;
            }
        });
    },
    addVideoToPlaylist: function(userID, pname, vid, callback) {
        User.find({
            oauthID: userID,
            "playlist.videos": vid
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
            if (!user.length) {
                User.update({
                        oauthID: userID,
                        "playlist.name": pname
                    }, {
                        "$push": {
                            "playlist.$.videos": vid
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
                        if(!err && user != null){
                            callback({
                                status: "Success"
                            });
                            return;
                        }
            	});
                
            } else {
                console.log("imback");
                callback({
                    status: "Fail",
                    msg: "Video already exists"
                });
                return;
            }
        });
    },
    removePlaylist: function(userID, pname, callback) {
        User.update({
                oauthID: userID,
                "playlist.name": pname
            }, {
                "$pull": {
                    "playlist": pname
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
                if(!err && user != null){
                    callback({
                        status: "Success"
                    });
                    return;
                }
        });
    },
    removeVideoFromPlaylist: function(userID, pname, vid, callback) {
        User.update({
                oauthID: userID,
                "playlist.name": pname
            }, {
                "$pull": {
                    "playlist.$.videos": vid
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
                if(!err && user != null){
                    callback({
                        status: "Success"
                    });
                    return;
                }
        });
    }
};

module.exports = database;
