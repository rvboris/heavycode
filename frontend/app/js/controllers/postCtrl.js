angular.module('app').controller('postCtrl', function ($rootScope, $scope, $stateParams, postsFactory, $timeout, $log, $location, $anchorScroll, $window, meta) {
    $scope.pageName = 'Блог';

    postsFactory.get({ id: $stateParams.id }).$promise.then(function (post) {
        $scope.post = post;

        $rootScope.meta = meta('post', post);

        var cancelRefresh = $timeout(function checkHC() {
            if (_.isUndefined($window.HC)) {
                cancelRefresh = $timeout(checkHC, 1000);
            } else {
                try {
                    $window.HC.widget('Stream', {
                        widget_id: 6177,
                        xid: post._id,
                        language: 'ru',
                        title: post.title,
                        CSS_READY: 1
                    });
                } catch (e) {
                    $log.error(e);
                }

                $timeout.cancel(cancelRefresh);
            }
        }, 1000);

        $timeout(function () {
            SyntaxHighlighter.highlight();
        });
    });

    if ($stateParams.comments) {
        $location.hash('comments');
        $anchorScroll();
    }
});