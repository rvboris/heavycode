module.exports = require(process.env['LINEMAN_MAIN']).config.extend('application', {
    server: {
        pushState: false,
        apiProxy: {
            enabled: true,
            port: 3000
        }
    }
});