'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trendingPlaylists = new Schema({
    data : String
});

var TrendingPlaylists = mongoose.model('trending', trendingPlaylists);

module.exports = TrendingPlaylists;
