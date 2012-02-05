var requirejs = require('requirejs');

requirejs.config({
    paths: require('./common.config').libPaths(),
    nodeRequire: require
});

var nodeunit = requirejs('nodeunit');
var reporter = nodeunit.reporters['default'];

reporter.run({

    /*'Common':       requirejs('tests/test.susu-chess'),
    'Rules':        requirejs('tests/test.susu-chess-rules'),
    'Game':         requirejs('tests/test.susu-chess-game'),
    'PGN':          requirejs('tests/test.susu-chess-pgn-parser'),
    'Regression':   requirejs('tests/test.regression'),
    'PGNFile':      requirejs('tests/test.susu-chess-file-pgn-reader')*/

    //'Repository':   requirejs('tests/test.mongorepository.js')
    'UciOutput':   requirejs('tests/test.uci-output-parser.js')
});