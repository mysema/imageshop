var myApp = angular.module('myApp', []);

jQuery.event.props.push("dataTransfer");

myApp.directive("ngDragover", [ '$parse', function($parse) {
  return function(scope, elm, attrs) {
    console.log("ngDragover");
    var fn = $parse(attrs.ngDragover);
    elm.bind("dragover", function(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      scope.$apply(function() {
        fn(scope, { $event : evt });
      });
    });    
  }
}]);

myApp.directive("ngDrop", [ '$parse', function($parse) {
  return function(scope, elm, attrs) {
    console.log("ngDrop");
    var fn = $parse(attrs.ngDrop);
    elm.bind("drop", function(evt) {    
      evt.stopPropagation();
      evt.preventDefault();
      scope.$apply(function() {
        fn(scope, { $event : evt });
      });
    });    
  }
}]);