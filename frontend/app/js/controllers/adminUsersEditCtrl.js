angular.module('app').controller('adminUsersEditCtrl', function ($scope, $state, $stateParams, usersFactory) {
    $scope.user = usersFactory.get({ id: $stateParams.id });

    $scope.update = function () {
        usersFactory.update({ id: $stateParams.id }, _.omit($scope.user, 'passwordVerify'), function () {
            $state.go('admin.users.list');
        }, function (result) {
            $scope.error = result.data.error;
        });
    };
});