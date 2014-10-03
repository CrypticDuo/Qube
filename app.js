// dependencies
var fs = require('fs');
var express = require('express');
var path = require('path');
var app = express();
var config = require('./oauth.js');
var User = require('./user.js');
var mongoose = require('mongoose');
var passport = require('passport');
var auth = require('./authentication.js');
var db = require('./database.js');
var bodyParser = require('body-parser');

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
app.use(express.session({secret: 'my_precious'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));

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

// RENDERING
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

app.post('/addPlaylist', ensureAuthenticated, function(req, res){
    db.createPlaylist(req.user.oauthID, req.body.playlistName, function(result){
		res.json(result);
	});
});
app.get('/listAllPlaylist', ensureAuthenticated, function(req, res){
    db.listAllPlaylist(req.user.oauthID, function(result){
        res.json(result);
    });
});
app.post('/addVideoToPlaylist', ensureAuthenticated, function(req, res){
    db.addVideoToPlaylist(req.user.oauthID, req.body.playlistName, req.body.videoID, function(result){
        res.json(result);
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


app.listen(app.get('port'));
console.log("Listening on port localhost:" + app.get('port'));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}
