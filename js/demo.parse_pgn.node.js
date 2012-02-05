var requirejs = require("requirejs");

requirejs.config({
    paths: require('./common.config').libPaths(),
    nodeRequire: require
});

(function(require)
{

    var
        _               = require('underscore'),
        pgn             = require('common/susu-chess-game-notataion-parser'),
        pgnFile         = require('common/susu-chess-file-pgn-games-reader'),
        chess           = require('common/susu-chess'),
        chessDomain     = require('common/susu-chess-domain');

    var reader = new pgnFile.FilePgnGamesReader('benoni.pgn');
    var loader = new pgn.GamesLoader(reader);
    var parser = new pgn.PortableGameNotationParser();
    var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);

    var startTime = new Date();
    var count = 0;

    var IsMovePossibleCount = 0;
    /*var oldIsMovePossible = chess.defaultRules.IsMovePossible;
    chess.defaultRules.IsMovePossible = function(position, piece, targetFile, targetRank, skipKingCaptureCheck) {
        IsMovePossibleCount++;
        var result = oldIsMovePossible.call(chess.defaultRules, position, piece, targetFile, targetRank, skipKingCaptureCheck);
        return result;
    };*/

    reader.readGames().take(100).forEach(function(item){
        count++;
        var gameInfo = parser.parse(item);
        var position = chess.createDefaultGamePosition();
        var game = new chess.Game(position);
        restorer.restoreGame(game, gameInfo.getGameNotation());
        if (count % 100 == 0)
            console.log(count);
    })
    .finish(function(){
        console.log(IsMovePossibleCount);
        var milliseconds = new Date() - startTime;
        console.log((milliseconds / 1000).toString() + 's');
    });


    return;
    // TODO переписать через node-lazy
    loader.load().forEach(function(item) {

        var loadedGameInfo = item.gameInfo;
        var loadedGame = item.game;

        console.log(loadedGameInfo);

        /*var game = new chessDomain.Game();
        game.event(loadedGameInfo.getProperty('Event'));
        game.white(loadedGameInfo.getProperty('White'));
        game.black(loadedGameInfo.getProperty('Black'));
        game.gameResult(loadedGame.getGameResult());

        _.each(loadedGame.getHalfMoves(), function(move) {
            switch (move.getMoveType())
            {
                case chess.MoveType.Regular:
                    game.addMove(move.getSource(), move.getTarget(), move.getPositionBefore().toFEN(false), move.getCaption());
                break;
                case chess.MoveType.Castling:
                    game.addCastlingMove(move.getCastlingType(), move.getPositionBefore().toFEN(false), move.getCaption());
                break;
                case chess.MoveType.PawnPromotion:
                    game.addPromotionMove(move.getSource(), move.getTarget(), move.getPromotedPieceType(), move.getPositionBefore().toFEN(false), move.getCaption());
                break;
            }
        });*/

    });

})(requirejs);

