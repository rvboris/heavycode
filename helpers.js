var crypto = require('crypto'),
    moment = require('moment'),
    _ = require('lodash'),
    co = require('co');

module.exports.createHash = function (src) {
    var password = crypto.createHash('sha512WithRSAEncryption').update(src);

    for (var i = 0; i <= 100; i++) {
        password = crypto.createHash('sha512WithRSAEncryption').update(password.digest('hex'));
    }

    return password.digest('hex');
};

module.exports.randomDate = function (start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

module.exports.findObjectIds = function (txt) {
    return txt.match(/[0-9a-fA-F]{24}/g) || [];
};

module.exports.findObjectIdsInPost = function(post) {
    var ids = [];

    if (!_.isEmpty(post.shortText)) {
        ids = _.union(ids, module.exports.findObjectIds(post.shortText));
    }

    if (!_.isEmpty(post.fullText)) {
        ids = _.union(ids, module.exports.findObjectIds(post.fullText));
    }

    return ids;
};

module.exports.validatePost = function (post, ctx) {
    if (_.isEmpty(post.title)) {
        ctx.body = { error: 'title is empty' };
        return false;
    }

    if (_.isEmpty(post.shortText)) {
        ctx.body = { error: 'shortText is empty' };
        return false;
    }

    if (_.size(post.topics) < 1) {
        ctx.body = { error: 'required one or more topics' };
        return false;
    }

    return true;
};

module.exports.validateUser = function (user, ctx) {
    if (_.isEmpty(user.username) || _.isEmpty(user.password)) {
        ctx.body = { error: 'username and password are required' };
        return false;
    }

    if (_.size(user.username) < 3) {
        ctx.body = { error: 'username must contents 3 or more chars' };
        return false;
    }

    if (_.size(user.password) < 8) {
        ctx.body = { error: 'password must contents 8 or more chars' };
        return false;
    }

    return true;
};

module.exports.Auth = function (app) {
    var self = this;

    this.removeOldTokens = function *() {
        (yield app.tokens.find({
            updated: { $lt: moment().subtract(1, 'days').toDate() }
        })).forEach(co(function *(token) {
            yield app.tokens.removeById(token._id);
        }));
    };

    this.isValidToken = function *(tokenId) {
        this.removeOldTokens();

        var token = yield app.tokens.findById(tokenId);

        if (_.isEmpty(token)) {
            return false;
        }

        var isValid = moment().diff(moment(token.updated)) <= (24 * 3600 * 1000);

        if (isValid) {
            token.updated = new Date();
            yield app.tokens.save(token);
        }

        return isValid;
    };

    this.checkToken = function *(token) {
        if (_.isUndefined(token)) {
            return false;
        }

        return yield this.isValidToken(token);
    };

    this.check = function *(next) {
        if (!(yield self.checkToken(this.req.headers.token))) {
            this.status = 403;
            return;
        }

        yield next;
    };
};

