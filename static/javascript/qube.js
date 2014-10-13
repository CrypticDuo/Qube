var app = angular.module("QubeApp", []);

app.controller('QubeCont', function($scope, QubeService) {

    function init() {
        QubeService.listAllPlaylist($scope);
        $scope.layout = 'playlist';
    }

    init();

    $scope.addPlaylist = function() {
        QubeService.addPlaylist($scope, $scope.addPlaylistInput);
        $scope.addPlaylistInput = '';
    }
});

app.service("QubeService", function($http, $q) {

    var hostURL = "http://" + window.location.host;

    function listAllPlaylist(scope) {
        $http.get(hostURL + "/listAllPlaylist", {
                params: {}
            })
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    console.log(res.data);
                    scope.playlists = res.data;
                }
            })
            .error(function(err) {
                alert("SOMETHING WRONG");
            });
    };

    function addPlaylist(scope, pname) {
        $http({
                method: "post",
                url: hostURL + "/addPlaylist",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: "playlistName=" + pname
            })
            .success(function(res) {
                if (res.status === "fail") {
                    console.log(res.msg);
                } else {
                    listAllPlaylist(scope);
                    console.log("Successfully added a playlist.");
                }
            })
            .error(function(err) {
                alert("WRONG");
            });
    };


    //Returns the public API
    return ({
        listAllPlaylist: listAllPlaylist,
        addPlaylist: addPlaylist
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
