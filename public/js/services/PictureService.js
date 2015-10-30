angular.module('appServices').factory('PictureService', ['$http', '$q', function ($http, $q) {

    return {
        // call to get all nerds
        getImages: function () {
            var defer = $q.defer();
            
            $http({
                method: 'GET',
                url: '/pictures'
            }).then(function successCallback(response) {
                var images = new Array();
                // Connect to Binary.js server
                var client = new BinaryClient('ws://localhost:9050');
                // Received new stream from server!
                client.on('stream', function (stream, meta) {
                    console.log('STREAM');
                    var parts = [];

                    stream.on('data', function (data) {
                        parts.push(data);
                    });

                    stream.on('end', function () {
                        console.log('RECEIVED ' + meta);
                        images.push({
                            "url": (window.URL || window.webkitURL).createObjectURL(new Blob(parts))
                        });
                        // Tell server number of file received
                        client.send(images.length);
                    });

                    stream.on('close', function () {
                        defer.resolve(images);
                    });
                });
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
            
            return defer.promise;
        },


        // these will work when more API routes are defined on the Node side of things
        // call to POST and create a new nerd
        create: function (nerdData) {
            return $http.post('/api/nerds', nerdData);
        },

        // call to DELETE a nerd
        delete: function (id) {
            return $http.delete('/api/nerds/' + id);
        }
    }

}]);
