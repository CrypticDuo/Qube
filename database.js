var User = require('./user.js');

var database = {
    createPlaylist: function(userID, pname, callback) {
    if(!pname){
        callback({
            status: "Fail",
            msg: "Playlist name cannot be empty"
        });
        return;
    }
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
                    msg: "Error: Playlist already exists."
                });
                return;
            }
        });
    },
    listAllPlaylists: function(userID, callback) {
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
                    data: user[0].playlist
                });
                return;
            }
        });
    },
    listAllVideos: function(userID, pname, callback) {
        User.find({
            oauthID: userID
        },{
            playlist: {
                "$elemMatch": {
                    name : pname
                }
            }
        }, function(err, playlist) {
            if (err || playlist.length == 0) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "Error: Cannot list videos"
                });
                return;
            }
            if(!err && playlist){
                console.log(playlist);
                callback({
                    status: "Success",
                    data: playlist[0].videos
                });
                return;
            }
        });
    },
    addVideoToPlaylist: function(userID, pname, vid, callback) {
        User.find({
            oauthID: userID,
            playlist: {
                "$elemMatch": {
                    name: pname,
                    videos: vid
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
                    msg: "Error: Video already exists."
                });
                return;
            }
        });
    },
    removePlaylist: function(userID, pname, callback) {
        User.update({
                oauthID: userID,
                "playlist.name": pname
            },
            {
                "$pull": {
                    "playlist": {
                        name:pname
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
                        status: "Success"
                    });
                    return;
                }
        });
    },
    updatePlaylist: function(userID, list, callback){
        User.update({
            oauthID: userID
        }, {
            "$set": {
                "playlist" : list
            }
        }, function(err, user){
            if(err) {
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
    },
    updateVideoList: function(userID, pname, list, callback){
        User.update({
            oauthID: userID,
            "playlist.name": pname
        }, {
            "$set": {
                "playlist.$.videos" : list
            }
        }, function(err, user){
            if(err) {
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
