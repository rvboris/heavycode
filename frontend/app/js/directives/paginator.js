angular.module('app')
    .directive('paginator', function() {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'partials/paginator.html',
            scope: {
                page: '=',
                total: '=',
                limit: '=',
                stateName: '='
            },
            link: function(scope) {
                var createPage = function(page) {
                    return {
                        number: page,
                        active: page === scope.page
                    };
                };

                var createPrevPage = function() {
                    return _.assign(createPage(scope.page - 1), {
                        disabled: scope.page <= 1,
                        isPrev: true
                    });
                };

                var createNextPage = function() {
                    return _.assign(createPage(scope.page + 1), {
                        disabled: scope.page >= scope.totalPages,
                        isNext: true
                    });
                };

                var calcPages = _.throttle(function() {
                    if (_.isUndefined(scope.total)) {
                        return;
                    }

                    scope.totalPages = Math.ceil(scope.total / scope.limit);
                    scope.pages = [];

                    scope.prevPage = createPrevPage();

                    for (var page = 1; page <= scope.totalPages; page++) {
                        if (scope.page < 5) {
                            if (page < 6) {
                                scope.pages.push(createPage(page));
                            } else if (page === scope.totalPages - 1) {
                                scope.pages.push(createPage(false));
                            } else if (page === scope.totalPages) {
                                scope.pages.push(createPage(page));
                            }
                        } else if (scope.page > scope.totalPages - 4) {
                            if (page > scope.totalPages - 5) {
                                scope.pages.push(createPage(page));
                            } else if (page === scope.totalPages - 6) {
                                scope.pages.push(createPage(false));
                            } else if (page === 1) {
                                scope.pages.push(createPage(page));
                            }
                        } else {
                            if (page === 1 || page === scope.totalPages) {
                                scope.pages.push(createPage(page));
                            }
                            if (page === 2 || page === scope.totalPages - 1) {
                                scope.pages.push(createPage(false));
                            }
                            if (page >= scope.page - 1 && page <= scope.page + 1) {
                                scope.pages.push(createPage(page));
                            }
                        }
                    }

                    scope.nextPage = createNextPage();
                }, 100);

                scope.$watch('page', calcPages);
                scope.$watch('total', calcPages);
                scope.$watch('limit', calcPages);
            }
        };
    });