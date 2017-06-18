app.service("QubeService", function($http, $q) {
    function createRequest(videoIDlist) {
	    var deferred = Q.defer();

      $http.get('https://www.googleapis.com/youtube/v3/videos', {
              params: {
                  part: 'contentDetails, statistics, snippet',
                  id: videoIDlist,
                  key: 'AIzaSyBPpFA_UqCYS5zVtMh6JsO-aC_AaO3aWhI'
              }
          })
          .success(function(contentDetailsData) {
              deferred.resolve(contentDetailsData);
          })
          .error(function(error) {
              deferred.reject(null);
              alertify.error('Failed to load contents from youtube.');
          });

      return deferred.promise;
    }

    function doneLoadingPlaylist(scope) {
        setInterval(function() {
          $('div.loading-page').fadeOut(1000);
        }, 300);
    }

    function getPlaylistDetails(scope, playlists) {
        var promises = [];

        for(var i = 0; i < playlists.length; i++) {
            promises.push(getVideoDetails(scope, playlists[i]));
        }

        if(promises.length == 0) {
          doneLoadingPlaylist();
        }

        return Q.allSettled(promises).then(function(result) {
            var playlists = [];

            for (var i = 0; i < result.length; i++) {
                var value = result[i]['value'];

                if(result[i]['state'] === 'fulfilled' && value) {
                  playlists.push(value);
                }
            }
            doneLoadingPlaylist();
            scope.playlists = playlists;
            scope.loadFirstPlaylist(playlists[0]);
            scope.$apply();
        });
    }

    function getVideoDetails(scope, playlist) {
        var promises = [];
        var videoIDlist = [];
        var videoIDString = '';

        var count = 1;
        for (var i = 0; i < playlist.videos.length; i++) {
            videoIDString = videoIDString + playlist.videos[i] + ",";
            if(count % 45 === 0) {
              videoIDlist.push(videoIDString);
              videoIDString = '';
            }
            count++;
        }
        if (videoIDString !== '') {
          videoIDlist.push(videoIDString);
        }

        for (var i = 0; i < videoIDlist.length; i++) {
          promises.push(createRequest(videoIDlist[i]));
        }

        return Q.allSettled(promises).then(function(result) {
          var contentDetailsData = [];

          for (var i = 0; i < result.length; i++) {
              var value = result[i]['value'];

              if(result[i]['state'] === 'fulfilled' && value) {
                contentDetailsData = contentDetailsData.concat(value.items);
              }
          }

          var playlistData = {
              _id: playlist._id,
              type: 'playlist',
              name : playlist.name,
              data : contentDetailsData,
              duration : "00:00"
          };
          for(var i = 0; i < playlistData.data.length; i++){
              playlistData.data[i].contentDetails.duration = convertYoutubeDuration(playlistData.data[i].contentDetails.duration);
              playlistData.duration = addDuration(playlistData.duration, playlistData.data[i].contentDetails.duration);
          }

          return playlistData;
        });
    }

    function searchAutoComplete(scope, query, callback){
        $.ajax({
            url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&q="+query,
            dataType: 'jsonp',
        }).success(function(data) {
           var map = $.map( data[1], function(item) {
                return item[0];
            });
           callback(map);
        });

    }

    function listAllPlaylist(scope) {
        $http.get(HOST_URL + "/api/playlists")
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    scope.playlists = [];
                    getPlaylistDetails(scope, res.data);
                }
            })
            .error(function(err) {
                alertify.error('Failed to list playlists.');
            });
    };

    function getTrending(scope) {
        $http.get(HOST_URL + "/api/trending")
            .success(function(res) {
                if (res.length) {
                    res.forEach(function(playlist) {
                        playlist.duration = "00:00";
                        for(var i = 0; i < playlist.data.length; i++){
                          playlist.data[i].contentDetails.duration = convertYoutubeDuration(playlist.data[i].contentDetails.duration);
                          playlist.duration = addDuration(playlist.duration, playlist.data[i].contentDetails.duration);
                        }
                    });
                    scope.trendingPlaylists = res;
                }
            })
            .error(function(err) {
                alertify.error('Failed to fetch trending playlists.');
            });
    };

    function addPlaylist(scope, pname, showAlert = true) {
        var deferred = Q.defer();
        if (pname.replace(/\s/g, "").length === 0) {
            if(showAlert) alertify.error('Playlist name can\'t be empty');
            deferred.reject(false);
            return deferred.promise;
        }

        $http.post("/api/playlists/" + pname)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    if(res.msg.indexOf('Error:') === 0){
                        alertify.error(res.msg);
                    } else{
                        console.log(res.msg);
                    }
                    deferred.reject(null);
                } else {
                    var addedPlaylist = {
                        _id: res.data.newId,
                        type: 'playlist',
                        name: pname,
                        data: [],
                        duration: "00:00"
                    };
                    scope.playlists.push(addedPlaylist);
                    if(showAlert) alertify.success('Added playlist.');
                    deferred.resolve(addedPlaylist);
                }
            })
            .error(function(err) {
                if(showAlert) alertify.error('Failed to add playlist.');
                deferred.reject(null);
            });
        return deferred.promise;
    };

    function removePlaylist(scope, pname) {
        $http.delete("/api/playlists/" + pname)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                    return;
                }
                var i;
                for(i = 0; i < scope.playlists.length; i++){
                    if (scope.playlists[i].name === pname){
                        scope.playlists.splice(i, 1);
                        break;
                    }
                }
                if (scope.currentPlaylist.name === pname){
                    scope.currentPlaylist.data = [];
                    scope.currentPlaylist = {};

                    if(i-1 > 0) {
                      scope.currentPlaylist = scope.playlists[i-1];
                    }
                }
                alertify.success('Deleted playlist.');
            })
            .error(function(err) {
                alertify.error('Failed to remove playlist.');
            });
    };

    function updatePlaylist(scope, list, successMessage = null){
        var deferred = Q.defer();

        var newList = JSON.stringify(list);
        $http.put("/api/playlists/" + newList)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    deferred.reject(false);
                    console.log(res.msg);
                } else {
                    deferred.resolve(true);
                    if(successMessage) alertify.success(successMessage);
                }
            })
            .error(function(err){
                deferred.reject(false);
                alertify.error('Failed to update playlist.');
            });

        return deferred.promise;
    };

    function addVideoToPlaylist(scope, pname, video, showAlert = true) {
        var deferred = Q.defer();

        $http.post("/api/playlists/" + pname + "/videos/" + video.id)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    if(res.msg.indexOf('Error:') === 0){
                        alertify.error(res.msg);
                    } else{
                        console.log(res.msg);
                    }
                    deferred.reject(false);
                } else {
                    for(var i = 0; i<scope.playlists.length; i++){
                        if(scope.playlists[i].name === pname){
                            video.snippet.thumbnails = {medium: { uri: '' }};
                            video.snippet.thumbnails.medium.url = video.thumbnail;
                            scope.playlists[i].data.push(video);
                            scope.playlists[i].duration = addDuration(scope.playlists[i].duration, video.contentDetails.duration);
                            break;
                        }
                    }
                    if(showAlert) alertify.success('Added ' + video.snippet.title);

                    deferred.resolve(true);
                }
            })
            .error(function(err) {
                if(showAlert) alertify.error('Failed to add video.');
                deferred.reject(false);
            });

        return deferred.promise;
    };

    function removeVideoFromPlaylist(scope, pname, videoId){
        $http.delete("/api/playlists/" + pname + "/videos/" + videoId)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    for(var i = 0; i < scope.currentPlaylist.data.length; i++){
                        if(videoId === scope.currentPlaylist.data[i].id){
                            scope.currentPlaylist.data.splice(i, 1);
                            break;
                        }
                    }
                    scope.updatePlaylistDuration(scope.currentPlaylist);
                    alertify.success('Deleted video.');
                }
            })
            .error(function(err) {
                alertify.error('Failed to remove video.');
            });
    };

    function updateVideoList(scope, pname, list){
        var newList = JSON.stringify(list);
        $http.put("/api/playlists/" + pname + "/list/" + newList)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    alertify.success('Updated video order.');
                }
            })
            .error(function(err){
                alertify.error('Failed to update video list.');
            });
    };

    function getSeenFeatureModal(scope) {
        var deferred = Q.defer();

        $http.get("/api/featureModal/")
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                    deferred.reject(null);
                } else {
                    scope.showFeatureModal = res.showFeatureModal;
                    for(var i = 0; i < res.featuresToShow.length; i++) {
                      $('.'+res.featuresToShow[i]).addClass('show');
                    }
                    $('.'+res.featuresToShow[0]).show();
                    if(res.featuresToShow.length === 1) {
                        $('.new-feature .right i').addClass('off');
                    }
                    deferred.resolve(true);
                }
            });

        return deferred.promise;
    }

    //Returns the public API
    return ({
        listAllPlaylist: listAllPlaylist,
        getTrending: getTrending,
        addPlaylist: addPlaylist,
        removePlaylist: removePlaylist,
        updatePlaylist: updatePlaylist,
        addVideoToPlaylist: addVideoToPlaylist,
        removeVideoFromPlaylist: removeVideoFromPlaylist,
        updateVideoList : updateVideoList,
        searchAutoComplete: searchAutoComplete,
        getSeenFeatureModal: getSeenFeatureModal
    });
});
