var app = angular.module( "QubeApp", [] );

app.controller('QubeCont', function($scope, QubeService) {
  
  function init(){
    QubeService.listAllPlaylist($scope);
  }

  init();

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

  //Returns the public API
  return({
    listAllPlaylist : listAllPlaylist
  });


});
