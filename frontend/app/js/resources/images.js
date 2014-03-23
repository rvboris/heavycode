angular.module('app').factory('imagesFactory', function($resource) {
    return $resource('/api/images/:id', { id: '@id' });
});