module.exports = ->
  config:
    watch:
      stylus:
        files: [
          "vendor/css/**/*.styl"
          "app/css/style.styl"
        ]
        tasks: ["stylus"]