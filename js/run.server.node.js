var requirejs = require("requirejs");

requirejs.config({
    paths: require('./common.config').libPaths(),
    nodeRequire: require
});

(function(require)
{
    var chessServer = require('server/server.root');
    chessServer.run();
})(requirejs);

