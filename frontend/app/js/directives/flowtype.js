angular.module('app')
    .directive('flowtype', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs) {
                var params = {};

                if (!_.isEmpty(attrs.flowtype)) {
                    try {
                        params = angular.extend(params, angular.fromJson(attrs.flowtype));
                    } catch (e) {

                    }
                }

                $(elm).flowtype(params);
            }
        };
    });