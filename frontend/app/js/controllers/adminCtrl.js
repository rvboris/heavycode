angular.module('app').controller('adminCtrl', function ($scope, $state, adminFactory, localStorageService) {
    $scope.logout = function () {
        adminFactory.get(function () {
            localStorageService.clearAll();
            $state.go('blog');
        });
    };
});