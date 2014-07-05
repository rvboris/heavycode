lineman = require(process.env["LINEMAN_MAIN"])

module.exports = lineman.config.extend("application",
  server:
    pushState: false
    apiProxy:
      enabled: true
      port: 3000

  loadNpmTasks: lineman.config.application.loadNpmTasks.concat("grunt-bump")

  bump:
    options:
      files: ["package.json", "bower.jspn", "../package.json"]
      commitFiles: ["-a"]
      push: false
)