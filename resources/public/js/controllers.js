

function GalleryController($scope, $http, $dialog) {
  
  $scope.images = [];
  
  $scope.toUpload = [];
  
  $scope.dndUpload = window.FileReader != undefined && window.FormData != undefined;
  
  $http.get('api/images').success(function(data) {
    $scope.images = data;
  });

  $scope.operations = [
    {id: 1, name: 'Lightning correction'}, 
    {id: 2, name: 'Red eye correction'}
  ];

  $scope.showOrder = function() {
    var atLeastOneOperationSelected = false;

    if ($scope.images == null) {
      return false;
    }

    for (var i = 0; i < $scope.images.length; i++) {
      var operations = $scope.images[i].operations;
      if (operations != null && operations.length > 0) {
        atLeastOneOperationSelected = true;
        break;
      }
    };

    return atLeastOneOperationSelected;
  }

  $scope.sendOrder = function() {
    // var title = 'Ready to send order',
    //     buttons = [{result: 'cancel', label: 'Cancel'}, {result: 'ok', label: 'OK', cssClass: 'btn-primary'}];

    var dialogOpts = {
      backdrop: true,
      templateUrl: 'templates/sendOrder.html',
      controller: 'SendOrderDialogController',
      resolve: {
        images: function() { return $scope.images; }, 
        operations: function() { return $scope.operations; }
      }
    };

    var dialog = $dialog.dialog(dialogOpts);

    dialog.open();

        // console.log("Sending order: ");
        // for (var i = 0; i < $scope.images.length; i++) {
        //   var operations = $scope.images[i].operations;
        //   if (operations != null && operations.length > 0) {
        //     console.log($scope.images[i].title + ": " + operations);
        //   }
        // }
  };
  
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

function SendOrderDialogController($scope, images, operations, dialog) {
  console.log(images);
  console.log(operations);

  $scope.images = images;
  $scope.operations = operations;

  $scope.getOperationName = function(id) {
    for (var i = 0; i < $scope.operations.length; i++) {
      if ($scope.operations[i].id === id) {
        return $scope.operations[i].name;
      }
    };

    return "Unknown operation";
  }

  $scope.close = function(result) {
    console.log("Sending order: ");
    console.log(images);
    for (var i = 0; i < images.length; i++) {
      var operations = images[i].operations;
      if (operations && operations.length > 0) {
        console.log(images[i].title + ": " + operations);
      }
    }

    dialog.close(result);
  };


}