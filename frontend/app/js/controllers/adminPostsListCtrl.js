angular.module('app').controller('adminPostsListCtrl', function ($scope, $stateParams, postsFactory) {
    $scope.currentPage = _.parseInt($stateParams.page || 1);
    $scope.currentTopic = $stateParams.topic;

    postsFactory.query({ page: $scope.currentPage, topic: $scope.currentTopic }).$promise.then(function(posts) {
        $scope.posts = posts;
    });

    postsFactory.count({ topic: $scope.currentTopic }).$promise.then(function (result) {
        $scope.postsCount = result.count;
    });

    $scope.postsLimit = 10;
});