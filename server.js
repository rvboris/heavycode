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
    helpers = require('./helpers.js');

var mongo = require('co-easymongo')({
    dbname: 'heavycode'
});

app.posts = mongo.collection('posts');
app.users = mongo.collection('users');
app.tokens = mongo.collection('tokens');
app.images = mongo.collection('images');

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

app.use(require('koa-prerender')({ prerender: 'http://localhost:3000/' }));
app.use(router);
app.use(serve);

// HTML5 Pushstate
app.use(function* (next) {
    if (this.path.indexOf('/api/') < 0) {
        yield serve.send.call(this);
    }

    var tmpPath = this.path;

    if (this.response.status === 404) {
        this.path = '/';
    }

    if (tmpPath.indexOf('/api/') < 0) {
        yield serve.send.call(this);
    }

    this.path = tmpPath;

    yield next;
});

app.on('error', function (err) {
    console.trace(err);
});

require('./routes.js')(app);

app.listen(argv.port || 3000);