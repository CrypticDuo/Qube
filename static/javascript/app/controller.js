var app = angular.module("QubeApp", []);

const HOST_URL = location.protocol + '//' + location.host;

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
        $scope.hostUrl = HOST_URL;
        $scope.layout = 'main';
        $scope.listDisplay = 'playlist';
        $scope.currentPlayingVideo = null;
        $scope.currentPlayingVideoDuration = '00:00'
        $scope.currentPlaylist = {};
        $scope.playingPlaylist = {};
        $scope.ytSearchResult = [];
        $scope.ytSearchFirstView = true;
        $scope.playlists = [];
        $scope.currentVideoTitle = 'No Video Selected';
        $scope.pageToken = '';
        $scope.lastSearch = '';
        $scope.replay = 'all';
        $scope.shuffleState = false;
        $scope.shuffleList = [];
        $scope.trendingPlaylists = [];
        $scope.showFeatureModal = QubeService.getSeenFeatureModal($scope).then(function() {
            QubeService.listAllPlaylist($scope);
        });
        QubeService.getTrending($scope);
        addInfiniteScroll();
    }

    function addInfiniteScroll(){
        $('.searchResultColumn').bind('scroll', function() {
            if($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
                if($scope.lastSearch === true){
                    $scope.relatedSearch($scope.relateVideoId, $scope.pageToken);
                    return;
                }
                $scope.searchYt($scope.lastSearch, $scope.pageToken);
            }
        });
    }

    function updateCurrentVideoTitle($scope, newTitle){
        $scope.currentVideoTitle = $scope.currentPlayingVideo.snippet.title;
        document.title = '♫ ' + $scope.currentVideoTitle;
    }

    function getPlaylistData(playlist) {
        var videolist = [];
        for(var j = 0; j < playlist.data.length; j++){
            videolist.push(playlist.data[j].id);
        }
        return {
            _id: playlist._id,
            name: playlist.name,
            videos: videolist
        };
    }

    $scope.onSearch = function(query, callback) {
        QubeService.searchAutoComplete($scope, query, function(data){
            callback(data);
        });
    }

    $scope.addPlaylist = function(pname) {
        return QubeService.addPlaylist($scope, pname);
    }

    $scope.changePlaylist = function(playlist) {
        $scope.preventOuterDivEvent();
        if(playlist.data.length <= 0) {
          alertify.error('There are no videos in this playlist.');
          return;
        }

        if($scope.playingPlaylist._id !== playlist._id){
            $scope.currentPlaylist = playlist;
            $scope.playingPlaylist = playlist;
            $scope.shuffleList = [];
            $scope.listAllVideos(playlist);
            $scope.togglePlayVideo('QubeChangePlaylist');
        }
    }

    $scope.previewPlaylist = function(playlist) {
        $scope.currentPlaylist = playlist;
        $scope.listAllVideos(playlist);
    }

    $scope.previewAndViewPlaylist = function(playlist) {
        // TODO: remove once trending playlist updates in backend
        if(!playlist.type) {
            $scope.listDisplay = 'trending';
        } else {
            $scope.listDisplay = playlist.type;
        }
        $scope.previewPlaylist(playlist);
    }

    $scope.loadFirstPlaylist = function(playlist) {
        if($scope.currentPlaylist.name !== playlist.name){
            $scope.currentPlaylist = playlist;
            $scope.listAllVideos(playlist);
        }
    }

    $scope.removePlaylist = function(playlist){
        //prevent outer div's event
        $scope.preventOuterDivEvent();
        QubeService.removePlaylist($scope, playlist.name);
    }

    $scope.copyShareLink = function(playlist) {
      alertify.success('Share link has been copied to your clipboard.');
    }

    $scope.preventOuterDivEvent = function (){
        var e = window.event;
        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
    }

    $scope.editPlaylistName = function(value, playlistIndex) {
      if (value.replace(/\s/g, "").length === 0) {
          alertify.error('Playlist name can\'t be empty');
          return;
      }

      var datalist = [];
      for(var i = 0; i < $scope.playlists.length; i++){
          if($scope.playlists[i].name === value) {
            alertify.error('\'' + value + '\' playlist name already exists.');
            return false;
          }
          datalist.push(getPlaylistData($scope.playlists[i]));
      }
      datalist[playlistIndex].name = value;
      return QubeService.updatePlaylist($scope, datalist, 'Updated playlist name.').then(function(result) {
          if(result === true) {
            $scope.playlists[playlistIndex].name = value;
          }

          return result;
      });
    }

    $scope.addToMyPlaylist = function(playlist) {
      var newPlaylistName = playlist.name;
      var index = 0;

      var setOfPlaylistNames = new Set($scope.playlists.map(v => v.name));

      do {
        if (index > 0) {
          newPlaylistName += ' - ' + index;
        }
        index++;
      } while(setOfPlaylistNames.has(newPlaylistName));

      QubeService.addPlaylist($scope, newPlaylistName, false)
          .then(function(addedPlaylist) {
              var datalist = [];
              for(var i = 0; i < $scope.playlists.length; i++){
                  if($scope.playlists[i]._id === addedPlaylist._id) {
                      // deep copy
                      $scope.playlists[i].data = JSON.parse(JSON.stringify(playlist.data));
                      $scope.updatePlaylistDuration($scope.playlists[i]);
                  }

                  datalist.push(getPlaylistData($scope.playlists[i]));
              }

              return QubeService.updatePlaylist(
                  $scope,
                  datalist,
                  'Added \'' + playlist.name + '\'To Your Playlists'
              ).then(function(result) {
                  return result;
              });
          });
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
                        _id: $scope.playlists[j]._id,
                        name: $scope.playlists[j].name,
                        videos: videolist
                    });
                    newlist.push($scope.playlists[j]);
                    break;
                }
            }
        }
        if(JSON.stringify($scope.playlists) !== JSON.stringify(newlist)){
            $scope.playlists = newlist;
            QubeService.updatePlaylist($scope, datalist, 'Updated playlist order.');
        }
        return;
    }

    $scope.listAllVideos = function(playlist) {
        $scope.currentPlaylist.data = playlist.data;
        $scope.currentPlaylistOption = playlist.name;
    };

    $scope.addVideo = function(val, playlist) {
        QubeService.addVideoToPlaylist($scope, playlist, val);
    }

    $scope.removeVideo = function(videoId){
        $scope.preventOuterDivEvent();
        if($scope.currentPlayingVideo && videoId === $scope.currentPlayingVideo.id){
            $scope.nextVideo();
        }
        $scope.shuffleList = [];
        QubeService.removeVideoFromPlaylist($scope, $scope.currentPlaylist.name, videoId);
    }

    $scope.updateVideoList = function(list) {
        var newlist=[];
        for(var i = 0; i < list.length; i++){
            for(var j = 0; j < $scope.currentPlaylist.data.length; j++){
                if(list[i] === $scope.currentPlaylist.data[j].id){
                    newlist.push($scope.currentPlaylist.data[j]);
                }
            }
        }
        if(JSON.stringify($scope.currentPlaylist.data) !== JSON.stringify(newlist)){
            for(var i = 0; i<$scope.playlists.length; i++){
                if($scope.playlists[i].name === $scope.currentPlaylist.name){
                    $scope.playlists[i].data = newlist;
                    $scope.currentPlaylist.data = $scope.playlists[i].data;
                }
            }
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
    $scope.relatedSearch = function(videoId, pageToken){
        if (!videoId && !$scope.currentPlayingVideo) {
            alertify.error('Please play a video before using the discover feature.');
            return;
        }
        // coming from 'Search Related' icon
        if (videoId) {
          $scope.preventOuterDivEvent();
        }
        videoId = videoId || $scope.currentPlayingVideo.id.videoId || $scope.currentPlayingVideo.id;
        $scope.listDisplay = 'youtube';
        var parameters = {
            key: 'AIzaSyBPpFA_UqCYS5zVtMh6JsO-aC_AaO3aWhI',
            type: 'video',
            maxResults: '20',
            relatedToVideoId: videoId,
            part: 'id,snippet',
            pageToken: pageToken,
            fields: 'nextPageToken, items/id,items/snippet/title,items/snippet/description,items/snippet/publishedAt,items/snippet/thumbnails/medium,items/snippet/channelTitle'
        };
        $scope.lastSearch = true;
        $scope.relateVideoId = videoId;
        if(!pageToken) {
            $scope.ytSearchResult = [];
        }
        $scope.searchYt(null,null, parameters);
    }
    $scope.searchYt = function(val, pageToken, parameters) {
        if(!parameters){
            var parameters = {
                key: 'AIzaSyBPpFA_UqCYS5zVtMh6JsO-aC_AaO3aWhI',
                type: 'video',
                maxResults: '20',
                part: 'id,snippet',
                pageToken: pageToken,
                fields: 'nextPageToken, items/id,items/snippet/title,items/snippet/description,items/snippet/publishedAt,items/snippet/thumbnails/medium,items/snippet/channelTitle',
                q: val,
            };
        }
        $http.get('https://www.googleapis.com/youtube/v3/search', {
                params: parameters
            })
            .success(function(data) {
                videoIDlist = "";
                $scope.pageToken = data.nextPageToken;
                for (var i = 0; i < data.items.length; i++) {
                    videoIDlist = videoIDlist + data.items[i].id.videoId + ",";
                }
                $scope.searchYoutubeContentDetails(videoIDlist)
                    .success(function(contentDetailsData) {
                        for (var i = 0; i < data.items.length; i++) {
                            $scope.ytSearchResult.push($scope.appendContentDetail(i, data.items, contentDetailsData));
                        }
                    })
                    .error(function() {
                        alertify.error('Failed to query video details.');
                    });
            })
            .error(function() {
                alertify.error('Failed to search videos.');
            });
            if($scope.ytSearchFirstView) $scope.ytSearchFirstView = false;
    }

    $scope.discoverPlaylist = function(videoId) {
        $scope.preventOuterDivEvent();
        $scope.generateRelatedVideos(videoId, [], 8);
        alertify.success('Auto generating ...');
    }

    $scope.generateRelatedVideos = function(videoId, list, number) {
        if (number < 0) {
            $scope.addDiscoveredVideos(list);
            return;
        }
        var parameters = {
            key: 'AIzaSyBPpFA_UqCYS5zVtMh6JsO-aC_AaO3aWhI',
            type: 'video',
            maxResults: '3',
            relatedToVideoId: videoId,
            part: 'id,snippet',
            fields: 'nextPageToken, items/id,items/snippet/title,items/snippet/description,items/snippet/publishedAt,items/snippet/thumbnails/medium,items/snippet/channelTitle'
        };
        $http.get('https://www.googleapis.com/youtube/v3/search', {
                params: parameters
            })
            .success(function(data) {
                for (var a = 0; a < 3; a++) {
                    // check if result is already inside currentPlaylist
                    var count = 0;
                    for (var i = 0; i < $scope.currentPlaylist.data.length; i++) {
                        if (data.items[a].id.videoId == $scope.currentPlaylist.data[i].id) {
                            count++;
                        }
                    }
                    for (var i = 0; i < list.length; i++) {
                        if (data.items[a].id.videoId == list[i].id.videoId) {
                            count++;
                        }
                    }
                    //dne in currentPlaylist
                    if (count == 0) {
                        list.push(data.items[a]);
                        $scope.generateRelatedVideos(data.items[a].id.videoId, list, number-1);
                        return;
                    }
                }
                // all of related videos are already included
                $scope.generateRelatedVideos(null, list, -1);
            })
            .error(function() {
                alertify.error('Something went wrong with discover feature.');
            });

    }

    $scope.addDiscoveredVideos = function (data) {
        videoIdList = "";
        for (var i = 0; i < data.length; i++) {
            videoIdList = videoIdList + data[i].id.videoId + ",";
        }

        $scope.searchYoutubeContentDetails(videoIdList)
            .success(function(contentDetailsData) {
                for (var i = 0; i < data.length; i++) {
                    var video = $scope.appendContentDetail(i, data, contentDetailsData);

                    // TODO (Paul): use promise and on all complete, alertify user success
                    for(var a = 0; a< $scope.playlists.length; a++){
                        if($scope.playlists[a].name === $scope.currentPlaylist.name){
                            QubeService.addVideoToPlaylist($scope, $scope.playlists[a].name, video, false);
                        }
                    }
                }
                alertify.success('Discovered ' + data.length + ' new videos.');
            });
    }

    $scope.searchYoutubeContentDetails = function(videoIDlist) {
        return $http.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'contentDetails, statistics',
                    id: videoIDlist,
                    key: 'AIzaSyBPpFA_UqCYS5zVtMh6JsO-aC_AaO3aWhI'
                }
            });
    }

    $scope.appendContentDetail = function(index, dataItem, contentDetailsData) {
        var formatted = convertYoutubeDuration(contentDetailsData.items[index].contentDetails.duration);
        var publishedAt = moment(dataItem[index].snippet.publishedAt, "YYYYMMDD").fromNow();
        return {
            id: dataItem[index].id.videoId,
            snippet: {
                title: dataItem[index].snippet.title,
                date: publishedAt
            },
            description: dataItem[index].snippet.description,
            thumbnail: dataItem[index].snippet.thumbnails.medium.url,
            author: dataItem[index].snippet.channelTitle,
            contentDetails: {
                duration: formatted
            },
            views: contentDetailsData.items[index].statistics.viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        };
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
                video = $scope.currentPlaylist.data[0];
                player.loadVideoById(video.id);
                $scope.currentPlayingVideo = video;
            }
            else if(video.id){
                player.loadVideoById(video.id);
                $scope.playingPlaylist = $scope.currentPlaylist;
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
            } else if (player.getPlayerState() === 5) {
                video = $scope.currentPlaylist.data[0];
                player.loadVideoById(video.id);
                $scope.playingPlaylist = $scope.currentPlaylist;
                $scope.currentPlayingVideo = video;
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
            }

        }
    }
    $scope.shuffleToggle = function(){
        $scope.shuffleState = !$scope.shuffleState;
        if($scope.shuffleState){
            for(var i=0; i< $scope.playingPlaylist.data.length; i++){
                if($scope.currentPlayingVideo.id == $scope.playingPlaylist.data[i].id){
                    $scope.shuffleList[i] = true;
                    return;
                }
            }
        }
    }
    // TODO: Fix shuffle
    $scope.playRandom = function(){
        var randomIndex, i=0;
        while($scope.shuffleList[i] && i < $scope.playingPlaylist.data.length){
            i++;
        }
        if(i === $scope.playingPlaylist.data.length){
            $scope.shuffleList = [];
        }
        do{
            randomIndex = Math.floor(Math.random() * ($scope.playingPlaylist.data.length));
        } while($scope.shuffleList[randomIndex]);
        $scope.shuffleList[randomIndex] = true;
        player.loadVideoById($scope.playingPlaylist.data[randomIndex].id);
        $scope.currentPlayingVideo = $scope.playingPlaylist.data[randomIndex];
        $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
        updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
    }

    $scope.prevVideo = function() {
        if($scope.shuffleState === true){ // for playing random video
            $scope.playRandom();
            return;
        }
        var index = 0;
        for(var i = 0; i < $scope.playingPlaylist.data.length; i++){
            if($scope.currentPlayingVideo.id === $scope.playingPlaylist.data[i].id){
                if(i === 0){
                    index=$scope.playingPlaylist.data.length-1;
                    player.loadVideoById($scope.playingPlaylist.data[index].id);
                }
                else{
                    index=i-1;
                    player.loadVideoById($scope.playingPlaylist.data[index].id);
                }
                $scope.currentPlayingVideo = $scope.playingPlaylist.data[index];
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
                return;
            }
        }
    }

    $scope.nextVideo = function(data) {
        if(data === 'ended' && $scope.replay === 'one'){
            player.loadVideoById($scope.currentPlayingVideo.id);
            return;
        }
        if($scope.shuffleState === true){ // for playing random video
            $scope.playRandom();
            return;
        }

        var index = 0;
        for(var i = 0; i < $scope.playingPlaylist.data.length; i++){
            if($scope.currentPlayingVideo.id === $scope.playingPlaylist.data[i].id){
                if(i === $scope.playingPlaylist.data.length-1){
                    player.loadVideoById($scope.playingPlaylist.data[index].id);
                }
                else {
                    index = i+1;
                    player.loadVideoById($scope.playingPlaylist.data[index].id);
                }
                $scope.currentPlayingVideo = $scope.playingPlaylist.data[index];
                $scope.currentPlayingVideoDuration = $scope.currentPlayingVideo.contentDetails.duration;
                updateCurrentVideoTitle($scope, $scope.currentPlayingVideo.snippet.title);
                return;
            }
        }

        // TODO: no more next videos, reset
    }

    $scope.changeVolume = function(volume) {
        player.setVolume(volume);
    }

    $scope.onPreviewClick = function(title, video_id) {
        $('#previewOverlay').show();
        $('#addPlaylistModal').show();
        $scope.previewTitle = title;

        playerPreview.loadVideoById(video_id);

        previewPlayerState = player.getPlayerState();
        player.pauseVideo();
        playerPreview.playVideo();
    }

    $scope.checkPlaylistExists = function(){
        if($scope.playlists.length === 0) {
            alertify.error('Please add a playlist to add videos to.');
        }
    }

    init();
});
