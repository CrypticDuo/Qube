// dependencies
var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var request = require('request');

var auth = require('./authentication.js');
var db = require('./database.js');
var config = require('./oauth.js');
var User = require('./user.js');

// connect to the database
mongoose.connect('mongodb://localhost/database');

var app = express();
app.set("view options", {
    layout: false
});

app.use("/static", express.static(__dirname + "/static"));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('port', process.env.PORT || 4455);

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(session({
    secret: 'my_precious'
}));
app.use(passport.initialize());
app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
    //console.log('serializeUser: ' + user._id);
    done(null, user._id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        if (!err) done(null, user);
        else done(err, null);
    })
});


// RENDERING *****
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
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {});
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/');
    });
app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res) {});
app.get('/auth/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res) {
    req.logout();
    console.log("logging out...");
    res.redirect('/');
});

//SET UP ROUTER FOR REST API
var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('REST API: ', req.protocol + '://' + req.get('host') + req.originalUrl);
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
        db.updateLoginData(req.user.oauthID, function(result){
            var options = {
                url: req.protocol + '://' + req.get('host').substring(0, req.get('host').lastIndexOf(':')) + ':4456'+'/api/update/{"data":"'+result.ID+'"}',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            request(options, function (error, response, body) {
                if (!error && response && response.statusCode === 200) {
                    console.log('Call REST API to Qube-Analytics: ' + body);
                }
            });
        });
        db.listAllPlaylists(req.user.oauthID, function(result) {
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
        db.updatePlaylist(req.user.oauthID, temp, function(result){
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

router.route('/global')
    .get(ensureAuthenticated, function(req, res){
        db.getGlobalPlaylists(function(result){
            res.json(result);
        });
    });

router.route('/global/toggle/:playlist_name')
    //update playlist to make it public/private
    .put(ensureAuthenticated, function(req, res){
        db.toggleGlobalPlaylist(req.user.oauthID, req.params.playlist_name, function(result){
            res.json(result);
        });
    });

router.route('/global/incr/:playlist_name')
    //update playlist view count
    .put(ensureAuthenticated, function(req, res){
        db.incrementGlobalPlaylist(req.user.oauthID, req.params.playlist_name, function(result){
            res.json(result);
        });
    });

router.route('/global/likes/:global_id')
    .get(ensureAuthenticated, function(req, res){
        db.getPlaylistLikes(req.params.global_id, function(result){
            res.json(result);
        })
    })
    .put(ensureAuthenticated, function(req, res){
        db.updatePlaylistLikes(req.user.oauthID, req.params.global_id, function(result){
            res.json(result);
        });
    });

app.use('/api', router);

app.listen(app.get('port'));
console.log("Listening on port localhost:" + app.get('port'));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}
