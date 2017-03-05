'use strict';

var ObjectId = require('mongoose').Types.ObjectId;
var Q = require('q');
var User = require('../model/user');
var defaultPlaylist = require('../config/defaultPlaylist');

var database = {
    authenticate: function(profile, done) {
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
    },

    getUserById: function(id) {
      var deferred = Q.defer();

      User.findById(id, function(err, user) {
          if (err) {
              deferred.reject(null);
          } else if (!err && user) {
              deferred.resolve(user);
          }
      });

      return deferred.promise;
    },

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
    listAllPlaylists: function(userID) {
        var deferred = Q.defer();

        User.find({
            oauthID: userID
        }, function(err, user) {
            if (err) {
                console.log("ERROR : " + err);
                deferred.resolve({
                    status: "Fail",
                    msg: "User not found"
                });
            }
            if(!err && user != null){
                deferred.resolve({
                    status: "Success",
                    data: user[0].playlist
                });
            }

            deferred.resolve({
                status: "Fail",
                msg: "User not found"
            });
        });

        return deferred.promise;
    },
    getPlaylistById: function(playlistID) {
        var deferred = Q.defer();

        User.findOne({
            "playlist._id" : ObjectId(playlistID)
        },{
            playlist: {
                "$elemMatch": {
                    _id : ObjectId(playlistID)
                }
            }
        }, function(err, playlist) {
          if(err) {
            deferred.reject(err);
          } else if(!err && playlist) {
            deferred.resolve(playlist);
          } else {
            // playlist id does not exist
            deferred.reject(null);
          }
        });

        return deferred.promise;
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
    updatePlaylist: function(userID, list){
        var deferred = Q.defer();

        User.update({
            oauthID: userID
        }, {
            "$set": {
                "playlist" : list
            }
        }, function(err, user){
            if(err) {
                console.log("ERROR : " + err);
                deferred.resolve({
                    status: "Fail",
                    msg: "User not found"
                });
                return;
            }
            if(!err && user != null){
                deferred.resolve({
                    status: "Success"
                });
                return;
            }
        });

        return deferred.promise;
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
    }
};

module.exports = database;
