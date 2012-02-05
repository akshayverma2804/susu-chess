define(function(require, exports, module)
{
    nodeunit.run({
        'Common':   require('tests/test.susu-chess'),
        'Rules':    require('tests/test.susu-chess-rules'),
        'Game':     require('tests/test.susu-chess-game'),
        'PGN':      require('tests/test.susu-chess-pgn-parser'),
        'Regression': require('tests/test.regression')
    });
});