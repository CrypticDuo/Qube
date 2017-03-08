'use strict'

var Q = require('q');
var ObjectId = require('mongoose').Types.ObjectId;

var db = require('./database');

module.exports = {
    // id: ObjectId
    // sharePlaylistId: ObjectId
    handleShare: function(res, id, sharePlaylistId) {
        var self = this;
        return db.getPlaylistById(sharePlaylistId).then(function(result) {
                return result.playlist[0];
            }).catch(function(err) {
                return null;
            }).then(function(sharePlaylist) {
                if(!sharePlaylist) {
                  return null;
                }
                return db.getUserById(id).then(function(result) {
                    var oauthID = result.oauthID;
                    return db.listAllPlaylists(oauthID).then(function(result) {
                          var playlists = result.data ? result.data : [];

                          sharePlaylist['_id'] = new ObjectId();
                          sharePlaylist['name'] = self.getUniqueSharePlaylistName(
                            playlists,
                            sharePlaylist['name']
                          );

                          playlists.push(sharePlaylist);
                          return playlists;
                      }).then(function(newPlaylist) {
                          return db.updatePlaylist(oauthID, newPlaylist);
                      });
              });
        }).then(function() {
          // TODO: maybe we should 'choose' this playlist, or somehow let
          //        the user know this was the shared playlist
          res.redirect('/');
        })
        .done();
    },

    getSetOfPlaylistNames: function(playlists) {
        return new Set(playlists.map(v => v.name));
    },

    getUniqueSharePlaylistName: function(playlists, sharePlaylistName) {
        var setOfPlaylistNames = this.getSetOfPlaylistNames(playlists);
        var tempSharePlaylistName = '';
        var index = 0;
        do {
          tempSharePlaylistName = sharePlaylistName + ' (Shared)';

          if (index > 0) {
            tempSharePlaylistName += ' - ' + index;
          }
          index++;
        } while(setOfPlaylistNames.has(tempSharePlaylistName));

        return tempSharePlaylistName;
    }
};
