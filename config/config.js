'use strict'

var config = {
    version: '1.1.0',
    versions: ['1.0.0', '1.1.0'],
    newFeatures: {
      '1.0.0' : ['share', 'autogen'],
      '1.1.0' : ['trending']
    },

    numberOfTrendingPlaylists: 20,


    getNewFeatures: function(version) {
        var newFeatures = [];
        var self = this;
        for(var i = self.versions.length-1; i >= 0; i--) {
            if (self.versions[i] === version) break;
            newFeatures = newFeatures.concat(self.newFeatures[self.versions[i]]);
        }
        return newFeatures;
    }
}

module.exports = config;
