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
        $scope.layout = 'main';
        $scope.currentPlayingVideo = null;
        $scope.currentPlaylist = {};
        $scope.ytSearchResult = [];
        $scope.playlists = [];
        $scope.current = 'No Playlist Selected';
        $scope.next = '';
        $scope.pageToken = '';
        $scope.lastSearch = '';
        $scope.listDisplay = 'youtube';
        QubeService.listAllPlaylist($scope);
        addInfiniteScroll();
    }

    function addInfiniteScroll(){
        $('.searchResultColumn').bind('scroll', function() {
            if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
                $scope.searchYt($scope.lastSearch, $scope.pageToken);
            }
        });
    }

    $scope.onSearch = function(query, callback) {
        QubeService.searchAutoComplete($scope, query, function(data){
            callback(data);
        });
    }

    $scope.addPlaylist = function() {
        QubeService.addPlaylist($scope, $scope.addPlaylistInput);
        $scope.addPlaylistInput = '';
    }

    $scope.changePlaylist = function(playlist) {
        if($scope.currentPlaylist.name !== playlist.name){
            $scope.currentPlaylist = playlist;
            $scope.listAllVideos($scope, playlist.name);
            $scope.togglePlayVideo('QubeChangePlaylist');
        }
    }

    $scope.removePlaylist = function(playlist){
        //prevent outer div's event
        var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        QubeService.removePlaylist($scope, playlist.name);
    }

    $scope.listAllVideos = function(scope, pname) {
        for (var a = 0; a < scope.playlists.length; a++) {
            if (scope.playlists[a].name === pname) {
                scope.videos = scope.playlists[a].data;
            }
        }
    };

    $scope.changePlaylist = function(playlist) {
        if($scope.currentPlaylist.name !== playlist.name){
            $scope.currentPlaylist = playlist;
            $scope.listAllVideos($scope, playlist.name);
            $scope.togglePlayVideo('QubeChangePlaylist');
        }
    }

    $scope.addVideo = function(val, playlist) {
        QubeService.addVideoToPlaylist($scope, playlist, val);
    }

    $scope.removeVideo = function(e, videoId){
        //prevent outer div's event
        e = e ? e : window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        QubeService.removeVideoFromPlaylist($scope, $scope.currentPlaylist.name, videoId);
    }

    $scope.queryYoutube = function(e) {
        if(e.which === 13){
            if($scope.addVideoInput !== $scope.lastSearch){
                $scope.pageToken = "";
                $scope.lastSearch = $scope.addVideoInput;
            }
            $scope.ytSearchResult = [];
            $('.youtubeSearchBar > input').autocomplete("close");
            $scope.searchYt($scope.addVideoInput);
        }
    }

    $scope.searchYt = function(val, pageToken) {
        $http.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: 'AIzaSyD62u1qRt4_QKzAKvn9frRCDRWsEN2_ul0',
                    type: 'video',
                    maxResults: '20',
                    part: 'id,snippet',
                    pageToken: pageToken,
                    fields: 'nextPageToken, items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/medium,items/snippet/channelTitle',
                    q: val
                }
            })
            .success(function(data) {
                videoIDlist = "";
                $scope.pageToken = data.nextPageToken;
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
        for (var i = 0; i < data.items.length; i++) {
            var formatted = convertYoutubeDuration(contentDetailsData.items[i].contentDetails.duration);
            $scope.ytSearchResult.push({
                id: data.items[i].id.videoId,
                snippet: {
                    title: data.items[i].snippet.title
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

    $scope.togglePlayVideo = function(video) {
        // from $scope.changePlaylist
        if (video) {
            if(video === 'QubeChangePlaylist'){
                video = $scope.videos[0];
                player.loadVideoById(video.id);
                $scope.currentPlayingVideo = video;
            }
            else if(video.id){
                player.loadVideoById(video.id);
                $scope.currentPlayingVideo = video;
            }
        }
        // from clicking play/pause button
        else {
            if (player.getPlayerState() === 1) {
                player.pauseVideo();
            } else if (player.getPlayerState() === 2) {
                player.playVideo();
            }

        }
    }

    $scope.prevVideo = function() {
        var index = 0;
        for(var i = 0; i < $scope.videos.length; i++){
            if($scope.currentPlayingVideo.id === $scope.videos[i].id){
                if(i === 0){
                    index=$scope.videos.length-1;
                        player.loadVideoById($scope.videos[index].id);
                }
                else{
                    index=i-1;
                    player.loadVideoById($scope.videos[index].id);
                }
                $scope.currentPlayingVideo = $scope.videos[index];
                return;
            }
        }
    }

    $scope.nextVideo = function() {
        var index = 0;
        for(var i = 0; i < $scope.videos.length; i++){
            if($scope.currentPlayingVideo.id === $scope.videos[i].id){
                if(i === $scope.videos.length-1){
                    player.loadVideoById($scope.videos[index].id);
                }
                else{
                    index = i+1;
                    player.loadVideoById($scope.videos[index].id);
                }
                $scope.currentPlayingVideo = $scope.videos[index];
                return;
            }
        }
    }

    $scope.changeVolume = function(volume) {
        player.setVolume(volume);
    }

    $scope.changeTopHeader = function() {
        var index = 0;
        $scope.current = $scope.currentPlayingVideo.snippet.title;
        for(var i = 0; i < $scope.videos.length; i++){
            if($scope.currentPlayingVideo.id === $scope.videos[i].id){
                if(i !== $scope.videos.length-1){
                    index = i+1;
                }
                $scope.next = $scope.videos[index].snippet.title;
                return;
            }
        }
    }

    $scope.refreshVideoList = function(list) {
        var newlist=[];
        for(var i = 0; i < list.length; i++){
            for(var j = 0; j < $scope.videos.length; j++){
                if(list[i] === $scope.videos[j].id){
                    newlist.push($scope.videos[j]);
                }
            }
        }
        $scope.videos = newlist;
        QubeService.updatePlaylist($scope, $scope.currentPlaylist.name, list);
        return;
    }
    init();
});

app.service("VideoService", function($http, $q) {
    //https://www.googleapis.com/youtube/v3/search

});

app.service("QubeService", function($http, $q) {

    var hostURL = "http://" + window.location.host;

    function getVideoDetails(target, data) {
        var evt = data.shift();
        //puts the data contentDetails inside target
        if (!evt) {
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
                getVideoDetails(target, data);
            })
            .error(function() {
                alert("Something went wrong querying video details!");
            });

    }

    function searchAutoComplete(scope, query, callback){
        $.ajax({
            url: "http://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&q="+query+"",
            dataType: 'jsonp',
        }).success(function(data) {

           var map = $.map( data[1], function(item) {
                return item[0];
            });
           callback(map);
        });

    }

    function listAllPlaylist(scope) {
        $http.get(hostURL + "/api/playlists")
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
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
                    scope.playlists.push({
                        name: pname,
                        data: [],
                        duration: "00:00"
                    });
                    console.log("Success: added a playlist.");
                }
            })
            .error(function(err) {
                alert("Error: Failed to add playlist.");
            });
    };

    function updatePlaylist(scope, pname, list){
        var test = JSON.stringify(list);
        $http.put("/api/playlists/" + pname + "/list/"+test)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    console.log("Success: updated playlist.");
                }
            })
            .error(function(err){
                alert("Error: Failed to update playlist.")
            });
    };

    function removePlaylist(scope, pname) {
        $http.delete("/api/playlists/" + pname)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    for(var i = 0; i < scope.playlists.length; i++){
                        if (scope.playlists[i].name === pname){
                            scope.playlists.splice(i, 1);
                            break;
                        }
                    }
                    if (scope.currentPlaylist.name === pname){
                        scope.videos = [];
                        scope.currentPlaylist = {};
                    }
                    console.log("Success: removed a playlist.");
                }
            })
            .error(function(err) {
                alert("Error: Failed to remove playlist.");
            });
    };

    function addVideoToPlaylist(scope, pname, video) {
        $http.post("/api/playlists/" + pname + "/videos/" + video.id)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    if(scope.currentPlaylist.name === pname)
                        scope.videos.push(video);
                    for(var i = 0; i<scope.playlists.length; i++){
                        if(scope.playlists[i].name === pname){
                            scope.playlists[i].data.push(video);
                            scope.playlists[i].duration = addDuration(scope.playlists[i].duration, video.contentDetails.duration);
                        }
                    }
                    console.log("Success: Added a video.");
                }
            })
            .error(function(err) {
                alert("Error: Failed to add video.");
            });
    };

    function removeVideoFromPlaylist(scope, pname, videoId){
        $http.delete("/api/playlists/" + pname + "/videos/" + videoId)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    for(var i = 0; i < scope.videos.length; i++){
                        if(videoId === scope.videos[i].id){
                            scope.videos.splice(i, 1);
                            break;
                        }
                    }
                    console.log("Success: Removed a video.");
                }
            })
            .error(function(err) {
                alert("Error: Failed to add video.");
            });
    };

    //Returns the public API
    return ({
        listAllPlaylist: listAllPlaylist,
        addPlaylist: addPlaylist,
        updatePlaylist: updatePlaylist,
        removePlaylist: removePlaylist,
        addVideoToPlaylist: addVideoToPlaylist,
        removeVideoFromPlaylist: removeVideoFromPlaylist,
        searchAutoComplete: searchAutoComplete,

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
