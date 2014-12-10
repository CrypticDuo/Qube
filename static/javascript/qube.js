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
        $scope.listDisplay = 'playlist';
        $scope.currentPlayingVideo = null;
        $scope.currentPlayingVideoDuration = '00:00'
        $scope.currentPlaylist = {};
        $scope.ytSearchResult = [];
        $scope.playlists = [];
        $scope.currentVideoTitle = 'No Playlist Selected';
        $scope.pageToken = '';
        $scope.lastSearch = '';
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

    function updateCurrentVideoTitle($scope, newTitle){
        $scope.currentVideoTitle = $scope.currentPlayingVideo.snippet.title;
        document.title = 'Qube - ' + $scope.currentVideoTitle;
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
            $scope.listAllVideos(playlist.name);
            $scope.togglePlayVideo('QubeChangePlaylist');
        }
    }

    $scope.loadFirstPlaylist = function(playlist) {
        if($scope.currentPlaylist.name !== playlist.name){
            $scope.currentPlaylist = playlist;
            $scope.listAllVideos(playlist.name);
        }
    }

    $scope.removePlaylist = function(playlist){
        //prevent outer div's event
        var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        QubeService.removePlaylist($scope, playlist.name);
    }

    $scope.updatePlaylist = function(list) {
        var newlist=[];
        var videolist = [];
        var datalist = [];
        for(var i = 0; i < list.length; i++){
            videolist = [];
            for(var j = 0; j < $scope.playlists.length; j++){
                if(list[i] === $scope.playlists[j].name){
                    for(var k = 0; k < $scope.playlists[j].data.length; k++){
                        videolist.push($scope.playlists[j].data[k].id);
                    }
                    datalist.push({
                        name: $scope.playlists[j].name,
                        videos: videolist
                    });
                    newlist.push($scope.playlists[j]);
                }
            }
        }
        if(JSON.stringify($scope.playlists) !== JSON.stringify(newlist)){
            $scope.playlists = newlist;
            QubeService.updatePlaylist($scope, datalist);
        }
        return;
    }

    $scope.listAllVideos = function(pname) {
        for (var a = 0; a < $scope.playlists.length; a++) {
            if ($scope.playlists[a].name === pname) {
                $scope.videos = $scope.playlists[a].data;
            }
        }
        $scope.currentPlaylistOption = pname;
    };

    $scope.addVideo = function(val, playlist) {
        QubeService.addVideoToPlaylist($scope, playlist, val);
    }

    $scope.removeVideo = function(videoId){
        //prevent outer div's event
        var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        QubeService.removeVideoFromPlaylist($scope, $scope.currentPlaylist.name, videoId);
    }

    $scope.updateVideoList = function(list) {
        var newlist=[];
        for(var i = 0; i < list.length; i++){
            for(var j = 0; j < $scope.videos.length; j++){
                if(list[i] === $scope.videos[j].id){
                    newlist.push($scope.videos[j]);
                }
            }
        }
        if(JSON.stringify($scope.videos) !== JSON.stringify(newlist)){
            $scope.videos = newlist;
            QubeService.updateVideoList($scope, $scope.currentPlaylist.name, list);
        }
        return;
    }

    $scope.queryYoutube = function(e, h) {
        if((e && e.which === 13) || h){
            if($scope.addVideoInput !== $scope.lastSearch){
                $scope.pageToken = "";
                $scope.lastSearch = $scope.addVideoInput;
            }
            $scope.ytSearchResult = [];
            $('.lcSearch > input').autocomplete("close");
            if(h)
                $scope.addVideoInput = h;
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
                    fields: 'nextPageToken, items/id,items/snippet/title,items/snippet/description,items/snippet/publishedAt,items/snippet/thumbnails/medium,items/snippet/channelTitle',
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
                        alertify.error('Error: Something went wrong querying video details.');
                    });
            })
            .error(function() {
                alertify.error('Error: Something went wrong querying video details.');
            });
    }

    $scope.appendContentDetail = function(data, contentDetailsData) {
        for (var i = 0; i < data.items.length; i++) {
            var formatted = convertYoutubeDuration(contentDetailsData.items[i].contentDetails.duration);
            var publishedAt = moment(data.items[i].snippet.publishedAt, "YYYYMMDD").fromNow();
            $scope.ytSearchResult.push({
                id: data.items[i].id.videoId,
                snippet: {
                    title: data.items[i].snippet.title,
                    date: publishedAt
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

    $scope.updatePlaylistDuration = function (playlist){
        playlist.duration = "00:00";
        for(var i=0; i<playlist.data.length; i++){
            playlist.duration = addDuration(playlist.duration, playlist.data[i].contentDetails.duration);
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
            $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
            updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
        }
        // from clicking play/pause button
        else {
            if (player.getPlayerState() === 1) {
                player.pauseVideo();
            } else if (player.getPlayerState() === 2) {
                player.playVideo();
            } else if (player.getPlayerState() === -1) {
                video = $scope.videos[0];
                player.loadVideoById(video.id);
                $scope.currentPlayingVideo = video;
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
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
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
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
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
                return;
            }
        }
    }

    $scope.changeVolume = function(volume) {
        player.setVolume(volume);
    }

    $scope.onPreviewClick = function(title){
        $scope.previewTitle = title;
    }

    init();
});

app.service("VideoService", function($http, $q) {
    //https://www.googleapis.com/youtube/v3/search

});

app.service("QubeService", function($http, $q) {

    var hostURL = "http://" + window.location.host;

    function getVideoDetails(target, data, scope) {
        var evt = data.shift();
        //puts the data contentDetails inside target
        if (!evt) {
            scope.loadFirstPlaylist(target[0]);
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
                getVideoDetails(target, data, scope);
            })
            .error(function() {
                alertify.error('Error: Something went wrong querying video details!');
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
        $http.get(hostURL + "/api/playlists")
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    scope.playlists = [];
                    getVideoDetails(scope.playlists, res.data, scope);
                }
            })
            .error(function(err) {
                alertify.error('Error: Cannot list all playlists.');
            });
    };

    function addPlaylist(scope, pname) {
        $http.post("/api/playlists/" + pname)
            .success(function(res) {
                if (res.status.toLowerCase() === "fail") {
                    if(res.msg.indexOf('Error:') === 0){
                        alertify.error(res.msg);
                    } else{
                        console.log(res.msg);
                    }
                } else {
                    scope.playlists.push({
                        name: pname,
                        data: [],
                        duration: "00:00"
                    });
                    alertify.success('Success: added a playlist.');
                }
            })
            .error(function(err) {
                alertify.error('Error: Failed to add playlist.');
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
                    alertify.success('Success: removed a playlist.');
                }
            })
            .error(function(err) {
                alertify.error('Error: removed a playlist.');
            });
    };

    function updatePlaylist(scope, list){
        var newList = JSON.stringify(list);
        $http.put("/api/playlists/" + newList)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    alertify.success('Success: updated playlist');
                }
            })
            .error(function(err){
                alertify.error('Error: Failed to update playlist.');
            });
    };

    function addVideoToPlaylist(scope, pname, video) {
        if(pname){
            $http.post("/api/playlists/" + pname + "/videos/" + video.id)
                .success(function(res) {
                    if (res.status.toLowerCase() === "fail") {
                        if(res.msg.indexOf('Error:') === 0){
                            alertify.error(res.msg);
                        } else{
                            console.log(res.msg);
                        }
                    } else {
                        for(var i = 0; i<scope.playlists.length; i++){
                            if(scope.playlists[i].name === pname){
                                scope.playlists[i].data.push(video);
                                scope.playlists[i].duration = addDuration(scope.playlists[i].duration, video.contentDetails.duration);
                            }
                        }
                        alertify.success('Success: Added a video.');
                    }
                })
                .error(function(err) {
                    alertify.error('Error: Failed to add video.');
                });
        } else {
            alertify.error('Error: Please choose a playlist first.');
        }
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
                    scope.updatePlaylistDuration(scope.currentPlaylist);
                    alertify.success('Success: Removed a video.');
                }
            })
            .error(function(err) {
                alertify.error('Error: Failed to remove video.');
            });
    };

    function updateVideoList(scope, pname, list){
        var newList = JSON.stringify(list);
        $http.put("/api/playlists/" + pname + "/list/" + newList)
            .success(function(res){
                if (res.status.toLowerCase() === "fail") {
                    console.log(res.msg);
                } else {
                    alertify.success('Success: updated video list.');
                }
            })
            .error(function(err){
                alertify.error('Error: Failed to update video list.');
            });
    };

    //Returns the public API
    return ({
        listAllPlaylist: listAllPlaylist,
        addPlaylist: addPlaylist,
        removePlaylist: removePlaylist,
        updatePlaylist: updatePlaylist,
        addVideoToPlaylist: addVideoToPlaylist,
        removeVideoFromPlaylist: removeVideoFromPlaylist,
        updateVideoList : updateVideoList,
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
