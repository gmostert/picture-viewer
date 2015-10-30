angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService) {
    PictureService.getImages().then(function (pictures) {
        $scope.pictures = pictures;
    });
});
