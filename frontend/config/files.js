module.exports = function (lineman) {
    return {
        js: {
            vendor: [
                "vendor/bower/jquery/dist/jquery.js",
                "vendor/bower/lodash/dist/lodash.js",
                "vendor/bower/script.js/dist/script.js",
                "vendor/bower/jquery-mousewheel/jquery.mousewheel.js",
                "vendor/bower/isotope/jquery.isotope.js",
                "vendor/bower/fancybox/source/jquery.fancybox.js",
                "vendor/bower/angular/angular.js",
                "vendor/bower/angular-i18n/angular-locale_ru-ru.js",
                "vendor/bower/angular-ui-router/release/angular-ui-router.js",
                "vendor/bower/angular-resource/angular-resource.js",
                "vendor/bower/angular-bindonce/bindonce.js",
                "vendor/bower/angular-isotope/dist/angular-isotope.js",
                "vendor/bower/angular-local-storage/angular-local-storage.js",
                "vendor/bower/angular-animate/angular-animate.js",
                "vendor/bower/angular-notify-toaster/toaster.js",
                "vendor/bower/ng-tags-input/ng-tags-input.js",
                "vendor/bower/ng-ckeditor/ng-ckeditor.js",
                "vendor/bower/angular-file-upload/angular-file-upload.js",
                "vendor/bower/FlowType.JS/flowtype.js",
                "vendor/bower/moment/moment.js",
                "vendor/bower/angular-loading-bar/src/loading-bar.js"
            ],
            app: ["app/js/app.js", "app/js/**/*.js"]
        },

        stylus: {
            generatedVendor: "generated/css/vendor.styl.css",
            generatedApp: "generated/css/style.css",
            vendor: "vendor/css/**/*.styl",
            app: "app/css/style.styl"
        },

        less: {
            main: "vendor/bower/bootstrap/less/bootstrap.less"
        },

        css: {
            vendor: [
                "vendor/bower/normalize-css/normalize.css",
                "vendor/bower/angular-notify-toaster/toaster.css",
                "vendor/bower/ng-tags-input/ng-tags-input.css",
                "vendor/bower/ng-ckeditor/ng-ckeditor.css",
                "vendor/bower/angular-loading-bar/src/loading-bar.css"
            ]
        }
    };
};
