angular.module('app')
    .filter('stateClass', function () {
        return function (state) {
            return state.replace(new RegExp(/\./g), '-') + '-section';
        };
    });