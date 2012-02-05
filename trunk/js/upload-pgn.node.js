var requirejs = require("requirejs");

requirejs.config({
    paths: require('./common.config').libPaths(),
    nodeRequire: require
});

(function(require)
{
    var _               = require('underscore')
      , fs              = require('fs')
      , pgn             = require('common/susu-chess-game-notataion-parser')
      , pgnFile         = require('common/susu-chess-file-pgn-games-reader')
      , chess           = require('common/susu-chess')
      , chessDomain     = require('common/susu-chess-domain')
      , chessRepository = require('common/susu-chess-mongo-repository')

    var fileName = process.argv[2];
    var reader = new pgnFile.FilePgnGamesReader(fileName);
    var loader = new pgn.GamesLoader(reader);
    var parser = new pgn.PortableGameNotationParser();
    var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);

    var connectionOptions = {
        host: '127.0.0.1',
        port: 27017,
        database: 'chess-db'
    };

    var connection = new chessRepository.RepositoryConnection(connectionOptions);
    connection.open().then(function(repository){

        fs.stat(fileName, function(err, stat){
            var fileSize = stat.size;
            var readedSize = 0;
            var lastPercent = 0;

            reader.readGames()
                .map(function(item){
                    readedSize += item.length + 1;

                    var gameInfo = parser.parse(item);
                    var position = chess.createDefaultGamePosition();
                    var game = new chess.Game(position);
                    restorer.restoreGame(game, gameInfo.getGameNotation());
                    return { gameInfo: gameInfo, game: game };
                })
                .map(function(item) {
                    var game = new chessDomain.Game();
                    game.event(item.gameInfo.getProperty('Event'));
                    game.white(item.gameInfo.getProperty('White'));
                    game.black(item.gameInfo.getProperty('Black'));
                    game.gameResult(item.game.getGameResult());

                    _.each(item.game.getHalfMoves(), function(move) {
                        switch (move.getMoveType()) {
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
                    });

                    return game;
                })
                .forEach(function(game) {
                    repository.insertGame(game).then(function(){
                        if (lastPercent !== Math.round(readedSize / fileSize * 100))
                        {
                            lastPercent = Math.round(readedSize / fileSize * 100)
                            console.log(Math.round(readedSize / fileSize * 100));
                        }
                    });
                })
                .finish(function(){
                    console.log();
                });
        });
    });

})(requirejs);

