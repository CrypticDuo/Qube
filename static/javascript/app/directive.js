app.directive('qubeDirective', function() {
  return {
      restrict: 'A',
      templateUrl: function(ele, attrs) {
          return attrs.src;
      }
  };
});
