'use strict'

var Promise = require("bluebird");
var Oauth = require("../oauth")
var SpotifyWebApi = Promise.promisifyAll(require('spotify-web-api-node'));
var YouTube = Promise.promisifyAll(require('youtube-node'));

var spotifyApi = new SpotifyWebApi({
  clientId : Oauth.trending.spotifyId,
  clientSecret : Oauth.trending.spotifySecret
});

var youTube = new YouTube();
youTube.setKey(Oauth.trending.youtubeServerKey);

var trendingPlaylists = [];
var formattedPlaylist = [];
var numberOfTrendingPlaylists = 20; // dev environment should use MAX 2.

function getPlaylistVideos(playlists) {
    Promise.map(playlists, function(playlist) {
        return spotifyApi.getPlaylistTracks(playlist.owner.id, playlist.id, { 'fields' : 'items' });
    }).then(function(results) {
        var formatted = [];
        for(var i = 0; i < results.length; i++) {
            var tracks = [];
            for (var l = 0; l < results[i].body.items.length; l++) {
                var artists = "";
                results[i].body.items[l].track.artists.forEach(function(artist) {
                    artists = artists + artist.name + " ";
                })
                tracks.push({
                    title: results[i].body.items[l].track.name,
                    artist: artists
                })
            }

            formatted.push({
                name: playlists[i].name,
                tracks
            })
        }
        formattedPlaylist = formatted;
        return formatted;
    }).then(function(fp) {
        return Promise.map(fp, function(p) {
            return getYoutubeIds(p.tracks);
        })
    }).then(function(youtubeFP) {
        youtubeFP.forEach(function(youtubePlaylist, index) {
            console.log(youtubePlaylist.length);
            if(youtubePlaylist.length >= 10) {
                trendingPlaylists.push({
                    name: formattedPlaylist[index].name,
                    data: youtubePlaylist
                })
            }
        });
        console.log("Fetched " + numberOfTrendingPlaylists + " Trending Playlists")
    })
}

function getYoutubeIds(tracks) {
    return Promise.map(tracks, function(track) {
        var query = track.title + " " + track.artist;
        return youtubeSearch(query);
    })
    .then(function(youtubeTracks) {
        var tracks = youtubeTracks.filter(function(track) {
            if(track) {
                return track;
            }
        });
        return tracks;
    });
}

function youtubeSearch(query) {
    return new Promise(function(resolve, reject) {
        youTube.search(query, 1, function(error, result) {
            if (error) {
                reject(error);
                return;
            }
            var tokens = query.split(' ');
            if (result.items.length == 0) {
                resolve(null);
                return;
            }
            if (result.items[0].id.kind != "youtube#video") {
                resolve(null);
                return;
            }
            var title = result.items[0].snippet.title;
            var skip = false;
            tokens.forEach(function(token) {
                if(title.indexOf(token) == -1) {
                    skip = true;
                }
            });
            if (skip) {
                resolve(null);
                return;
            }
            youTube.getById(result.items[0].id.videoId, function(detailError, detailResult) {
              if (detailError) {
                reject(error);
                return;
            }
              else {
                if (detailResult.items.length &&
                    Number(detailResult.items[0].statistics.viewCount) > 10000) {
                    result.items[0].contentDetails = detailResult.items[0].contentDetails;
                    resolve(result.items[0]);
                    return;
                }
                resolve(null);
                return;
              }
            });
        });
    });
}

module.exports = {
    fetchTrending: function() {
        spotifyApi.clientCredentialsGrant()
        .then(function(data) {
            spotifyApi.setAccessToken(data.body['access_token']);
            return true;
        }, function(err) {
            console.log('Something went wrong when retrieving an access token', err);
        })
        .then(function() {
            //  Retrieve featured playlists
            return spotifyApi.getFeaturedPlaylists({limit : numberOfTrendingPlaylists, offset: 0})
        })
        .then(function(data) {
            return getPlaylistVideos(data.body.playlists.items);
        });
    },

    getTrending: function() {
        return trendingPlaylists;
    }
};
