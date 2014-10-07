var app = angular.module( "QubeApp", [] );

app.controller('QubeCont', function($scope, QubeService) {
  
  function init(){
    QubeService.listAllPlaylist($scope);
  }

  init();
  
  $scope.addPlaylist=function(){
      QubeService.addPlaylist($scope, $scope.addPlaylistInput);
  }
});

app.service("QubeService", function( $http, $q ) {

  var hostURL = "http://" + window.location.host;

  function listAllPlaylist(scope) {
    $http.get(hostURL + "/listAllPlaylist", {
      params: {}
    })
    .success( function (res) {
      console.log(res.data);
      scope.playlists = res.data;
    })
    .error( function (err) {
      alert("SOMETHING WRONG");
    });
  };

  function addPlaylist(scope, pname) {
    $http.post(hostURL + "/addPlaylist", {
      params:{playlistName : pname}
    })
    .success( function (res) {
      listAllPlaylist(scope);
      console.log("Successfully added a playlist.");
    })
    .error( function(err) {
      alert("WRONG");
    });
  };


  //Returns the public API
  return({
    listAllPlaylist : listAllPlaylist,
    addPlaylist : addPlaylist
  });


});
