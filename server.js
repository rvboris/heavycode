Error.stackTraceLimit = Infinity;

var _ = require('lodash'),
    path = require('path'),
    argv = require('optimist').argv,
    app = require('koa')(),
    router = require('koa-router')(app),
    moment = require('moment'),
    userAgent = require('koa-useragent')(),
    serve = require('koa-file-server')({
        root: path.join(__dirname, 'frontend', argv.env === 'production' ? 'dist' : 'generated'),
        index: true,
        maxage: 43200 // 12 Hours
    }),
    co = require('co'),
    thunkify = require('thunkify'),
    phridge = require('phridge'),
    helpers = require('./helpers.js'),
    phantom;

phridge.spawn({ loadImages: false }).done(function (instance) {
    phantom = instance;
});

var mongo = require('co-easymongo')({
    dbname: 'heavycode'
});

app.posts = mongo.collection('posts');
app.users = mongo.collection('users');
app.tokens = mongo.collection('tokens');
app.images = mongo.collection('images');
app.cache = mongo.collection('cache');

var mongoNativeOpen = thunkify(mongo.open);

co(function *() {
    app.postsNative = yield mongoNativeOpen.apply(mongo, ['posts']);
    app.postsNative.find = thunkify(app.postsNative.find);
    app.postsNative.distinct = thunkify(app.postsNative.distinct);

    app.imagesNative = yield mongoNativeOpen.apply(mongo, ['images']);
    app.imagesNative.find = thunkify(app.imagesNative.find);
})();

if (argv.fake) {
    co(function *() {
        var Faker = require('Faker');

        (yield app.posts.find({})).forEach(co(function *(post) {
            yield app.posts.removeById(post._id);
        }));

        var date;

        for (var i = 0; i < 1000; i++) {
            date = helpers.randomDate(new Date(2005, 0, 1), new Date());

            yield app.posts.save({
                title: Faker.Lorem.words(4).join(' '),
                shortText: Faker.Lorem.sentences(15),
                fullText: Faker.Lorem.paragraphs(5),
                topics: Faker.Lorem.words(4),
                created: date,
                updated: date,
                draft: Faker.Helpers.randomize([true, false])
            });
        }

        process.exit(1);
    })();

    return;
}

co(function *() {
    var usersCount = yield app.users.count({});

    if (usersCount === 0) {
        yield app.users.save({ username: 'root', password: helpers.createHash('password') });
    }
})();

app.use(userAgent);

// Prerender for spiders
app.use(function *(next) {
    if (!this.req.userAgent.isBot || _.isUndefined(phantom)) {
        yield next;
        return;
    }

    if (this.path[this.path.length - 1] === '/' || this.path.indexOf('.html') >= 0) {
        var cachedPage = yield app.cache.find({ url: this.path });

        if (_.isEmpty(cachedPage)) {
            cachedPage = { url: this.path };
        } else {
            cachedPage = cachedPage[0];
        }

        if (!_.isUndefined(cachedPage.updated) && moment().diff(moment(cachedPage.updated)) <= (24 * 3600 * 1000)) {
            this.body = cachedPage.body;
        } else {
            var page = yield phantom.openPage('http://localhost:' + (argv.port || 3000) + this.path);

            this.body = yield page.run(function () {
                return this.frameContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            });

            cachedPage.body = this.body;

            yield page.run(function () {
                return this.close();
            });
        }

        cachedPage.updated = new Date();

        app.cache.save(cachedPage); // defer saving
    } else {
        yield next;
    }
});

app.use(router);
app.use(serve);

// HTML5 Pushstate
app.use(function* (next) {
    yield serve.send.call(this);

    if (this.response.status === 404) {
        this.path = '/';
    }

    yield serve.send.call(this);

    yield next;
});

app.on('error', function (err) {
    console.log(err.message);
});

require('./routes.js')(app);

app.listen(argv.port || 3000);