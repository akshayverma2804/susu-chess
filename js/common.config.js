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
            "hash-table": prefix + "libs/jshashtable-2.1_src"
        };
    };
})((typeof window) === 'undefined' ? exports : window);