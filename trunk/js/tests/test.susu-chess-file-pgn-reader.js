define(function(require, exports, module)
{
    var
        _       = require("underscore"),
        pgn     = require('common/susu-chess-game-notataion-parser'),
        pgnFile = require('common/susu-chess-file-pgn-games-reader');

    var LF = "\n";

    module.exports.PgnFileReaderTests = {

        testFilePgnReader: function(test)
        {
            var splitter = new pgnFile.FilePgnGamesReader('tests/two_games.pgn');
            var gameCount = 0;
            splitter.readGames().join(function(items){
                test.equals(2, items.length);
                test.done();
            });
        }
    }
});