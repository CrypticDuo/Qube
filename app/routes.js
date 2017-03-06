'use strict';

var db = require('./database');
var User = require('../model/user');
var request = require('request');
var share = require('./share');

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
            res.render('index.html');
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
                req.session.passport.user,
                req.params.playlist_id
            );
        } else {
            // TODO: can we redirect to /login, then render login.ejs
            //       while maintaining playlist_id?
            res.render('login.ejs', {
              'playlist_id': req.params.playlist_id
            });
        }
    });

    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log('Something is happening.');
        next();
    });

    /*
        GET     /playlists
        GET     /playlists/:playlist_name
        POST    /playlists/:playlist_name
        DELETE  /playlists/:playlist_name
        PUT     /playlists/:playlist_name/list/:list
        POST    /playlists/:playlist_name/videos/:videoID
        DELETE  /playlists/:playlist_name/videos/:videoID
    */

    router.route('/playlists')
        //get all playlist
        .get(ensureAuthenticated, function(req, res) {
            db.updateLoginData(req.user.oauthID, function(result) {
              if(result.status !== 'Success') {
                console.log(result);
              }
            });
            db.listAllPlaylists(req.user.oauthID).then(function(result) {
                res.json(result);
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
            var temp = JSON.parse(req.params.playlist_name);
            db.updatePlaylist(req.user.oauthID, temp).then(function(result){
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
