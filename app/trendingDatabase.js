'use strict';

var Promise = require("bluebird");

var TrendingPlaylists = Promise.promisifyAll(require('../model/trendingPlaylists'));

var trendingDatabase = {
    saveTrendingPlaylists: function(trendingPlaylists) {
        return new Promise(function(resolve, reject) {
            TrendingPlaylists.update({}, {
                "$set": {
                  data: JSON.stringify(trendingPlaylists)
                }
            }, { upsert: true}, function(err, trendingPlaylists) {
                if(err) {
                  reject({ status: 'Error', data: err});
                } else if (!err && trendingPlaylists != null) {
                  resolve({ status: 'Success', data: trendingPlaylists});
                } else {
                  reject({ status: 'Fail', data: 'Fail' });
                }
            });
        });
    },

    getTrendingPlaylists: function() {
        return new Promise(function(resolve, reject) {
            TrendingPlaylists.findOne({}, function(err, trendingPlaylists) {
                if (err) {
                  reject(err);
                } else if (!err && trendingPlaylists != null) {
                  resolve(trendingPlaylists);
                } else {
                  reject(null);
                }
            });
        });
    }
};

module.exports = trendingDatabase;
