angular.module('app').controller('archiveCtrl', function($scope, postsFactory) {
    postsFactory.count({ topic: $scope.currentTopic }).$promise.then(function(result) {
        $scope.pageName = 'Архив (' + result.count + ')';
    });

    $scope.archive = postsFactory.archive();
});