angular.module('appServices').factory('PictureService', ['$http', '$q', function ($http, $q) {

    return {
        // call to get all nerds
        get: function () {
            var defer = $q.defer();
            
            $http({
                method: 'GET',
                url: '/pictures'
            }).then(function successCallback(response) {
                console.log(response);
                defer.resolve(response.data);
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