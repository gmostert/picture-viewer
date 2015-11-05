angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService, TagService) {
    $scope.selectedTags = new Array();
    $scope.loading = false;

    TagService.getTags().then(function (tags) {
        $scope.tags = tags;
    });

    $scope.loadPictures = function() {
//        console.log($scope.selectedTags);
        $scope.loading = true;
        $('#loadButton').button('loading');

        PictureService.getImages($scope.selectedTags).then(function (pictures) { /* pictures = [{url: 'blob://http..'}] */
//            console.log(pictures);
            var images = new Array();
            pictures.forEach(function(pic) {
                images.push({thumb: pic.url, img: pic.url});
            });

            $scope.pictures = images;
            $scope.loading = false;
            $('#loadButton').button('reset');
        });
    };
});
