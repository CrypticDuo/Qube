var app = angular.module( "QubeApp", [] );

app.controller('QubeCont', function($scope, QubeService) {
  
  function init(){
    $scope.playlists = QubeService.listAllPlaylist();
  }

  init();

});

app.service("QubeService", function( $http, $q ) {

  var hostURL = window.location.protocol + "://" + window.location.host;

  function listAllPlaylist() {
    $http.get(hostURL + "/listAllPlaylist", {
      params: {}
    })
    .success( function (res) {
      console.log(res);
      return res;
    })
    .error( function (err) {
      return err;
    });
  };

  //Returns the public API
  return({
    listAllPlaylist : listAllPlaylist
  });


});