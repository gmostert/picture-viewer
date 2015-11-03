angular.module('appServices').factory('TagService', ['$http', '$q', function ($http, $q) {

    return {
        // call to get all nerds
        getTags: function () {
            var defer = $q.defer();

            $http({
                method: 'GET',
                url: '/tags'
            }).then(function successCallback(response) {
                console.log(response);
                defer.resolve(response.data);
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

            return defer.promise;
        }
    }

}]);
