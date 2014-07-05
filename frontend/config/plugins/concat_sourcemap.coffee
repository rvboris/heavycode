module.exports = ->
config:
    concat_sourcemap:
        css:
            src: [
                "<%= files.stylus.generatedVendor %>"
                "<%= files.css.vendor %>"
                "<%= files.stylus.generatedApp %>"
                "<%= files.css.app %>"
            ]
dest: "<%= files.css.concatenated %>"