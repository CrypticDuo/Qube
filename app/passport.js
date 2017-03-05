'use strict';

var passport = require('passport');
var User = require('../model/user');

require('./authentication');

var Passport = function(app) {
    // serialize and deserialize
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            if (!err) done(null, user);
            else done(err, null);
        })
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
}

module.exports = Passport;
