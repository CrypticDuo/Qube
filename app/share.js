'use strict'

var Q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

var db = require('./database');

module.exports = {
    // id: ObjectId
    // sharePlaylistId: ObjectId
    handleShare: function(id, sharePlaylistId) {
        return db.getUserById(id).then(function(result) {
            var oauthID = result.oauthID;
            return db.listAllPlaylists(oauthID).then(function(result) {
                var playlists = result.data ? result.data : [];

                // TODO: reorder query such that if share playlist id doesn't
                //        exist, error right away
                return db.getPlaylistById(sharePlaylistId)
                    .then(function(result) {
                        var sharePlaylist = result.playlist[0];
                        sharePlaylist['_id'] = new ObjectId();

                        // TODO: edit sharePlaylist name and such
                        // TODO: check if playlist name exists already
                        sharePlaylist['name'] += ' (Shared)';
                        playlists.push(sharePlaylist);
                        return playlists;
                    })
                    .catch(function(err) {
                        return playlists;
                    });
            }).then(function(newPlaylist) {
                return db.updatePlaylist(oauthID, newPlaylist);
            });
        }).then(function() {
          // TODO: maybe we should 'choose' this playlist, or somehow let
          //        the user know this was the shared playlist
          res.redirect('/');
        });
    }
};
