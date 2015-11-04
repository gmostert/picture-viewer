angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService, TagService) {
    $scope.selectedTags = [];

    TagService.getTags().then(function (tags) {
        $scope.tags = tags;
    });

    $scope.loadPictures = function() {
        console.log($scope.selectedTags);
//        $(this).button('loading')
        PictureService.getImages($scope.selectedTags).then(function (pictures) {
            $scope.pictures = pictures;
        });
    };
});
