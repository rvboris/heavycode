module.exports = function (lineman) {
    return {
        config: {
            concat_sourcemap: {
                css: {
                    src: ["<%= files.stylus.generatedApp %>"].concat(lineman.config.application.concat_sourcemap.css.src)
                }
            }
        }
    };
};