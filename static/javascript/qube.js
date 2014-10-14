var app = angular.module("QubeApp", []);

app.controller('QubeCont', function($scope, QubeService) {

    function init() {
        QubeService.listAllPlaylist($scope);
        $scope.layout = 'playlist';
        $scope.currentPlaylist = {};
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

    $scope.addVideo = function() {
        QubeService.addVideoToPlaylist($scope, $scope.currentPlaylist.name, $scope.addVideoInput);
        $scope.addVideoInput = '';
    }
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
