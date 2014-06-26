window.CKEDITOR = { on: function () {}, status: 'loaded', fake: true }; // Dynamic loading workaround
SyntaxHighlighter.defaults.toolbar = false;

angular.module('app', ['ui.router', 'ngResource', 'ngAnimate', 'pasvaz.bindonce', 'iso.directives', 'LocalStorageModule', 'toaster', 'ngTagsInput', 'ngCkeditor', 'angularFileUpload', 'chieffancypants.loadingBar'])
    .run(function ($rootScope, $state, $location, $anchorScroll, meta, localStorageService, $http) {
        $rootScope.state = $state;

        if (localStorageService.isSupported) {
            (function () {
                var token = localStorageService.get('token');

                if (_.isEmpty(token)) {
                    return;
                }

                var now = moment();

                if (now < moment(token.time).add('days', 1)) {
                    token.time = now;
                    localStorageService.add('token', token);
                    $rootScope.token = token.token;
                    return;
                }

                localStorageService.remove('token');
            })();
        } else {
            $rootScope.token = false;
        }

        var tokenTransformRequest = function (data, headersGetter) {
            var headers = headersGetter();
            headers['token'] = $rootScope.token;
            return data;
        };

        $rootScope.$watch('token', function (token) {
            if (!_.isString(token) || _.indexOf($http.defaults.transformRequest, tokenTransformRequest) >= 0) {
                return;
            }

            $http.defaults.transformRequest.push(tokenTransformRequest);
        });

        $rootScope.goAnchor = function (anchor) {
            $location.hash(anchor);
            $anchorScroll();
        };

        $rootScope.goBack = function () {
            history.back();
        };

        $rootScope.isAdminPage = function () {
            return _.size($state.current.name.match('admin')) > 0;
        };

        $rootScope.$on('$stateChangeStart', function (event, toState) {
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

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
            $rootScope.directAccess = _.isEmpty(fromState.name) && fromState.url === '^' && fromState.abstract;

            if (toState.name !== 'post') {
                $rootScope.meta = meta(toState.name, toParams);
            }
        });

        var getFullPostUrl = function (postId) {
            return $location.absUrl() + encodeURIComponent($state.href('post', { id: postId }));
        };

        $rootScope.twitterShareUrl = function (post) {
            return 'https://twitter.com/share?text=' + encodeURIComponent(post.title) + '&url=' + getFullPostUrl(post._id) + '&lang=ru';
        };

        $rootScope.googleShareUrl = function (post) {
            return 'https://plus.google.com/share?url=' + getFullPostUrl(post._id) + '&hl=ru';
        };

        $rootScope.facebookShareUrl = function (post) {
            return 'https://www.facebook.com/sharer.php?u=' + getFullPostUrl(post._id);
        };
    });