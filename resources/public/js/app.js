myApp = angular.module('myApp', ['ui.bootstrap']).config(
	[ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/images', {
			templateUrl : 'templates/images-list.html',
			controller : ImagesController
		}).when('/images/:imageId', {
			templateUrl : 'templates/image-detail.html',
			controller : ImageDetailController
		}).otherwise({
			redirectTo : '/images'
		});
	} ]);
