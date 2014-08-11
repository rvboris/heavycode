angular.module('app')
    .directive('highlight', function ($timeout, $window) {
        return {
            restrict: 'A',
            link: function (scope, elm) {
                $timeout(function () {
                    if (_.isUndefined($window.hljs)) {
                        return;
                    }

                    elm.find('pre > code').each(function(i, el) {
                        $window.hljs.highlightBlock(el);
                    });
                });
            }
        };
    });