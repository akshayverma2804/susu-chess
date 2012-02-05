define(function(require, exports, module){
    var async = require('async');

    console.log('Hello');
    async.forEach([1, 2, 3, 4, 5], function(item){
        function d(a) { return a + 5; }

        for (var i = 0; i < item * 100000000; i++) {
            var x = d(i);
        }
    });
    console.log(1);

});