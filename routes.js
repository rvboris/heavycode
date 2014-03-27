var parse = require('co-body'),
    crypto = require('crypto'),
    thunkify = require('thunkify'),
    moment = require('moment'),
    helpers = require('./helpers.js'),
    _ = require('lodash'),
    co = require('co'),
    formidable = require('koa-formidable'),
    fs = require('fs');

moment.lang('ru');
crypto.randomBytes = thunkify(crypto.randomBytes);
fs.readFile = thunkify(fs.readFile);
fs.unlink = thunkify(fs.unlink);

module.exports = function (app) {
    var auth = new helpers.Auth(app);

    app.post('/api/login', function *() {
        var authData = yield parse.json(this, { limit: '1kb' });

        if (_.isEmpty(authData.username) || _.isEmpty(authData.password)) {
            this.status = 400;
            this.body = { error: 'username and password is required' };
            return;
        }

        var user = yield app.users.find({ username: authData.username });

        if (_.size(user) === 0) {
            this.status = 401;
            this.body = { error: 'user not found' };
            return;
        }

        user = user[0];

        if (helpers.createHash(authData.password) !== user.password) {
            this.status = 401;
            this.body = { error: 'auth failed' };
            return;
        }

        yield auth.removeOldTokens();

        var tokens = yield app.tokens.find({ userId: user._id });

        if (_.size(tokens) > 0) {
            var token = tokens[0];
            token.updated = new Date();
            token = yield app.tokens.save(token);
            this.body = { token: token._id };
            return;
        }

        this.body = { token: (yield app.tokens.save({ created: new Date(), updated: new Date(), userId: user._id }))._id };
    });

    app.get('/api/logout', auth.check, function *() {
        yield app.tokens.removeById(this.req.headers.token);
        this.status = 200;
    });

    app.get('/api/posts', function *() {
        var find = {};

        if (!_.isUndefined(this.query.topic)) {
            find.topics = { $all: this.query.topic.split(',') };
        }

        if (!(yield auth.checkToken(this.req.headers.token))) {
            find.draft = false;
        }

        this.body = yield app.posts.find(find, { limit: 10, skip: (this.query.page - 1 || 0) * 10, sort: { updated: -1 } });
    });

    app.get('/api/posts/count', function *() {
        var find = {};

        if (!_.isUndefined(this.query.topic)) {
            find.topics = { $all: this.query.topic.split(',') };
        }

        if (!(yield auth.checkToken(this.req.headers.token))) {
            find.draft = false;
        }

        this.body = { count: (yield app.posts.count(find)) };
    });

    app.get('/api/posts/topics', function *() {
        if (_.isUndefined(this.query.query) || _.size(this.query.query) < 2) {
            this.status = 400;
            return;
        }

        this.body = {
            topics: _.filter((yield app.postsNative.distinct('topics')), function (topic) {
                return topic.match(new RegExp('^' + this.query.query + '.+'));
            }, this)
        };
    });

    app.get('/api/posts/archive', function *() {
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
    });

    app.post('/api/posts', auth.check, function *() {
        var post = yield parse(this, { limit: '15kb' });

        if (!helpers.validatePost(post, this)) {
            this.status = 400;
            return;
        }

        post.created = new Date();
        post.updated = post.created;

        post = yield app.posts.save(post);

        this.body = post;

        (yield app.images.find({ postId: { $exists: false } })).forEach(co(function *(image) {
            image.postId = post._id;
            yield app.images.save(image);
        }));
    });

    app.get('/api/posts/:post', function *() {
        if (_.isEmpty(this.params.post)) {
            this.status = 400;
            return;
        }

        var post = yield app.posts.findById(this.params.post);

        if (_.isEmpty(post)) {
            this.status = 404;
            return;
        }

        if (!(yield auth.checkToken(this.req.headers.token)) && post.draft) {
            this.status = 403;
            return;
        }

        this.body = post;
    });

    app.put('/api/posts/:post', auth.check, function *() {
        var post = yield app.posts.findById(this.params.post);

        if (_.isEmpty(post)) {
            this.status = 404;
            return;
        }

        var newData = yield parse(this, { limit: '15kb' });

        if (!helpers.validatePost(newData, this)) {
            this.status = 400;
            return;
        }

        _.assign(post, newData);

        post.updated = new Date();

        post = yield app.posts.save(post);

        (yield app.images.find({ postId: { $exists: false } })).forEach(co(function *(image) {
            image.postId = post._id;
            yield app.images.save(image);
        }));

        this.status = 200;
    });

    app.del('/api/posts/:post', auth.check, function *() {
        yield app.posts.removeById(this.params.post);
        this.status = 200;
    });

    app.post('/api/images', auth.check, function *() {
        var image = (yield formidable.parse(this)).files.file;
        app.images.save({ data: (yield fs.readFile(image.path)), type: image.type });
        yield fs.unlink(image.path);
        this.status = 200;
    });

    app.get('/api/images', auth.check, function *() {
        this.body = yield thunkify((yield app.imagesNative.find({ postId: { $exists: false } }, { data: 0, type: 0 })).toArray)();
    });

    app.get('/api/images/:image', function *() {
        if (_.isEmpty(this.params.image)) {
            this.status = 404;
            return;
        }

        var image = yield app.images.findById(this.params.image);

        if (_.isEmpty(image)) {
            this.status = 404;
            return;
        }

        this.body = image.data.buffer;
        this.type = image.type;
    });

    app.del('/api/images/:image', auth.check, function *() {
        if (_.isEmpty(this.params.image)) {
            this.status = 404;
            return;
        }

        yield app.images.removeById(this.params.image);

        this.status = 200;
    });

    app.get('/api/users', auth.check, function *() {
        this.body = _.map((yield app.users.find({})), function (user) {
            return _.omit(user, 'password');
        });
    });

    app.post('/api/users', auth.check, function *() {
        var user = yield parse(this, { limit: '1kb' });

        if (!helpers.validateUser(user, this)) {
            this.status = 400;
            return;
        }

        yield app.users.save({ username: user.username, password: helpers.createHash(user.password) });

        this.status = 200;
    });

    app.put('/api/users/:user', auth.check, function *() {
        var user = yield app.users.findById(this.params.user);

        if (_.isEmpty(user)) {
            this.status = 404;
            return;
        }

        var newData = yield parse(this, { limit: '15kb' });

        if (!helpers.validateUser(newData, this)) {
            this.status = 400;
            return;
        }

        if (helpers.createHash(newData.currentPassword) !== user.password) {
            this.status = 401;
            this.body = { error: 'auth failed' };
            return;
        }

        user.username = newData.username;
        user.password = helpers.createHash(user.password);

        yield app.users.save(user);

        this.status = 200;
    });

    app.del('/api/users/:user', auth.check, function *() {
        var user = yield app.users.findById(this.params.user);

        if (_.isEmpty(user)) {
            this.status = 404;
            return;
        }

        var token = yield app.tokens.find({ userId: user._id });

        if (!_.isEmpty(token)) {
            token = token[0];

            if (token._id.toString() === this.req.headers.token.toString()) {
                this.status = 400;
                this.body = { error: 'you can not remove yourself' };
                return;
            }

            yield app.tokens.removeById(token._id);
        }

        yield app.users.removeById(user._id);

        this.status = 200;
    });

    app.get('*', function *() {
        if (new RegExp('^\/api\/(posts|logout)\/').test(this.req.url) || this.status === 401) {
            return;
        }

        this.path = '/index.html';
    });
};