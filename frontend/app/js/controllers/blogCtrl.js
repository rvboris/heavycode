angular.module('app').controller('blogCtrl', function($scope, $state, $stateParams, postsFactory, $timeout, $log, $window) {
    $scope.currentPage = _.parseInt($stateParams.page || 1);
    $scope.currentTopic = $stateParams.topic;
    $scope.commentsIsReady = false;

    $scope.pageName = 'Блог' + ($scope.currentTopic ? (' - ' + $scope.currentTopic) : '');

    $scope.posts = postsFactory.query({ page: $scope.currentPage, topic: $scope.currentTopic });

    $scope.posts.$promise.then(function() {
        var cancelRefresh = $timeout(function checkHC() {
            if (_.isUndefined($window.HC)) {
                cancelRefresh = $timeout(checkHC, 1000);
            } else {
                try {
                    $window.HC.widget('Bloggerstream', {
                        widget_id: 6177,
                        selector: '.comments-count'
                    });
                } catch (e) {
                    $log.error(e);
                }

                $scope.commentsIsReady = true;
                $timeout.cancel(cancelRefresh);
            }
        }, 1000);
    });

    postsFactory.count({ topic: $scope.currentTopic }).$promise.then(function(result) {
        $scope.postsCount = result.count;
    });

    $scope.postsLimit = 10;
});