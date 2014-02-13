angular.module('app').controller('adminLoginCtrl', function($rootScope, $state, $scope, $http) {
    $scope.login = function() {
        $http
            .post('/api/login', $scope.user)
            .success(function(result) {
                $rootScope.token = result.token;
                $state.go('admin.posts.list');
            })
            .error(function(result) {
                $scope.error = result.error;
            });
    };
});