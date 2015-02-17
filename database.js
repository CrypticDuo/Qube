var mongoose = require('mongoose');
var User = require('./user.js');

var database = {
    getUserID: function(userID, callback){
        User.find({
            oauthID: userID
        }, function(err, user){
            if (err) {
                console.log("ERROR : " + err);
                callback({
                    status: "Fail",
                    msg: "User not found"
                });
            } else if (user.length > 0) {
                callback({
                    status: "Success",
                    data: user[0]._id
                });
            }
        });
    },

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
                            isDefault: false,
                            likes: [],
                            followers: [],
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

    getGlobalPlaylists: function(offset, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            $project: {
                playlist: 1,
                name:1,
                vSize: {$size : "$playlist.videos"}
            }
        }, {
            $match: {
                $and: [{
                    vSize : { $gte: 4},
                }, {
                    "playlist.isPublic" : true
                }]
            },

        }, {
            $project: {
                _id: 0,
                playlist: 1,
                name: 1
            }
        }, {
            $skip: offset
        }, {
            $limit: 20
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
                    user[i].playlist.username = user[i].name;
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

    updatePlaylistLikes: function(userID, id, globalID, callback) {
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
                    if(result['likes'][i] === id.toString()){
                        User.update({
                            oauthID: result.oauthID,
                            "playlist.name": result.name
                        }, {
                            "$pull": {
                                "playlist.$.likes": id
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
                                    action: 'unlike',
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
                    oauthID: result.oauthID,
                    "playlist.name": result.name
                }, {
                    "$push": {
                        "playlist.$.likes": id
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
                            action: 'like',
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

    getPlaylistFavorites: function(userID, callback) {
        User.find({
            oauthID: userID
        }, {
            favorites:1
        }, function(err, result){
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail"
                });
            } else if (result.length > 0) {
                result=result[0];
                var favoriteData = [];
                var count = 0;
                for(var i=0; i<result.favorites.length; i++){
                    (function(){
                        User.aggregate([{
                            $unwind : "$playlist"
                        }, {
                            $match : {
                                "playlist._id": mongoose.Types.ObjectId(result.favorites[i]),
                                "playlist.isPublic": true
                            }
                        }, {
                            $project : {
                                _id: 0,
                                playlist: 1
                            }
                        }], function(err, result2){
                            if(err){
                                console.log("ERROR: " + err);
                                callback({
                                    status: "Fail",
                                    msg: err
                                });
                                return;
                            } else {
                                if(result2[0]){
                                    favoriteData.push(result2[0]);
                                }
                                count++;
                                if(count === result.favorites.length){
                                    callback({
                                        status: "Success",
                                        data:favoriteData
                                    });
                                }
                            }
                         });
                    })();
                };
            }
        });
    },

    updatePlaylistFavorites: function(userID, id, globalID, callback) {
        User.aggregate([{
            $unwind: "$playlist"
        }, {
            // match the global playlist owner
            $match: {
                "playlist._id": mongoose.Types.ObjectId(globalID)
            }
        }, {
            // get the JSON of owner
            $project: {
                oauthID: 1,
                name: "$playlist.name",
                favorites:"$playlist.favorites"
            }
        }], function(err, result){
            if (err) {
                console.log("ERROR: " + err);
                callback({
                    status: "Fail"
                });
            } else if (result.length > 0) {
                result = result[0];
                for(var i=0; i<result['favorites'].length; i++){
                    if(result['favorites'][i] === id.toString()){
                        // Favorite exists already, hence must UNFAVORITE
                        // Update owner's data
                        User.update({
                            oauthID: result.oauthID,
                            "playlist.name": result.name
                        }, {
                            "$pull": {
                                "playlist.$.favorites": id
                            }
                        }, function(err, result){
                            if(err){
                                console.log("ERROR: " + err);
                                callback({
                                    status: "Fail",
                                    msg: err
                                });
                            } else if(!err && result && result !== 0){

                                // Update user's data
                                User.update({
                                    oauthID: userID
                                }, {
                                    "$pull": {
                                        "favorites": globalID
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
                                            action: 'unfavorite',
                                            msg: "Successfully unfavorited global playlist"
                                        });
                                    } else {
                                        callback({
                                            status: "Fail",
                                            msg: "Failed to unfavorite global playlist"
                                        });
                                    }
                                });
                            } else {
                                callback({
                                    status: "Fail",
                                    msg: "Failed to unfavorite global playlist in owner's data"
                                });
                            }
                        });

                        return;
                    }
                }
                User.update({
                    oauthID: result.oauthID,
                    "playlist.name": result.name
                }, {
                    "$push": {
                        "playlist.$.favorites": id
                    }
                }, function(err, result){
                    if(err){
                        console.log("ERROR: " + err);
                        callback({
                            status: "Fail",
                            msg: err
                        });
                    } else if(!err && result && result !== 0){

                        // Update user's data
                        User.update({
                            oauthID: userID
                        }, {
                            "$push": {
                                "favorites": globalID
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
                                    action: 'unfavorite',
                                    msg: "Successfully unfavorited global playlist"
                                });
                            } else {
                                callback({
                                    status: "Fail",
                                    msg: "Failed to unfavorite global playlist"
                                });
                            }
                        });
                    } else {
                        callback({
                            status: "Fail",
                            msg: "Failed to favorite global playlist in owner's data"
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
