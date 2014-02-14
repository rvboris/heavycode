module.exports = require(process.env.LINEMAN_MAIN).config.extend('files', {
    js: {
        vendor: [
            "vendor/bower/jquery/jquery.js",
            "vendor/bower/lodash/dist/lodash.js",
            "vendor/bower/jquery-mousewheel/jquery.mousewheel.js",
            "vendor/bower/isotope/jquery.isotope.js",
            "vendor/bower/fancybox/source/jquery.fancybox.js",
            "vendor/bower/angular/angular.js",
            "vendor/bower/angular-i18n/angular-locale_ru-ru.js",
            "vendor/bower/angular-ui-router/release/angular-ui-router.js",
            "vendor/bower/angular-resource/angular-resource.js",
            "vendor/bower/angular-bindonce/bindonce.js",
            "vendor/bower/angular-isotope/dist/angular-isotope.js",
            "vendor/bower/angular-local-storage/angular-local-storage.js"
        ],
        app: [
            "app/js/app.js",
            "app/js/**/*.js"
        ]
    },
    stylus: {
        generatedVendor: 'generated/css/vendor.styl.css',
        generatedApp: 'generated/css/style.css',
        vendor: 'vendor/css/**/*.styl',
        app: 'app/css/style.styl'
    },

    css: {
        vendor: [
            "vendor/bower/normalize-css/normalize.css",
            "vendor/uikit.almost-flat.css"
        ]
    }
});
