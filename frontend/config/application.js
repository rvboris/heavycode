module.exports = function (lineman) {
    return {
        server: {
            pushState: false,
            apiProxy: {
                enabled: true,
                port: 3000
            }
        },

        loadNpmTasks: lineman.config.application.loadNpmTasks.concat("grunt-bump"),

        bump: {
            options: {
                files: ["package.json", "bower.json", "../package.json"],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        removeTasks: {
            common: ["coffee", "handlebars", "jst"]
        }
    };
};
