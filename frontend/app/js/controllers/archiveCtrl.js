angular.module('app').controller('archiveCtrl', function ($scope, postsFactory) {
    postsFactory.count({ topic: $scope.currentTopic }).$promise.then(function (result) {
        $scope.postsCount = result.count;
        $scope.pageName = 'Архив (' + result.count + ')';

        if (result.count > 0) {
            $scope.archive = postsFactory.archive();
        }
    });
});