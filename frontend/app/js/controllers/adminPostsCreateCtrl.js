angular.module('app').controller('adminPostsCreateCtrl', function ($scope, $q, postsFactory) {
    var topicsResourceAdapter = function (query) {
        var deferred = $q.defer();

        postsFactory.topics({ query: query }).$promise.then(function (result) {
            deferred.resolve(result.topics);
        });

        return deferred.promise;
    };

    $scope.loadTopics = function (query) {
        return topicsResourceAdapter(query);
    };
});