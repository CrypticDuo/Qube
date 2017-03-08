'use strict';

var passport = require('passport');

var db = require('./database');
var User = require('../model/user');
var share = require('./share');

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

    app.get('/auth/facebook/share/:playlist_id', function(req,res,next) {
      passport.authenticate(
        'facebook',
         {callbackURL: '/auth/facebook/share_callback/' + req.params.playlist_id }
      )(req,res,next);
    });

    app.get('/auth/facebook/share_callback/:playlist_id', function(req,res,next) {
      passport.authenticate(
        'facebook',
         {
           callbackURL:'/auth/facebook/share_callback/' + req.params.playlist_id,
           failureRedirect:'/'
         }
       ) (req,res,next);
     },
     function(req, res) {
        if (req.isAuthenticated()) {
            share.handleShare(res, req.session.passport.user, req.params.playlist_id);
        } else {
            res.redirect('/');
        }
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

    app.get('/auth/github/share/:playlist_id', function(req,res,next) {
      passport.authenticate(
        'github',
         {callbackURL: '/auth/github/callback/share/' + req.params.playlist_id }
      )(req,res,next);
    });

    app.get('/auth/github/callback/share/:playlist_id', function(req,res,next) {
      passport.authenticate(
        'github',
         {
           callbackURL:'/auth/github/callback/share/' + req.params.playlist_id,
           failureRedirect:'/'
         }
       ) (req,res,next);
     },
     function(req, res) {
        if (req.isAuthenticated()) {
            share.handleShare(res, req.session.passport.user, req.params.playlist_id);
        } else {
            res.redirect('/');
        }
    });
}

module.exports = Passport;
