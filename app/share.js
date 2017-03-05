'use strict'

var Q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

var db = require('./database');

module.exports = {
    // uses mongoDB ID
    handleShare: function(id, sharePlaylistId) {
        return db.getUser(id).then(function(result) {
            var oauthID = result.data.oauthID;
            return db.listAllPlaylists(oauthID).then(function(result) {
                var playlists = result.data ? result.data : [];

                // TODO: reorder query such that if share playlist id doesn't exist, error right away
                return db.getPlaylistById(sharePlaylistId)
                    .then(function(result) {
                        var sharePlaylist = result.playlist[0];
                        sharePlaylist['_id'] = new ObjectId();

                        // TODO: edit sharePlaylist name and such
                        sharePlaylist['name'] += ' - Shared';
                        playlists.push(sharePlaylist);
                        return playlists;
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            }).then(function(newPlaylist) {
                return db.updatePlaylist(oauthID, newPlaylist);
            });
        });
    }
};
