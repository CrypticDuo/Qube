'use strict';

var db = require('./database');
var User = require('../model/user');
var request = require('request');
var share = require('./share');
var trending = require('./trending');

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

var Routes = function (app, router) {
    app.get('/', function(req, res) {
        if (req.isAuthenticated()) { // if logged in
            User.findById(req.session.passport.user, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('qube.html');
                };
            });
        } else {
            res.render('index.ejs');
        }
    });

    app.get('/logout', function(req, res) {
        req.logout();
        console.log("logging out...");
        res.redirect('/');
    });

    app.get('/share/:playlist_id', function(req, res) {
        if (req.isAuthenticated()) {
            share.handleShare(
                res,
                req.session.passport.user,
                req.params.playlist_id
            );
        } else {
            res.redirect('/login?share='+req.params.playlist_id);
        }
    });

    app.get('/login', function(req, res) {
        var playlist_id = req.query.share;

        res.render('login.ejs', {
          'playlist_id': playlist_id
        });
    });

    app.get('/privacy', function(req, res) {
        res.render('privacy.ejs');
    });

    app.get('/terms', function(req, res) {
        res.render('terms.ejs');
    });

    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log('Something is happening.');
        next();
    });

    /*
        GET     /featureModal
        GET     /playlists
        GET     /playlists/:playlist_name
        POST    /playlists/:playlist_name
        DELETE  /playlists/:playlist_name
        PUT     /playlists/:playlist_name/list/:list
        POST    /playlists/:playlist_name/videos/:videoID
        DELETE  /playlists/:playlist_name/videos/:videoID
    */

    router.route('/featureModal')
        .get(ensureAuthenticated, function(req, res) {
            db.seenFeatureModalVersion(req.user.oauthID).then(function(result) {
                res.json(result);
            });
        });

    router.route('/trending')
        //get all playlist
        .get(ensureAuthenticated, function(req, res) {
            trending.getTrending().then(function(data) {
                return res.json(JSON.parse(data['data']));
            });
        })
        .put(ensureAuthenticated, function(req, res) {
            if(req.params.secretKey === oauth.qubeVideosKey) {
              trending.fetchTrending().then(function(result) {
                  res.json(result);
              });
            } else {
              res.json({
                status: 'denied'
              });
            }
        });

    router.route('/playlists')
        //get all playlist
        .get(ensureAuthenticated, function(req, res) {
            db.updateLoginData(req.user.oauthID).then(function(_) {
              return db.listAllPlaylists(req.user.oauthID).then(function(result) {
                  res.json(result);
              });
            });
        });

    router.route('/playlists/:playlist_name')
        //get all videos in playlist
        .get(ensureAuthenticated, function(req, res) {
            db.listAllVideos(req.user.oauthID, req.params.playlist_name, function(result) {
                res.json(result);
            });
        })
        //add new playlist
        .post(ensureAuthenticated, function(req, res) {
            db.createPlaylist(req.user.oauthID, req.params.playlist_name, function(result) {
                res.json(result);
            });
        })
        //delete playlist
        .delete(ensureAuthenticated, function(req, res) {
            db.removePlaylist(req.user.oauthID, req.params.playlist_name, function(result) {
                res.json(result);
            });
        })
        //update playlist
        .put(ensureAuthenticated, function(req, res){
            var playlistData = JSON.parse(req.params.playlist_name);
            var formattedPlaylist = playlistData.map(function(data) {
                return {
                    name: data.name,
                    videos: data.videos
                }
            });
            db.updatePlaylist(req.user.oauthID, formattedPlaylist).then(function(result){
                res.json(result);
            });
        });

    router.route('/playlists/:playlist_name/list/:list')
        //update playlist
        .put(ensureAuthenticated, function(req, res) {
            var temp = req.params.list;
            var list = temp.slice(1, temp.length - 1)
                .split(',')
                .map(function(str) {
                    return JSON.parse(str)
                });
            db.updateVideoList(req.user.oauthID, req.params.playlist_name, list, function(result) {
                res.json(result);
            });
        });

    router.route('/playlists/:playlist_name/videos/:videoID')
        //add new video
        .post(ensureAuthenticated, function(req, res) {
            db.addVideoToPlaylist(req.user.oauthID, req.params.playlist_name, req.params.videoID, function(result) {
                res.json(result);
            });
        })
        //delete video
        .delete(ensureAuthenticated, function(req, res) {
            db.removeVideoFromPlaylist(req.user.oauthID, req.params.playlist_name, req.params.videoID, function(result) {
                res.json(result);
            });
        });

    app.use('/api', router);
};

module.exports = Routes;
