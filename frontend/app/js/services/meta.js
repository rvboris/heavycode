angular.module('app').factory('meta', function($filter, $location) {
    return function(stateName, stateParams) {
        var metaData = {};

        var defaultTitle = 'HoursOfCode: личный блог и портфолио - Борис Рябов';
        var defaultDescription = 'Делюсь мыслями о фронтенд разработке и технологиях';
        var defaultKeywords = ['nodejs', 'node', 'javascript', 'js', 'angular', 'angularjs', 'grunt', 'gulp', 'lineman', 'css3', 'html5', 'frontend', 'front-end', 'разработка', 'веб-разработка', 'веб разработка'];

        metaData.blog = function() {
            return {
                title: defaultTitle,
                description: defaultDescription,
                keywords: defaultKeywords.join(', '),
                ogType: 'website'
            };
        };

        metaData.topic = function(stateParams) {
            return {
                title: stateParams.topic + ' - записи по теме | HoursOfCode',
                description: 'Делюсь мыслями о ' + stateParams.topic,
                keywords: _.union([stateParams.topic], defaultKeywords).join(', '),
                ogType: 'website'
            };
        };

        metaData.post = function(post) {
            return {
                title: post.title + ' | HoursOfCode',
                description: $filter('limitTo')(post.shortText.replace(/<(?:.|\n)*?>/gm, ''), 190) + '...',
                keywords: post.topics.join(', '),
                ogType: 'article',
                ogPublishedTime: post.created,
                ogModifiedTime: post.updated,
                ogTopics: post.topics
            };
        };

        metaData.archive = function() {
            return {
                title: 'Архив | HoursOfCode',
                description: defaultDescription,
                keywords: defaultKeywords.join(', '),
                ogType: 'website'
            };
        };

        metaData.contact = function() {
            return {
                title: 'Борис Рябов - Контакты | HoursOfCode',
                description: defaultDescription,
                keywords: defaultKeywords.join(', '),
                ogType: 'profile'
            };
        };

        metaData.portfolio = function() {
            return {
                title: 'Борис Рябов - Портфолио | HoursOfCode',
                description: defaultDescription,
                keywords: defaultKeywords.join(', '),
                ogType: 'profile'
            };
        };

        var meta = metaData[stateName](stateParams);

        meta.location = $location.absUrl();

        return meta;
    };
});