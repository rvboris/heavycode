angular.module('app').controller('adminPostsCreateCtrl', function ($rootScope, $scope, $state, $q, FileUploader, postsFactory, imagesFactory) {
    var topicsResourceAdapter = function (query) {
        var deferred = $q.defer();

        postsFactory.topics({ query: query }).$promise.then(function (result) {
            deferred.resolve(_.map(result.topics, function(topic) {
                return { text: topic };
            }));
        });

        return deferred.promise;
    };

    $scope.loadTopics = function (query) {
        return topicsResourceAdapter(query);
    };

    $scope.post = {};

    $scope.create = function () {
        var postToSave = $scope.post;

        postToSave.topics = _.map(postToSave.topics, function(topic) {
            return topic.text;
        });

        if (_.isEmpty(postToSave.fullText)) {
            delete postToSave.fullText;
        }

        postsFactory.save(postToSave, function () {
            $state.go('admin.posts.list', { page: 1 });
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

    $scope.uploader = new FileUploader({
        scope: $scope,
        url: '/api/images',
        headers: {
            token: $rootScope.token
        }
    });

    $scope.uploader.filters.push({
        name: 'imageFilter',
        fn: function(item) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|gif|'.indexOf(type) !== -1;
        }
    });

    $scope.uploader.onSuccessItem(function () {
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