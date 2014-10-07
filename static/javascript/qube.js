angular.module('QubeApp', [])
  .controller('QubeCont', ['$scope', function($scope, $http) {
    init();

    function init(){
      $scope.hostURL = window.location.protocol + "//" + window.location.host;
      $scope.playlists = $scope.getPlaylists();
    }
    
    $scope.getPlaylists = function(){
      $http.get($scope.hostURL + "/listAllPlaylist", {
        params: {}
      })
      .success( function (res) {
        console.log(res);
      })
      .error( function () {
        alert("input link is broken");
      });
    };


    $scope.addTodo = function() {
      $scope.todos.push({text:$scope.todoText, done:false});
      $scope.todoText = '';
    };
 
    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };
  }]);