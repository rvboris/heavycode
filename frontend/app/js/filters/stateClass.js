angular.module('app')
    .filter('stateClass', function () {
        return function (state) {
            return state.replace('.', '-') + '-section';
        };
    });