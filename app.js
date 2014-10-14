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
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride('X-HTTP-Method-Override'));

app.use(session({secret: 'my_precious'}));
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
app.get('/account', ensureAuthenticated, function(req, res) {
    User.findById(req.session.passport.user, function(err, user) {
        if (err) {
            console.log(err);
        } else {
            res.render('main.html', {
                user: user
            });
        };
    });
});
app.get('/', function(req, res) {
    res.render('index.html', {
        user: req.user
    });
});
app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res) {}
);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/'
    }),
    function(req, res) {
        res.redirect('/account');
    }
);
app.get('/logout', function(req, res) {
    req.logout();
    console.log("logging out...");
    res.redirect('/');
});

//SET UP ROUTER FOR REST API
var router = express.Router();

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
    POST    /playlists/:playlist_name/videos/:videoID  
    DELETE  /playlists/:playlist_name/videos/:videoID
*/

router.route('/playlists')
    //get all playlist
    .get(ensureAuthenticated, function(req, res){
        db.listAllPlaylists(req.user.oauthID, function(result){
            res.json(result);
        });
    });

router.route('/playlists/:playlist_name')
    //get all videos in playlist
    .get(ensureAuthenticated, function(req, res){
        db.listAllVideos(req.user.oauthID, req.params.playlist_name, function(result){
            res.json(result);
        });
    })
    //add new playlist
    .post(ensureAuthenticated, function(req, res){
        db.createPlaylist(req.user.oauthID, req.params.playlist_name, function(result){
            res.json(result);
        });
    })
    //delete playlist
    .delete(ensureAuthenticated, function(req, res){
        db.removePlaylist(req.user.oauthID, req.params.playlist_name, function(result){
            res.json(result);
        });
    });

router.route('/playlists/:playlist_name/videos/:videoID')
    //add new video
    .post(ensureAuthenticated, function(req, res){
        db.addVideoToPlaylist(req.user.oauthID, req.params.playlist_name, req.params.videoID, function(result){
            res.json(result);
        });
    })
    //delete video
    .delete(ensureAuthenticated, function(req, res){
        db.removeVideoFromPlaylist(req.user.oauthID, req.params.playlist_name, req.params.videoID, function(result){
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
