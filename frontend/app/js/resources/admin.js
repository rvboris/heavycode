angular.module('app').factory('adminFactory', function ($resource) {
    return $resource('/api/logout/');
});