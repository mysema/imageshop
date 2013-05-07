

function GalleryController($scope, $http) {
  
  $scope.images = [];
  
  $scope.toUpload = [];
  
  $scope.dndUpload = window.FileReader != undefined && window.FormData != undefined;
  
  $http.get('api/images').success(function(data) {
    $scope.images = data;
  });
  
  $scope.upload = function() {
    angular.forEach($scope.toUpload, function(img) {
      // XXX FormData is not available in IE8/9
      var formData = new FormData();
      formData.append("file", img.file, img.file.name);
      var postConfig = {
          transformRequest: function(d) { return d; },
          headers: {'Content-Type': null} // XXX otherwise it's application/json
      };
      $http.post("images", formData, postConfig).success(function(data) {
        if ($scope.images.indexOf(data) == -1) {
          $scope.images.push(data);  
        } else {
          console.log("Got duplicate image");
        }        
        var idx = $scope.toUpload.indexOf(img);
        $scope.toUpload.splice(idx, 1);
      });
    });
  }
    
  $scope.formSuccess = function(data) {
    console.log("formSuccess");
    if ($scope.images.indexOf(data) == -1) {
      $scope.images.push(data);  
    } else {
      console.log("Got duplicate image");
    }   
  }
    
  $scope.onDrop = function($event) {
    console.log("onDrop");
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      var files = $event.dataTransfer.files; 
      angular.forEach(files, function(file) {
        var img = {title: file.name, file:file};         
        // get preview
        var preview = new FileReader();
        preview.onload = function(e) { 
          img.tbnData = e.target.result;
          $scope.$apply(function(s) { s.toUpload.push(img); });
        };
        preview.readAsDataURL(file);
      });
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
  }
 
  $scope.onDragOver = function($event) {
    console.log("onDragOver");
    $event.dataTransfer.dropEffect = 'copy';
  }
  
}