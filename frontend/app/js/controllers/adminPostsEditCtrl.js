angular.module('app').controller('adminPostsEditCtrl', function ($rootScope, $scope, $state, $stateParams, $fileUploader, postsFactory, imagesFactory) {
    var topicsResourceAdapter = function (query) {
        var deferred = $q.defer();

        postsFactory.topics({ query: query }).$promise.then(function (result) {
            deferred.resolve(result.topics);
        });

        return deferred.promise;
    };

    $scope.loadTopics = function (query) {
        return topicsResourceAdapter(query);
    };

    $scope.post = postsFactory.get({ id: $stateParams.id });

    $scope.save = function () {
        postsFactory.update({ id: $scope.post._id }, _.omit($scope.post, '_id', 'created', 'updated'), function () {
            $state.go('post', { id: $scope.post._id });
        }, function (result) {
            $scope.error = result.data.error;
        });
    };

    $scope.editorOptions = {
        language: 'ru',
        extraPlugins: 'syntaxhighlight,base64image',
        toolbar: CKEDITOR.config.toolbar,
        allowedContent: true
    };

    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,
        url: '/api/images/',
        headers: {
            token: $rootScope.token
        }
    });

    uploader.filters.push(function (item) {
        var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
        type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    });

    uploader.bind('success', function () {
        $scope.images = imagesFactory.query();
    });

    $scope.activateImage = function (imageId) {
        $scope.activeImageUrl = '/api/images/' + imageId;
    };

    $scope.deleteImage = function (imageId) {
        imagesFactory
            .delete({ id: imageId }).$promise.then(function () {
                $scope.images = imagesFactory.query();
            });
    };

    $scope.$watch('images', function (images) {
        if (_.size(images) === 0) {
            $scope.activeImageUrl = '';
        }
    });

    $scope.images = imagesFactory.query();
});