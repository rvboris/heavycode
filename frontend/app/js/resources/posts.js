angular.module('app').factory('postsFactory', function($resource) {
    return $resource('/api/posts/:id', { id: '@id' }, {
        count: { url: '/api/posts/count', 'method': 'GET', isArray: false },
        topics: { url: '/api/posts/topics', 'method': 'GET', isArray: false },
        archive: { url: '/api/posts/archive', 'method': 'GET', isArray: false },
        update: { method: 'PUT' }
    });
});