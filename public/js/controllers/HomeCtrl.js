angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService, TagService) {
    $scope.loading = false;
    var pictures;

    TagService.getTags().then(function (tags) {
        tagModel = new Array();
        tags.forEach(function(tag) {
            tag.selected = false;
            tagModel.push(tag);
        });
        $scope.tags = tagModel;
    });

    function getSelectedTags() {
        var selected = new Array();
        $scope.tags.forEach(function(tag) {
            if (tag.selected) {
                selected.push(tag.name);
            }
        });
//        console.log(selected);
        return selected;
    }

    function pictureReceived(picture) { /* picture = {url: 'blob://http..'} */
        pictures.push({thumb: picture.url, img: picture.url});
        $scope.pictures = pictures;
        $scope.$apply();
    }

    $scope.loadPictures = function() {
        pictures = new Array();
        $scope.loading = true;
        $('#loadButton').button('loading');

        PictureService.getImages(getSelectedTags(), pictureReceived).then(function () {
            $scope.loading = false;
            $('#loadButton').button('reset');
        });
    };
});
