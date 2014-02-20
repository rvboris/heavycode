angular.module('app')
    .directive('lepture', function () {
        return {
            restrict: 'A',
            link: function (scope, elm) {
                new Editor({ element: elm.get(0) }).render();
            }
        };
    });