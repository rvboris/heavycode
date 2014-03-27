angular.module('app')
    .directive('nxEqual', function () {
        return {
            require: 'ngModel',
            scope: false,
            link: function (scope, elem, attrs, ctrl) {
                scope.$watch(attrs.nxEqual, function (value) {
                    ctrl.$setValidity('nxEqual', value === ctrl.$viewValue);
                });
                ctrl.$parsers.push(function (value) {
                    var isValid = value === scope.$eval(attrs.nxEqual);
                    ctrl.$setValidity('nxEqual', isValid);
                    return isValid ? value : undefined;
                });
            }
        };
    });