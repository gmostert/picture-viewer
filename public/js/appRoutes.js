angular.module('appRoutes').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider

    // home page
    .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
    })

    // pictures page
    .when('/view', {
        templateUrl: 'views/picture.html',
        controller: 'PictureCtrl'
    });

    $locationProvider.html5Mode(true);

}]);