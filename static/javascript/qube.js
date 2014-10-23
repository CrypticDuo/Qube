var app = angular.module("QubeApp", []);

function convertYoutubeDuration(before) {
    var string = before,
        array = string.match(/(\d+)(?=[MHS])/ig) || [];

    var formatted = array.map(function(item) {
        if (item.length < 2) return '0' + item;
        return item;
    }).join(':');

    if (string.indexOf('H') === -1 && string.indexOf('S') > -1 && string.indexOf('M') === -1)
        formatted = "00:" + formatted;
    else if (string.indexOf('M') > -1 && string.indexOf('S') === -1)
        formatted = formatted + ":00";
    else if (string.indexOf('H') > -1 && string.indexOf('M') === -1 && string.indexOf('S') === -1)
        formatted = formatted + ":00:00";
    else if (string.indexOf('H') > -1 && string.indexOf('M') === -1 && string.indexOf('S') > -1)
        formatted = formatted.substring(0, formatted.indexOf(':')) + ":00" + formatted.substring(formatted.indexOf(':'));

    return formatted;
}

function addDuration(x,y){
    var a = x.split(":");
    var b = y.split(":");

    a.length == 2 && a.unshift("00");
    b.length == 2 && b.unshift("00");

    a[2] = Number(a[2]) + Number(b[2]);
    a[1] = Number(a[1]) + Number(b[1]);
    a[0] = Number(a[0]) + Number(b[0]);

    if (a[2] >= 60){
      a[2] = a[2] % 60;
      a[1]++;
    }

    if (a[1] >= 60){
      a[1] = a[1] % 60;
      a[0]++;
    }

    for(var i = 0; i <=2 ; i++)
      a[i] = (a[i] >= 10) ? a[i]+"" : "0"+a[i];

    if (a[0] === "00")
      a.shift();

    a = a.join(":");
    return a;
}

app.controller('QubeCont', function($scope, $http, QubeService) {

    function init() {
        $scope.layout = 'playlist';
        $scope.currentPlaylist = {};
        $scope.ytSearchResult = [];
        $scope.playlists = [];
        QubeService.listAllPlaylist($scope);
    }

    init();

    $scope.addPlaylist = function() {
        QubeService.addPlaylist($scope, $scope.addPlaylistInput);
        $scope.addPlaylistInput = '';
    }

    $scope.changePlaylist = function(playlist) {
        $scope.currentPlaylist = playlist;
        QubeService.listAllVideos($scope, playlist.name);
    }

    $scope.addVideo = function(val) {
        QubeService.addVideoToPlaylist($scope, $scope.currentPlaylist.name, val);
    }


    var occurrenceTimer;
    $scope.queryYoutube = function(){
				if (occurrenceTimer) {
					window.clearTimeout(occurrenceTimer);
				}
				occurrenceTimer = window.setTimeout(function() {
					occurrenceTimer = null;
			    $scope.searchYt($scope.addVideoInput);
				}, 500);
    }

    $scope.searchYt = function(val) {
        $http.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: 'AIzaSyD62u1qRt4_QKzAKvn9frRCDRWsEN2_ul0',
                type: 'video',
                maxResults: '20',
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/medium,items/snippet/channelTitle',
                q: val
            }
        })
            .success(function(data) {
                videoIDlist = "";
                for (var i = 0; i < data.items.length; i++) {
                    videoIDlist = videoIDlist + data.items[i].id.videoId + ",";
                }
                $http.get('https://www.googleapis.com/youtube/v3/videos', {
                    params: {
                        part: 'contentDetails, statistics',
                        id: videoIDlist,
                        key: 'AIzaSyD62u1qRt4_QKzAKvn9frRCDRWsEN2_ul0'
                    }
                })
                    .success(function(contentDetailsData) {
                        $scope.appendContentDetail(data, contentDetailsData);
                    })
                    .error(function() {
                        alert("Something went wrong querying video details");
                    });
            })
            .error(function() {
                alert("Something went wrong with querying youtube videos");
            });
    }

    $scope.appendContentDetail = function(data, contentDetailsData) {
        $scope.ytSearchResult = [];
        for (var i = 0; i < data.items.length; i++) {
            var formatted = convertYoutubeDuration(contentDetailsData.items[i].contentDetails.duration);
            $scope.ytSearchResult.push({
                id: data.items[i].id.videoId,
                snippet: {
                  title : data.items[i].snippet.title
                },
                description: data.items[i].snippet.description,
                thumbnail: data.items[i].snippet.thumbnails.medium.url,
                author: data.items[i].snippet.channelTitle,
                contentDetails: {
                  duration: formatted
                },
                views: contentDetailsData.items[i].statistics.viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            });
        }
    }

    $scope.playVideo = function(videoId) {
        console.log("play video");
        console.log(videoId);
        console.log($scope.currentPlaying);
        if(!videoId){
            videoId = $('.userVideolist li.active').attr('id');
        }
        if($scope.currentPlaying == videoId) {
            player.playVideo();
        }
        else {
            player.loadVideoById(videoId);
        }
        $scope.currentPlaying = videoId;
    }

    $scope.prevVideo = function() {
        var $el = $('.userVideolist li.active');
        if($el.prev().length > 0){
            player.loadVideoById($el.prev().attr('id'));
            $scope.currentPlaying = $el.prev().attr('id');
        }
        else{
            player.loadVideoById($('.userVideolist li').last().attr('id'));
            $scope.currentPlaying = $('.userVideolist li').last().attr('id');
        }
    }

    $scope.pauseVideo = function() {
        var videoId = $('.userVideolist li.active').attr('id');
        player.pauseVideo();
    }

    $scope.nextVideo = function() {
        console.log("next video");
        var $el = $('.userVideolist li.active');
        if($el.next().length > 0){
            player.loadVideoById($el.next().attr('id'));
            $scope.currentPlaying = $el.next().attr('id');
        }
        else{
            player.loadVideoById($('.userVideolist li').first().attr('id'));
            $scope.currentPlaying = $('.userVideolist li').first().attr('id');
        }
    }
});

