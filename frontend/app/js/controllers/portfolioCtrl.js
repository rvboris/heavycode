angular.module('app').controller('portfolioCtrl', function ($scope) {
    $scope.fancyOpen = function () {
        $.fancybox.open('.fancybox');
        return false;
    };
});