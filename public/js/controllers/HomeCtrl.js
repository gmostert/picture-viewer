angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService, TagService) {
    $scope.loading = false;

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

    $scope.loadPictures = function() {
        $scope.loading = true;
        $('#loadButton').button('loading');

        PictureService.getImages(getSelectedTags()).then(function (pictures) { /* pictures = [{url: 'blob://http..'}] */
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
