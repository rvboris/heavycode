var crypto = require('crypto');

module.exports.createHash = function(src) {
    var password = crypto.createHash('sha512WithRSAEncryption').update(src);

    for (var i = 0; i <= 100; i++) {
        password = crypto.createHash('sha512WithRSAEncryption').update(password.digest('hex'));
    }

    return password.digest('hex');
};

module.exports.randomDate = function(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

module.exports.validatePost = function(post, ctx) {
    if (_.isEmpty(post.title)) {
        ctx.body = { error: 'title is empty' };
        return false;
    }

    if (_.isEmpty(post.shortText)) {
        ctx.body = { error: 'shortText is empty' };
        return false;
    }

    if (_.isEmpty(post.fullText)) {
        ctx.body = { error: 'fullText is empty' };
        return false;
    }

    if (_.isArray(post.topics)) {
        ctx.body = { error: 'topics must be array' };
        return false;
    }

    if (_.size(post.topics) < 1) {
        ctx.body = { error: 'required one or more topics' };
        return false;
    }

    return true;
};

module.exports.simpleAuth = function *(next) {
    // TODO: check token

    yield next;
};