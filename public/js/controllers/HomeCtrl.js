angular.module('appCtrls').controller('HomeCtrl', function ($scope, PictureService) {
    PictureService.get().then(function (pictures) {
        $scope.pictures = pictures;
        
        // Connect to Binary.js server
        var client = new BinaryClient('ws://localhost:9050');
        // Received new stream from server!
        client.on('stream', function (stream, meta) {
            console.log('STREAM');
            // Buffer for parts
            var parts = [];
            // Got new data
            stream.on('data', function (data) {
                parts.push(data);
            });
            stream.on('end', function () {
                // Display new data in browser!
                var img = document.createElement("img");
                img.src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
                document.body.appendChild(img);
            });
        });
    });
});