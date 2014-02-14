angular.module('app')
    .directive('subview', function ($http, $templateCache, $compile, $parse) {
        return {
            restrict: 'E',
            link: function (scope, elm, attrs) {
                $http
                    .get($parse(attrs.data)(scope) + '.html', {
                        cache: $templateCache
                    }).success(function (tplContent) {
                        elm.replaceWith($compile(tplContent)(scope));
                    });
            }
        };
    });