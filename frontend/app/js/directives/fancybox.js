angular.module('app')
    .directive('fancybox', function () {
        return {
            restrict: 'A',
            link: function (scope, elm) {
                $(elm).find('.fancybox').fancybox();
                $(elm).find('a').on('click', function (e) {
                    e.preventDefault();
                });
            }
        };
    });