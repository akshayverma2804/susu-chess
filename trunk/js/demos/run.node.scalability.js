var requirejs = require('requirejs');

requirejs.config({
    baseUrl: '..',
    paths: require('../common.config').libPaths(),
    nodeRequire: require
});

(function(require){

    var async = require('async');

    console.log('Hello');
    async.forEach([1, 2, 3, 4, 5], function(item){
        function d(a) { return a + 5; }

        for (var i = 0; i < item * 10000000; i++) {
            var x = d(i);
        }
    });
    console.log(1);

})(requirejs);