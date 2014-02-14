angular.module('app').controller('adminLoginCtrl', function ($rootScope, $state, $scope, $http, localStorageService) {
    $scope.login = function () {
        $http
            .post('/api/login', $scope.user)
            .success(function (result) {
                $rootScope.token = result.token;

                if (!localStorageService.isSupported) {
                    localStorageService.add('token', {
                        token: $rootScope.token,
                        time: new Date()
                    });
                }

                $state.go('admin.posts.list');
            })
            .error(function (result) {
                $scope.error = result.error;
            });
    };
});