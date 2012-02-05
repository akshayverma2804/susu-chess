var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '..',
    paths: require('../common.config').libPaths(),
    nodeRequire: require
});

(function(require){

    var spawn = require('child_process').spawn;

    spawn('Tankist 3.1 32-bit.exe')


})(requirejs);