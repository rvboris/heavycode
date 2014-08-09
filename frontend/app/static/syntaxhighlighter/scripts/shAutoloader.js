(function () {
    var sh = SyntaxHighlighter;

    sh.autoloader = function () {
        var list = arguments;

        SyntaxHighlighter.smartLoad = function () {
            var elements = sh.findElements();
            var brushes = {};
            var scripts = {};
            var i;
            var url;

            function addBrush(aliases, url) {
                for (var i = 0; i < aliases.length; i++) {
                    brushes[aliases[i]] = url;
                }
            }

            function getAliases(item) {
                return item.pop ? item : item.split(/\s+/);
            }

            for (i = 0; i < list.length; i++) {
                var aliases = getAliases(list[i]);
                url = aliases.pop();
                addBrush(aliases, url);
            }

            for (i = 0; i < elements.length; i++) {
                url = brushes[elements[i].params.brush];

                if (url && scripts[url] === undefined) {
                    if (elements[i].params['html-script'] === 'true') {
                        if (scripts[brushes['xml']] === undefined) {
                            loadScript(brushes['xml']);
                            scripts[url] = false;
                        }
                    }

                    scripts[url] = false;
                    loadScript(url);
                }
            }

            function loadScript(url) {
                $script(url, function () {
                    scripts[url] = true;
                    checkAll();
                });
            }

            function checkAll() {
                for (var url in scripts) {
                    if (scripts[url] === false) {
                        return;
                    }
                }

                SyntaxHighlighter.highlight();
            }
        };
    };
})();