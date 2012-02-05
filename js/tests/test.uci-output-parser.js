define(function(require, exports, module) {

    var uci = require('common/uci-output-parser');

    module.exports.UciOutputParser = {

        testParseInfoLine: function(test) {
            var result;
            var parser = new uci.UciOutputParser();
            result = parser.parseLine('info depth 5');
            test.equals(5, result.info.depth);

            result = parser.parseLine('info depth 1 seldepth 7 score cp -206  time 0 nodes 49 nps 0 pv e5f7 e7e4 f1e2 e8f7');
            test.equals(1, result.info.depth);
            test.equals(7, result.info.selectedMovesDepth);
            test.equals(-2.06, result.info.bestLine.score);
            test.equals(4, result.info.bestLine.moves.length);

            result = parser.parseLine('bestmove e5f3');
            test.equals('e5f3', result.bestMove.move);

            result = parser.parseLine('bestmove e5f3 ponder e7e4');
            test.equals('e5f3', result.bestMove.move);
            test.equals('e7e4', result.bestMove.ponder);

            test.done();
        }

    };

});

