angular.module('app').config(function ($provide, $locationProvider, $stateProvider, $urlRouterProvider) {
    $provide.decorator('$exceptionHandler', function ($delegate, $injector) {
        var toaster;

        return function (exception, cause) {
            toaster = toaster || $injector.get('toaster');
            toaster.pop('error', 'Ошибка', exception.message);
            $delegate(exception, cause);
        };
    });

    $locationProvider.html5Mode(true);

    $urlRouterProvider
        .otherwise('/')
        .when('/blog/', '/')
        .when('/login/', '/admin/login/')
        .when('/admin/', '/admin/posts/list/')
        .when('/admin/posts/', '/admin/posts/list/');

    $stateProvider
        // Blog states
        .state('blog', {
            url: '/?page',
            templateUrl: 'blog.html',
            controller: 'blogCtrl'
        })
        .state('topic', {
            url: '/topic/:topic/?page',
            templateUrl: 'blog.html',
            controller: 'blogCtrl'
        })
        .state('post', {
            url: '/posts/:id/?comments',
            templateUrl: 'post.html',
            controller: 'postCtrl'
        })
        // Archive
        .state('archive', {
            url: '/archive/',
            templateUrl: 'archive.html',
            controller: 'archiveCtrl'
        })
        // Contact
        .state('contact', {
            url: '/contact/',
            templateUrl: 'contact.html'
        })
        // Portfolio
        .state('portfolio', {
            url: '/portfolio/',
            templateUrl: 'portfolio.html',
            controller: 'portfolioCtrl'
        })
        // Admin states
        .state('admin', {
            url: '/admin',
            templateUrl: 'admin.html',
            controller: 'adminCtrl',
            abstact: true
        })
        .state('admin.login', {
            url: '/login/',
            templateUrl: 'admin-login.html',
            controller: 'adminLoginCtrl'
        })
        .state('admin.posts', {
            url: '/posts',
            templateUrl: 'admin-posts.html',
            controller: 'adminPostsCtrl',
            abstact: true
        })
        .state('admin.posts.list', {
            url: '/list/?page&topic',
            templateUrl: 'admin-posts-list.html',
            controller: 'adminPostsListCtrl'
        })
        .state('admin.posts.create', {
            url: '/create/',
            templateUrl: 'admin-posts-create.html',
            controller: 'adminPostsCreateCtrl'
        })
        .state('admin.posts.edit', {
            url: '/edit/',
            templateUrl: 'admin-posts-edit.html',
            controller: 'adminPostsEditCtrl'
        });
});
