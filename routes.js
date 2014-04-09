var body = require('koa-body')(),
    crypto = require('crypto'),
    thunkify = require('thunkify'),
    moment = require('moment'),
    helpers = require('./helpers.js'),
    _ = require('lodash'),
    co = require('co'),
    formidable = require('koa-formidable'),
    fs = require('fs'),
    Feed = require('feed');

moment.lang('ru');
crypto.randomBytes = thunkify(crypto.randomBytes);
fs.readFile = thunkify(fs.readFile);
fs.unlink = thunkify(fs.unlink);

module.exports = function (app) {
    var auth = new helpers.Auth(app);

    app.post('/api/login', body, function *(next) {
        if (_.isEmpty(this.request.body.username) || _.isEmpty(this.request.body.password)) {
            this.status = 400;
            this.body = { error: 'username and password is required' };
            yield next;
            return;
        }

        var user = yield app.users.find({ username: this.request.body.username });

        if (_.size(user) === 0) {
            this.status = 401;
            this.body = { error: 'user not found' };
            yield next;
            return;
        }

        user = user[0];

        if (helpers.createHash(this.request.body.password) !== user.password) {
            this.status = 401;
            this.body = { error: 'auth failed' };
            yield next;
            return;
        }

        yield auth.removeOldTokens();

        var tokens = yield app.tokens.find({ userId: user._id });

        if (_.size(tokens) > 0) {
            var token = tokens[0];
            token.updated = new Date();
            token = yield app.tokens.save(token);
            this.body = { token: token._id };
            yield next;
            return;
        }

        this.body = { token: (yield app.tokens.save({ created: new Date(), updated: new Date(), userId: user._id }))._id };
        yield next;
    });

    app.get('/api/logout', auth.check, function *(next) {
        yield app.tokens.removeById(this.req.headers.token);
        this.status = 200;
        yield next;
    });

    app.get('/api/posts', function *(next) {
        var find = {};

        if (!_.isUndefined(this.query.topic)) {
            find.topics = { $all: this.query.topic.split(',') };
        }

        if (!(yield auth.checkToken(this.req.headers.token))) {
            find.draft = false;
        }

        this.body = yield app.posts.find(find, { limit: 10, skip: (this.query.page - 1 || 0) * 10, sort: { updated: -1 } });
        yield next;
    });

    app.get('/api/posts/count', function *(next) {
        var find = {};

        if (!_.isUndefined(this.query.topic)) {
            find.topics = { $all: this.query.topic.split(',') };
        }

        if (!(yield auth.checkToken(this.req.headers.token))) {
            find.draft = false;
        }

        this.body = { count: (yield app.posts.count(find)) };
        yield next;
    });

    app.get('/api/posts/topics', function *(next) {
        if (_.isUndefined(this.query.query) || _.size(this.query.query) < 2) {
            this.status = 400;
            yield next;
            return;
        }

        this.body = {
            topics: _.filter((yield app.postsNative.distinct('topics')), function (topic) {
                return topic.match(new RegExp('^' + this.query.query + '.+'));
            }, this)
        };
        yield next;
    });

    app.get('/api/posts/archive', function *(next) {
        var find = {};

        if (!(yield auth.checkToken(this.req.headers.token))) {
            find.draft = false;
        }

        var posts = yield thunkify((yield app.postsNative.find(find, { shortText: 0, fullText: 0, created: 0, draft: 0 })).toArray)();

        posts = _.groupBy(posts, function (post) {
            return moment(post.updated).format('YYYY');
        });

        _.forEach(posts, function (postsByYear, year) {
            posts[year] = _.groupBy(postsByYear, function (post) {
                return moment(post.updated).format('MMMM');
            });
        });

        this.body = posts;
        yield next;
    });

    app.post('/api/posts', auth.check, body, function *(next) {
        var post = this.request.body;

        if (!helpers.validatePost(post, this)) {
            this.status = 400;
            yield next;
            return;
        }

        post.created = new Date();
        post.updated = post.created;

        post = yield app.posts.save(post);

        this.body = post;

        var findedImagesIds = helpers.findObjectIdsInPost(post);

        if (_.size(findedImagesIds) > 0) {
            (yield app.images.find({ _id: { $in: findedImagesIds } })).forEach(co(function *(image) {
                image.postId = post._id;
                yield app.images.save(image);
            }));
        }

        yield next;
    });

    app.get('/api/posts/:post', function *(next) {
        if (_.isEmpty(this.params.post)) {
            this.status = 400;
            yield next;
            return;
        }

        var post = yield app.posts.findById(this.params.post);

        if (_.isEmpty(post)) {
            this.status = 404;
            yield next;
            return;
        }

        if (!(yield auth.checkToken(this.req.headers.token)) && post.draft) {
            this.status = 403;
            yield next;
            return;
        }

        this.body = post;
        yield next;
    });

    app.put('/api/posts/:post', auth.check, body, function *(next) {
        var post = yield app.posts.findById(this.params.post);

        if (_.isEmpty(post)) {
            this.status = 404;
            yield next;
            return;
        }

        if (!helpers.validatePost(this.request.body, this)) {
            this.status = 400;
            yield next;
            return;
        }

        _.assign(post, this.request.body);

        post.updated = new Date();
        post = yield app.posts.save(post);

        var findedImagesIds = helpers.findObjectIdsInPost(post);
        var relatedImagesIds = _.map((yield app.images.find({ postId: post._id })), function (image) {
            return image._id;
        });

        yield app.images.update({ _id: { $in: _.difference(relatedImagesIds, findedImagesIds) } }, { $unset: { postId: true } });

        if (_.size(findedImagesIds) > 0) {
            (yield app.images.find({ _id: { $in: findedImagesIds } })).forEach(co(function *(image) {
                image.postId = post._id;
                yield app.images.save(image);
            }));
        }

        this.status = 200;
        yield next;
    });

    app.del('/api/posts/:post', auth.check, function *(next) {
        var postToDelete = yield app.posts.findById(this.params.post);

        yield app.images.update({ postId: postToDelete._id }, { $unset: { postId: true } });
        yield app.posts.remove(postToDelete);

        this.status = 200;
        yield next;
    });

    app.post('/api/images', auth.check, function *(next) {
        var image = (yield formidable.parse(this)).files.file;
        app.images.save({ data: (yield fs.readFile(image.path)), type: image.type });
        yield fs.unlink(image.path);
        this.status = 200;
        yield next;
    });

    app.get('/api/images', auth.check, function *(next) {
        this.body = yield thunkify((yield app.imagesNative.find({ postId: { $exists: false } }, { data: 0, type: 0 })).toArray)();
        yield next;
    });

    app.get('/api/images/:image', function *(next) {
        if (_.isEmpty(this.params.image)) {
            this.status = 404;
            yield next;
            return;
        }

        var image = yield app.images.findById(this.params.image);

        if (_.isEmpty(image)) {
            this.status = 404;
            yield next;
            return;
        }

        this.body = image.data.buffer;
        this.type = image.type;
        yield next;
    });

    app.del('/api/images/:image', auth.check, function *(next) {
        if (_.isEmpty(this.params.image)) {
            this.status = 404;
            yield next;
            return;
        }

        yield app.images.removeById(this.params.image);
        this.status = 200;
        yield next;
    });

    app.get('/api/users', auth.check, function *(next) {
        this.body = _.map((yield app.users.find({})), function (user) {
            return _.omit(user, 'password');
        });
        yield next;
    });

    app.get('/api/users/:user', auth.check, function *(next) {
        this.body = _.omit((yield app.users.findById(this.params.user)), '_id', 'password');
        yield next;
    });

    app.post('/api/users', auth.check, body, function *(next) {
        var user = this.request.body;

        if (!helpers.validateUser(user, this)) {
            this.status = 400;
            yield next;
            return;
        }

        if ((yield app.users.count({ username: user.username })) > 0) {
            this.status = 400;
            this.body = { error: 'user with that name already exists' };
            yield next;
            return;
        }

        yield app.users.save({ username: user.username, password: helpers.createHash(user.password) });
        this.status = 200;
        yield next;
    });

    app.put('/api/users/:user', auth.check, body, function *(next) {
        var user = yield app.users.findById(this.params.user);

        if (_.isEmpty(user)) {
            this.status = 404;
            yield next;
            return;
        }

        if (!helpers.validateUser(this.request.body, this)) {
            this.status = 400;
            yield next;
            return;
        }

        if (helpers.createHash(this.request.body.currentPassword) !== user.password) {
            this.status = 401;
            this.body = { error: 'invalid current password' };
            yield next;
            return;
        }

        user.password = helpers.createHash(this.request.body.password);

        yield app.users.save(user);

        this.status = 200;
        yield next;
    });

    app.del('/api/users/:user', auth.check, function *(next) {
        var user = yield app.users.findById(this.params.user);

        if (_.isEmpty(user)) {
            this.status = 404;
            yield next;
            return;
        }

        var tokens = yield app.tokens.find({ userId: user._id });

        if (!_.isEmpty(tokens)) {
            var selfToken = _.find(tokens, function (token) {
                return token._id.toString() === this.req.headers.token.toString();
            }, this);

            if (selfToken) {
                this.status = 400;
                this.body = { error: 'you can not remove yourself' };
                yield next;
                return;
            }

            yield app.tokens.removeById(selfToken._id);
        }

        yield app.users.removeById(user._id);

        this.status = 200;
        yield next;
    });

    app.get('/feed', function *(next) {
        var posts = yield app.posts.find({}, { limit: 10, skip: (this.query.page - 1 || 0) * 10, sort: { created: -1 } });

        var feed = new Feed({
            title: 'HeavyCode',
            description: 'Делюсь мыслями о фронтенд разработке и технологиях',
            link: 'http://heavycode.ru',
            updated: _.isUndefined(posts[0]) ? new Date() : posts[0].created,
            author: {
                name: 'Борис Рябов',
                link: 'https://heavycode.ru/contact/'
            }
        });

        var topics = [];

        _.each(posts, function (post) {
            feed.addItem({
                title: post.title,
                link: 'http://heavycode.ru/posts/' + post._id + '/',
                description: post.shortText,
                date: post.created
            });

            topics = _.union(topics, post.topics);
        });

        _.each(topics, function (topic) {
            feed.addCategory(topic);
        });

        this.body = feed.render(this.query.type === 'rss' ? 'rss-2.0' : 'atom-1.0');
        this.set('Content-Type', 'text/xml');

        yield next;
    });
};