angular.module('app').controller('adminPostsListCtrl', function ($scope, $stateParams, postsFactory, toaster) {
    $scope.currentPage = _.parseInt($stateParams.page || 1);
    $scope.currentTopic = $stateParams.topic;

    postsFactory.count({ topic: $scope.currentTopic }).$promise.then(function (result) {
        $scope.postsCount = result.count;

        postsFactory.query({ page: $scope.currentPage, topic: $scope.currentTopic }).$promise.then(function (posts) {
            $scope.posts = posts;
        });
    });

    $scope.updatePost = function (post) {
        postsFactory.update({ id: post._id }, _.omit(post, '_id', 'created', 'updated'), function() {
            toaster.pop('success', undefined, 'Запись обновлена успешно');
        });
    };

    $scope.deletePost = function (post) {
        postsFactory
            .delete({ id: post._id }).$promise.then(function () {
                postsFactory.query({ page: $scope.currentPage, topic: $scope.currentTopic }).$promise.then(function (posts) {
                    $scope.posts = posts;
                });
            });
    };

    $scope.postsLimit = 10;
});