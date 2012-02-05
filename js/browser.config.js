(function(exports)
{
    exports.libPaths = function(prefix)
    {
        prefix = prefix || '';
        return {
            "jquery":       prefix + "libs/jquery-1.6.2.min",
            "jsunit":       prefix + "libs/jsunit",
            "underscore":   prefix + "libs/underscore",
            "class":        prefix + "libs/class",
            "microevent":   prefix + "libs/microevent",
            "barrier":      prefix + "libs/barrier",
            "knockout": prefix + "libs/knockout-2.0.0.debug",
            "history": prefix + "libs/jquery.history",
            "deferred": prefix + "libs/deferred",
            "lazy": prefix + "libs/lazy",
            "hash-table": prefix + "libs/jshashtable-2.1_src",

            "events": prefix + "libs/events.browser",
            "async": prefix + "node_modules/async/lib/async",
            "jquery-ui": prefix + "libs/jquery-ui-1.8.17.custom.min",
        };
    };
})((typeof window) === 'undefined' ? exports : window);