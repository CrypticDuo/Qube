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

// connect to the database
mongoose.connect('mongodb://localhost/passport-example');

var app = express();
	app.set("view options", {
	    layout: false
	});
	app.use("/public", express.static(__dirname + "/public"));
	app.set('views', __dirname + '/views');
	app.engine('html', require('ejs').renderFile);
	app.set('port', process.env.PORT || 3000);
	app.use(express.session({
	    secret: 'my_precious'
	}));
	app.use(passport.initialize());
	app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
    console.log('serializeUser: ' + user._id);
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
            res.render('account.html', {
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


app.listen(app.get('port'));
console.log("Listening on port localhost:" + app.get('port'));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}