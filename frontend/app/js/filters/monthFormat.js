angular.module('app')
    .filter('monthFormat', function ($filter) {
        return function (date) {
            return $filter('date')(date, 'MMM').substring(0, 3);
        };
    });