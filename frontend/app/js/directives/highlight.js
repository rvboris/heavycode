angular.module('app')
    .directive('highlight', function ($timeout) {
        var list = [
            'applescript			/syntaxhighlighter/scripts/shBrushAppleScript.js',
            'actionscript3 as3		/syntaxhighlighter/scripts/shBrushAS3.js',
            'bash shell				/syntaxhighlighter/scripts/shBrushBash.js',
            'coldfusion cf			/syntaxhighlighter/scripts/shBrushColdFusion.js',
            'cpp c					/syntaxhighlighter/scripts/shBrushCpp.js',
            'c# c-sharp csharp		/syntaxhighlighter/scripts/shBrushCSharp.js',
            'css					/syntaxhighlighter/scripts/shBrushCss.js',
            'delphi pascal			/syntaxhighlighter/scripts/shBrushDelphi.js',
            'diff patch pas			/syntaxhighlighter/scripts/shBrushDiff.js',
            'erl erlang				/syntaxhighlighter/scripts/shBrushErlang.js',
            'groovy					/syntaxhighlighter/scripts/shBrushGroovy.js',
            'haxe hx				/syntaxhighlighter/scripts/shBrushHaxe.js',
            'java					/syntaxhighlighter/scripts/shBrushJava.js',
            'jfx javafx				/syntaxhighlighter/scripts/shBrushJavaFX.js',
            'js jscript javascript	/syntaxhighlighter/scripts/shBrushJScript.js',
            'perl pl				/syntaxhighlighter/scripts/shBrushPerl.js',
            'php					/syntaxhighlighter/scripts/shBrushPhp.js',
            'text plain				/syntaxhighlighter/scripts/shBrushPlain.js',
            'py python				/syntaxhighlighter/scripts/shBrushPython.js',
            'ruby rails ror rb		/syntaxhighlighter/scripts/shBrushRuby.js',
            'scala					/syntaxhighlighter/scripts/shBrushScala.js',
            'sql					/syntaxhighlighter/scripts/shBrushSql.js',
            'vb vbnet				/syntaxhighlighter/scripts/shBrushVb.js',
            'xml xhtml xslt html	/syntaxhighlighter/scripts/shBrushXml.js'
        ];


        return {
            restrict: 'A',
            link: function () {
                $timeout(function () {
                    var elements = SyntaxHighlighter.findElements();
                    var brushes = {};
                    var scripts = {};

                    function addBrush(aliases, url) {
                        for (var i = 0; i < aliases.length; i++) {
                            brushes[aliases[i]] = url;
                        }
                    }

                    function getAliases(item) {
                        return item.pop ? item : item.split(/\s+/);
                    }

                    _.each(list, function (element) {
                        var aliases = getAliases(element);
                        addBrush(aliases, aliases.pop());
                    });

                    _.each(elements, function (element) {
                        var url = brushes[element.params.brush];

                        if (url && _.isUndefined(scripts[url])) {
                            if (element.params['html-script'] === 'true') {
                                if (_.isUndefined(scripts[brushes['xml']])) {
                                    loadScript(brushes['xml']);
                                    scripts[url] = false;
                                }
                            }

                            scripts[url] = false;
                            loadScript(url);
                        }
                    });

                    function loadScript(url) {
                        $script(url, function () {
                            scripts[url] = true;

                            for (var i in scripts) {
                                if (scripts[i] === false) {
                                    return;
                                }
                            }

                            SyntaxHighlighter.highlight();
                        });
                    }
                });
            }
        };
    });