angular.module('appServices').factory('PictureService', ['$http', '$q', function ($http, $q) {

    return {
        // call to get all nerds
        getImages: function (tags, callback) {
            var defer = $q.defer();
            
            if (tags.length === 0) {
                defer.resolve();
            }

            $http({
                method: 'GET',
                url: '/pictures',
                params: {
                    tags: tags
                }
            }).then(function successCallback(response) {
                // Connect to Binary.js server
                var client = new BinaryClient('ws://localhost:9050');
                // Received new stream from server!
                client.on('stream', function (stream, meta) {
//                    console.log('STREAM');
                    var parts = [];

                    stream.on('data', function (data) {
                        parts.push(data);
                    });

                    stream.on('end', function () {
//                        console.log('RECEIVED ' + meta);
                        // Notify server which file was received..
                        client.send(meta);
                        // Send caller the image that was received..
                        callback({"url": (window.URL || window.webkitURL).createObjectURL(new Blob(parts))});
                    });

                    stream.on('close', function () {
                        // Notify caller streaming is done..
                        defer.resolve();
                    });
                });
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
            
            return defer.promise;
        }
    }

}]);
