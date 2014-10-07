angular.module('QubeApp', [])
  .controller('QubeCont', ['$scope', function($scope, $http) {
    
    $scope.getPlaylists = function(){
      $http.get($scope.hostURL + "/listAllPlaylist", {
        params: {}
      })
      .success( function (res) {
        console.log(res);
        return res;
      })
      .error( function () {
        alert("input link is broken");
      });
    };
    
    function init(){
      $scope.hostURL = window.location.protocol + "://" + window.location.host;
      $scope.playlists = $scope.getPlaylists();
    }

    init();
  }]);