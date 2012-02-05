var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '..',
    paths: require('../common.config').libPaths(),
    nodeRequire: require
});

(function(require){

    var spawn = require('child_process').spawn;

    spawn('node', ['run.node.test_file.js', 'hui']).stdout
        .addListener('data', function(data) {
            console.log(data.toString());
        }).on('end', function() { });

})(requirejs);