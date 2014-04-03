Error.stackTraceLimit = Infinity;

var path = require('path'),
    argv = require('optimist').argv,
    app = require('koa')(),
    router = require('koa-router')(app),
    serve = require('koa-file-server')(path.join(__dirname, 'frontend', argv.env === 'production' ? 'dist' : 'generated')).send,
    co = require('co'),
    thunkify = require('thunkify'),
    helpers = require('./helpers.js');

var mongo = require('co-easymongo')({
    dbname: 'hoursofcode'
});

app.posts = mongo.collection('posts');
app.users = mongo.collection('users');
app.tokens = mongo.collection('tokens');
app.images = mongo.collection('images');

co(function *() {
    app.postsNative = yield mongo.open('posts');
    app.postsNative.find = thunkify(app.postsNative.find);
    app.postsNative.distinct = thunkify(app.postsNative.distinct);

    app.imagesNative = yield mongo.open('images');
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

app.use(router);

// HTML5 Pushstate
app.use(function* (next) {
    if (this.response.status) {
        return;
    }

    yield serve.call(this);

    if (!this.response.status) {
        this.path = '/index.html';
    }

    yield serve.call(this);
    yield next;
});


require('./routes.js')(app);

app.listen(argv.port || 3000);