var app = angular.module("QubeApp", []);

app.controller('QubeCont', function($scope, $http, QubeService) {

    function init() {
        QubeService.listAllPlaylist($scope);
        $scope.layout = 'playlist';
        $scope.currentPlaylist = {};
        $scope.ytSearchResult = [];
    }

    init();

    $scope.addPlaylist = function() {
        QubeService.addPlaylist($scope, $scope.addPlaylistInput);
        $scope.addPlaylistInput = '';
    }

    $scope.changePlaylist = function (playlist){
        $scope.currentPlaylist = playlist;
        QubeService.listAllVideos($scope, playlist.name);
    }

    $scope.addVideo = function(val) {
        QubeService.addVideoToPlaylist($scope, $scope.currentPlaylist.name, val);
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

    $scope.appendContentDetail = function (data, contentDetailsData){
        $scope.ytSearchResult = [];
        for (var i = 0; i < data.items.length; i++) {
            var string = contentDetailsData.items[i].contentDetails.duration,
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

            $scope.ytSearchResult.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                thumbnail: data.items[i].snippet.thumbnails.medium.url,
                author: data.items[i].snippet.channelTitle,
                duration: formatted,
                views: contentDetailsData.items[i].statistics.viewCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            });
        }
    }
});

app.service("VideoService", function($http, $q){
    //https://www.googleapis.com/youtube/v3/search

});

app.service("QubeService", function($http, $q) {

    var hostURL = "http://" + window.location.host;

    function listAllPlaylist(scope) {
        $http.get(hostURL + "/api/playlists")
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    console.log(res.data);
                    scope.playlists = res.data;
                }
            })
            .error(function(err) {
                alert("Error: Cannot list all playlists.");
            });
    };

    function addPlaylist(scope, pname) {
        $http.post("/api/playlists/"+pname)
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    listAllPlaylist(scope);
                    console.log("Success: added a playlist.");
                }
            })
            .error(function(err) {
                alert("Error: Cannot add playlist.");
            });
    };
    function listAllVideos(scope, pname) {
        $http.get(hostURL + "/api/playlists/"+pname)
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    console.log(res.data);
                    scope.videos = res.data;
                }
            })
            .error(function(err) {
                alert("Error: Cannot list all videos.");
            });
    }

    function addVideoToPlaylist(scope, pname, v_id) {
        $http.post("/api/playlists/"+pname+"/videos/"+v_id)
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    listAllVideos(scope, pname);
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

app.filter('searchFor', function(){

	// All filters must return a function. The first parameter
	// is the data that is to be filtered, and the second is an
	// argument that may be passed with a colon (searchFor:searchString)

	return function(arr, searchString){

		if(!searchString){
			return arr;
		}

		var result = [];

		searchString = searchString.toLowerCase();

		// Using the forEach helper method to loop through the array
		angular.forEach(arr, function(item){

			if(item.name.toLowerCase().indexOf(searchString) !== -1){
				result.push(item);
			}

		});

		return result;
	};

});
