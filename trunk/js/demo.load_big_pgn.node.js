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
        chessDomain     = require('common/susu-chess-domain'),
        chessRepository = require('common/susu-chess-mongo-repository');


    var connectionOptions = {
        host: '127.0.0.1',
        port: 27017,
        database: 'chess-db'
    };
    
    var reader = new pgnFile.FilePgnGamesReader('benoni.pgn');
    var loader = new pgn.GamesLoader(reader);

    var db = new chessRepository.createDb(connectionOptions);

    db.open(function(error, db) {
        db.dropDatabase(function(err, result){
            console.log(result);
            db.close();
        });
    });

    var connection = new chessRepository.RepositoryConnection(connectionOptions);

    connection.open().then(function(repository){

        // TODO переписать через node-lazy
        loader.onLoadGame(function(loadedGameInfo, loadedGame){
            var game = new chessDomain.Game();
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
            });

            repository.insertGame(game).then(function(game){
                console.log(game.id());
            });
        });

        loader.onComplete(function()
        {
            console.log('Building indexes...');
            repository.ensureIndexes().then(function(){
                console.log('Complete.', '');
                connection.close();
            });
        });
        loader.load();


    });

    /*db.open(function(error, db) {
        loader.onLoadGame(function(loadedGameInfo, loadedGame){
            var game = new chessDomain.Game();
            game.event(loadedGameInfo.getProperty('Event'));
            game.white(loadedGameInfo.getProperty('White'));
            game.black(loadedGameInfo.getProperty('Black'));
            game.black(loadedGame.getGameResult());

            _.each(loadedGame.getHalfMoves(), function(move) {
                switch (move.getMoveType())
                {
                    case chess.MoveType.Regular:
                        game.addMove(move.getSource(), move.getTarget(), move.getPositionBefore().toFEN(false));
                    break;
                    case chess.MoveType.Castling:
                        game.addCastlingMove(move.getCastlingType(), move.getPositionBefore().toFEN(false));
                    break;
                    case chess.MoveType.PawnPromotion:
                        game.addPromotionMove(move.getSource(), move.getTarget(), move.getPromotedPieceType(), move.getPositionBefore().toFEN(false));
                    break;
                }
            });

            db.collection('game', function(error, collection) {

                var gameDoc = game.toJSON();
                collection.insert(gameDoc);
                console.log(gameDoc._id);

                db.collection('move-hash', function(error, collection) {

                    _.each(game.moveHashesAsJSON(), function(moveHash) {
                        collection.insert(_.extend({}, moveHash, { gameId: gameDoc._id }));
                    });

                });

            });
        });
        loader.onComplete(function()
        {
            db.close();
        });
        loader.load();
    });*/

/*
    var parser = new pgn.PortableGameNotationParser();
    var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);

    var count = 0;

    var start = new Date();

    reader.onNextGame(function(gameText)
    {
        if (gameText)
        {
            try
            {
                count++;
                var gameInfo = parser.parse(gameText);

                var position = chess.createDefaultGamePosition();
                var game = new chess.Game(position);
                restorer.restoreGame(game, gameInfo.getGameNotation());
            }
            catch(e)
            {
                console.log(gameText);
                console.log("Game number: " + count + '; ' + e);
            }
        }
        //else
        if (count % 100 == 0)
        {
            console.log('Total: ' + count + '; Time: ' + (new Date() - start) + 'ms');
            start = new Date();
        });

        reader.beginRead();
    }
*/

})(requirejs);

