angular.module('app').controller('adminUsersCreateCtrl', function ($scope, $state, $stateParams, usersFactory) {
    $scope.user = {};

    $scope.create = function () {
        usersFactory.save(_.omit($scope.user, 'passwordVerify'), function () {
            $state.go('admin.users.list');
        }, function (result) {
            $scope.error = result.data.error;
        });
    };
});