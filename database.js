var mongoose = require('mongoose');
var User = require('./user.js');

var database = {
    createPlaylist: function(userID, pname, callback) {
        if (!pname) {
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
            if (!user.length) {
                User.update({
                    oauthID: userID,
                }, {
                    "$push": {
                        playlist: {
                            name: pname,
                            videos: [],
                            isPublic: false,
                            count: 0
                        }
                    }
                }, function(err, result) {
                    if (err) {
                        console.log(err);
                        callback({
                            status: "Fail",
                            msg: "Could not add playlist"
                        });
                    } else if (!err && result !== 0) {
                        console.log("adding new playlist ...");
                        callback({
                            status: "Success"
                        });
                    } else {
                        callback({
                            status: "Fail",
                            msg: "Could not add playlist"
                        });
                    }
                });

            } else {
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
            if (!err && user != null) {
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
        }, {
            playlist: {
                "$elemMatch": {
                    name: pname
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
            if (!err && playlist) {
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
            if (!user.length) {
                User.update({
                    oauthID: userID,
                    "playlist.name": pname
                }, {
                    "$push": {
                        "playlist.$.videos": vid
                    }
                }, function(err, result) {
                    if (err) {
                        console.log("ERROR : " + err);
                        callback({
                            status: "Fail",
                            msg: "User not found"
                        });
                    } else if (!err && result && result !== 0) {
                        callback({
                            status: "Success"
                        });
                    } else {
                        callback({
                            status: "Fail",
                            msg: "Failed to add video to playlist"
                        });
                    }
                });

            } else {
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
        }, {
            "$pull": {
                "playlist": {
                    name: pname
                }
            }
        }, function(err, result) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (!err && result && result !== 0) {
                callback({
                    status: "Success"
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to remove playlist"
                });
            }
        });
    },
    updatePlaylist: function(userID, list, callback) {
        User.update({
            oauthID: userID
        }, {
            "$set": {
                "playlist": list
            }
        }, function(err, result) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
                return;
            } else if (!err && result && result !== 0) {
                callback({
                    status: "Success"
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to update playlist"
                });
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
        }, function(err, result) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (!err && result && result !== 0) {
                callback({
                    status: "Success"
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to remove video from playlist"
                });
            }
        });
    },
    updateVideoList: function(userID, pname, list, callback) {
        User.update({
            oauthID: userID,
            "playlist.name": pname
        }, {
            "$set": {
                "playlist.$.videos": list
            }
        }, function(err, result) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (!err && result && result !== 0) {
                callback({
                    status: "Success"
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to update video list"
                });
            }
        });
    },

    updateLoginData: function(userID, callback) {
        var id = "";
        User.findOne({
            oauthID: userID
        }, function(err, user) {
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
                return;
            } else {
                id = user._id;
            }
        });

        User.update({
            oauthID: userID
        }, {
            "$inc": {
                loginCount: 1
            },
            lastLogin: Date.now()
        }, function(err, result) {
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (!err && result && result !== 0) {
                callback({
                    status: "Success",
                    ID: id
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to update login data"
                });
            }
        });
    },

    getGlobalPlaylists: function(callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $match: {
                $and: [{
                    "playlist.name": {
                        $ne: "Radio"
                    }
                }, {
                    "playlist.name": {
                        $ne: "Pop"
                    }
                }, {
                    "playlist.name": {
                        $ne: "Country"
                    }
                }, {
                    "playlist.name": {
                        $ne: "Electronic"
                    }
                }, {
                    "playlist.name": {
                        $ne: "Classical"
                    }
                }, {
                    "playlist.name": {
                        $ne: "R & B"
                    }
                }, {
                    "playlist.isPublic" : true
                }]
            },

        }, {
            $project: {
                _id: 0,
                playlist: 1
            }
        }], function(err, user) {
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (user.length > 0) {
                var ret = [];
                for (var i = 0; i < user.length; i++){
                    ret.push(user[i].playlist);
                }
                callback({
                    status: "Success",
                    data: ret
                });
            }
        });
    },

    toggleGlobalPlaylist: function(userID, pname, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $match: {
                oauthID: userID,
                "playlist.name": pname
            }
        }, {
            $project: {
                _id: 1,
                isPublic: "$playlist.isPublic"
            }
        }], function(err, result) {
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (result.length > 0) {
                User.update({
                    oauthID: userID,
                    "playlist.name": pname
                }, {
                    "playlist.$.isPublic": !result[0].isPublic
                }, function(err, result) {
                    if (err) {
                        console.log("ERROR: " + err);
                        callback({
                            status: "Fail",
                            msg: err
                        });
                    } else if (!err && result && result !== 0) {
                        callback({
                            status: "Success"
                        });
                    } else {
                        callback({
                            status: "Fail",
                            msg: "Failed to toggle playlist to be public"
                        });
                    }
                });
            }
        });
    },

    getPlaylistLikes: function(globalID, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $match: {
                "playlist._id": mongoose.Types.ObjectId(globalID)
            }
        }, {
            $project: {
                _id: 0, 
                likes:"$playlist.likes"
            }
        }], function(err, result){
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (result.length > 0) {
                callback({
                    status: "Success",
                    data: result
                });
            }
        });
    },

    getPlaylistLikes: function(globalID, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $match: {
                "playlist._id": mongoose.Types.ObjectId(globalID)
            }
        }, {
            $project: {
                _id: 0, 
                likes:"$playlist.likes"
            }
        }], function(err, result){
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail"
                });
            } else if (result.length > 0) {
                callback({
                    status: "Success",
                    data: result
                });
            }
        });
    },

    updatePlaylistLikes: function(userID, globalID, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $match: {
                "playlist._id": mongoose.Types.ObjectId(globalID)
            }
        }, {
            $project: {
                oauthID: 1,
                name: "$playlist.name",
                likes:"$playlist.likes"
            }
        }], function(err, result){
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail"
                });
            } else if (result.length > 0) {
                result = result[0];
                for(var i=0; i<result['likes'].length; i++){
                    if(result['likes'][i] === userID.toString()){
                        User.update({
                            oauthID: userID,
                            "playlist.name": result.name
                        }, {
                            "$pull": {
                                "playlist.$.likes": userID
                            }
                        }, function(err, result){
                            if(err){
                                console.log("ERROR: " + err);
                                callback({
                                    status: "Fail",
                                    msg: err
                                });
                            } else if(!err && result && result !== 0){
                                callback({
                                    status: "Success",
                                    msg: "Successfully unliked global playlist"
                                });
                            } else {
                                callback({
                                    status: "Fail",
                                    msg: "Failed to unlike for a public playlist"
                                });
                            }
                        });

                        return;
                    }
                }
                User.update({
                    oauthID: userID,
                    "playlist.name": result.name
                }, {
                    "$push": {
                        "playlist.$.likes": userID
                    }
                }, function(err, result){
                    if(err){
                        console.log("ERROR: " + err);
                        callback({
                            status: "Fail",
                            msg: err
                        });
                    } else if(!err && result && result !== 0){
                        callback({
                            status: "Success",
                            msg: "Successfully liked global playlist"
                        });
                    } else {
                        callback({
                            status: "Fail",
                            msg: "Failed to like for a public playlist"
                        });
                    }
                });
            };
        });
    },
    
    incrementGlobalPlaylist: function(userID, pname, callback) {
        User.update({
            oauthID: userID,
            "playlist.name": pname
        }, {
            $inc: {
                "playlist.$.count": 1
            }
        }, function(err, result) {
            if(err){
                console.log("ERROR: " + err);
                callback({
                    status: "Fail",
                    msg: err
                });
            } else if(!err && result && result !== 0){
                callback({
                    status: "Success"
                });
            } else {
                callback({
                    status: "Fail",
                    msg: "Failed to increment view count for a public playlist"
                });
            }
        });
    }
};

module.exports = database;
