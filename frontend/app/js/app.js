angular.module('app', ['ui.router', 'ngResource', 'pasvaz.bindonce', 'iso.directives']).run(function($rootScope, $state, $location, $anchorScroll, meta) {
    $rootScope.state = $state;
    $rootScope.token = false;

    $rootScope.goAnchor = function(anchor) {
        $location.hash(anchor);
        $anchorScroll();
    };

    $rootScope.goBack = function() {
        history.back();
    };

    $rootScope.isAdminPage = function() {
        return _.size($state.current.name.match('admin')) > 0;
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
        if (toState.name.match('admin') && toState.name !== 'admin.login' && !$rootScope.token) {
            event.preventDefault();
            $state.go('admin.login');
            return;
        }

        if (toState.name === 'admin.login' && $rootScope.token) {
            event.preventDefault();
            $state.go('admin.posts.list');
        }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
        $rootScope.directAccess = _.isEmpty(fromState.name) && fromState.url === '^' && fromState.abstract;

        if (toState.name !== 'post') {
            $rootScope.meta = meta(toState.name, toParams);
        }
    });

    var getFullPostUrl = function(postId) {
        return $location.absUrl() + encodeURIComponent($state.href('post', { id: postId }));
    };

    $rootScope.twitterShareUrl = function(post) {
        return 'https://twitter.com/share?text=' + encodeURIComponent(post.title) + '&url=' + getFullPostUrl(post._id) + '&lang=ru';
    };

    $rootScope.googleShareUrl = function(post) {
        return 'https://plus.google.com/share?url=' + getFullPostUrl(post._id) + '&hl=ru';
    };

    $rootScope.facebookShareUrl = function(post) {
        return 'https://www.facebook.com/sharer.php?u=' + getFullPostUrl(post._id);
    };
});