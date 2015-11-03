angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService, TagService) {
    TagService.getTags().then(function (tags) {
        $scope.tags = tags;
    });

    $scope.loadPictures = function() {
        //$(this).button('loading')
        PictureService.getImages(tags).then(function (pictures) {
            $scope.pictures = pictures;
        });
    };
});
