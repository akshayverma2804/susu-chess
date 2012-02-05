define(function(require, exports, module) {

    var Class   = require('class')
      , Lazy    = require('lazy')
      , _       = require('underscore')

    module.exports.UciOutputParser = Class.extend({

        init: function() {
            this.depthRexex = /depth (\d+)/i;
            this.selDepthRexex = /seldepth (\d+)/i;
            this.bestLineRegex = /pv (([abcdefgh][1-8][abcdefgh][1-8]([qQnNrRbBpP]){0,1}\s{0,1})*)/i;
            this.scorePointsRegex = /cp (\-+\d*)/i;

            this.bestMoveRegex = /bestmove ([abcdefgh][1-8][abcdefgh][1-8]([qQnNrRbBpP]){0,1})/i;
            this.ponderMoveRegex = /ponder ([abcdefgh][1-8][abcdefgh][1-8]([qQnNrRbBpP]){0,1})/i;
        },

        parseLine: function(line) {

            var result = { info: {} };
            var depthMatch = this.depthRexex.exec(line);
            if (depthMatch) {
                result.info.depth = parseInt(depthMatch[1]);
            }
            var selDepthMatch = this.selDepthRexex.exec(line);
            if (selDepthMatch){
                result.info.selectedMovesDepth = parseInt(selDepthMatch[1]);
            }
            var bestLineMatch = this.bestLineRegex.exec(line);
            if (bestLineMatch) {
                result.info.bestLine = {};
                result.info.bestLine.moves = bestLineMatch[1].split(' ');
                var scorePointsMatch = this.scorePointsRegex.exec(line);
                if (scorePointsMatch) {
                    result.info.bestLine.score = parseInt(scorePointsMatch[1]) / 100;
                }

            }
            var bestMoveMatch = this.bestMoveRegex.exec(line);
            if (bestMoveMatch) {
                result.bestMove = {};
                result.bestMove.move = bestMoveMatch[1];
                var ponderMoveMatch = this.ponderMoveRegex.exec(line);
                if (ponderMoveMatch) {
                    result.bestMove.ponder = ponderMoveMatch[1];
                }
            }
            return result;

        }
    });

});