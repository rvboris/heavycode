var parse = require('co-body'),
    crypto = require('crypto'),
    thunkify = require('thunkify'),
    moment = require('moment'),
    helpers = require('./helpers.js'),
    _ = require('lodash'),
    co = require('co');

moment.lang('ru');
crypto.randomBytes = thunkify(crypto.randomBytes);

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
        this.redirect('/');
        this.status = 301;
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

        this.body = yield app.posts.save(post);
    });

    app.get('/api/posts/:post', function *() {
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

        this.body = yield app.posts.save(post);
    });

    app.delete('/api/posts/:post', auth.check, function *() {
        var post = yield app.posts.removeById(this.params.post);

        if (_.isEmpty(post)) {
            this.status = 404;
            return;
        }

        this.body = post;
    });

    app.get('*', function *() {
        if (new RegExp('^\/api\/(posts|logout)\/').test(this.req.url) || this.status === 401) {
            return;
        }

        this.path = '/index.html';
    });
};