angular.module('app').controller('adminUsersListCtrl', function ($scope, $stateParams, toaster, usersFactory) {
    usersFactory.query().$promise.then(function (users) {
        $scope.users = users;
    });

    $scope.deleteUser = function (user) {
        usersFactory
            .delete({ id: user._id }).$promise.then(function () {
                usersFactory.query().$promise.then(function (users) {
                    $scope.users = users;
                });
            }, function (result) {
                if (_.isUndefined(result.data.error)) {
                    return;
                }

                if (result.data.error === 'you can not remove yourself') {
                    toaster.pop('error', 'Ошибка', 'Вы не можете удалить самого себя');
                }
            });
    };
});