app.service("VideoService", function($http, $q) {
    //https://www.googleapis.com/youtube/v3/search

});

app.service("QubeService", function($http, $q) {

    var hostURL = "http://" + window.location.host;

    function getVideoDetails(target, data){
        var evt = data.shift();
        //puts the data contentDetails inside target
        if(!evt){
          return;
        }
        var videoIDlist = '';
        for (var i = 0; i < evt.videos.length; i++) {
            videoIDlist = videoIDlist + evt.videos[i] + ",";
        }
        $http.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'contentDetails, statistics, snippet',
                id: videoIDlist,
                key: 'AIzaSyD62u1qRt4_QKzAKvn9frRCDRWsEN2_ul0'
            }
        })
            .success(function(contentDetailsData) {
                target.push({name : evt.name, data : contentDetailsData.items, duration : "00:00"});
                for(var i=0; i<target[target.length-1].data.length; i++){
                    target[target.length-1].data[i].contentDetails.duration = convertYoutubeDuration(target[target.length-1].data[i].contentDetails.duration);
                    target[target.length-1].duration = addDuration(target[target.length-1].duration, target[target.length-1].data[i].contentDetails.duration);
                }
                getVideoDetails(target,data);
            })
            .error(function() {
                alert("Something went wrong querying video details!");
            });

    }

    function listAllPlaylist(scope) {
        $http.get(hostURL + "/api/playlists")
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    console.log(res.data);
                    // scope.playlists = res.data;
                    scope.playlists = [];
                    getVideoDetails(scope.playlists, res.data);
                }
            })
            .error(function(err) {
                alert("Error: Cannot list all playlists.");
            });
    };

    function addPlaylist(scope, pname) {
        $http.post("/api/playlists/" + pname)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    scope.playlists.push({name : pname, data : []});
                    console.log("Success: added a playlist.");
                }
            })
            .error(function(err) {
                alert("Error: Cannot add playlist.");
            });
    };

    function listAllVideos(scope, pname) {
        for(var a=0; a<scope.playlists.length; a++){
            if (scope.playlists[a].name === pname){
                scope.videos = scope.playlists[a].data;
            }
        }
    }

    function addVideoToPlaylist(scope, pname, video) {
        $http.post("/api/playlists/" + pname + "/videos/" + video.id)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    scope.videos.push(video);
                    scope.currentPlaylist.duration = addDuration(scope.currentPlaylist.duration, video.contentDetails.duration);
                    console.log("Success: Added a video.");
                }
            })
            .error(function(err) {
                alert("Error: Cannot add video.");
            });
    };


    //Returns the public API
    return ({
        listAllPlaylist: listAllPlaylist,
        addPlaylist: addPlaylist,
        listAllVideos: listAllVideos,
        addVideoToPlaylist: addVideoToPlaylist
    });
});

app.filter('searchFor', function() {

    // All filters must return a function. The first parameter
    // is the data that is to be filtered, and the second is an
    // argument that may be passed with a colon (searchFor:searchString)

    return function(arr, searchString) {

        if (!searchString) {
            return arr;
        }

        var result = [];

        searchString = searchString.toLowerCase();

        // Using the forEach helper method to loop through the array
        angular.forEach(arr, function(item) {

            if (item.name.toLowerCase().indexOf(searchString) !== -1) {
                result.push(item);
            }

        });

        return result;
    };

});
