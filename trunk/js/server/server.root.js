define(function(require, exports, module)
{

    module.exports.run = function()
    {
        var _       = require("underscore");
        var router  = require('router').create();
        var static  = require('node-static');
        var mu      = require('mu');
        var Barrier = require("barrier");
        var Code    = require('mongodb').BSONPure.Code;
        mu.root     = './templates';
        var
            chessDomain     = require('common/susu-chess-domain'),
            chessRepository = require('common/susu-chess-mongo-repository');

        var connectionOptions = {
            host: '127.0.0.1',
            port: 27017,
            database: 'chess-db'
        };

        var staticServer = new static.Server('..');

        router.get('/js/*', function(request, response) {
            staticServer.serve(request, response, function(code, a)
            {
                console.log(code, a);
                response.end('404');
            });
        });

        router.get('/images/*', function(request, response) {
            staticServer.serve(request, response, function(code, a)
            {
                console.log(code, a);
                response.end('404');
            });
        });

        router.get('/css/*', function(request, response) {
            //request.url = request.params.wildcard;
            staticServer.serve(request, response, function(code, a)
            {
                console.log(code, a);
                response.end('404');
            });
        });

        router.get('/search/{searchString}', function(request, response) {
            var searchString = request.params.searchString;
            var db = new chessRepository.createDb(connectionOptions);
            db.open(function(error, db) {
                var gameListPage = require('server/server.game_list');
                gameListPage.execute(request, response, searchString, db, mu);
            });
        });

        router.get('/game/{id}', function(request, response) {
            var gameId = request.params.id;
            var db = new chessRepository.createDb(connectionOptions);
            db.open(function(error, db) {
                var gameViewPage = require('server/server.game_view');
                gameViewPage.execute(request, response, gameId, db, mu);
            });
        });

        router.get('/upload', function(request, response) {
            console.log(1);
            var gameViewPage = require('server/server.game_upload');
            gameViewPage.display(request, response, mu);
        });

        router.post('/post/upload', function(request, response) {
            var gameViewPage = require('server/server.game_upload');
            gameViewPage.handleFile(request, response, connectionOptions);
        });

        router.get('/get/upload/percentage/*', function(request, response) {
            var gameViewPage = require('server/server.game_upload');
            gameViewPage.getFilePercentage(request, response, request.params.wildcard);
        });


        router.get('/json/games/fen/*', function(request, response) {

            response.writeHead(200, {"Content-Type": "application/json"});

            var fen = decodeURIComponent(request.params.wildcard);
            var connection = new chessRepository.RepositoryConnection(connectionOptions);
            connection.open().then(function(repository){
                repository.findGamesByPositionHash(fen, { _id: true, white: true, black: true }, { limit: 100 })
                    .map(function(game) {
                        return {
                            _id: game.game._id,
                            white: game.game.white,
                            black: game.game.black
                        };
                    })
                    .join(function(games){
                        response.end(JSON.stringify({games: games}));
                    });

            });
        });


        router.get('/json/games/movestat/fen/*', function(request, response) {

            response.writeHead(200, {"Content-Type": "application/json"});
            var fen = decodeURIComponent(request.params.wildcard)

            var connection = new chessRepository.RepositoryConnection(connectionOptions);
            connection.open().then(function(repository){
                repository.getGamesGroupedByNextMoveFromPosition(fen)
                    .map(function(move){
                        return {
                            _id: move.value.move,
                            value: move.value
                        };
                    })
                    .join(function(moves){
                        response.end(JSON.stringify({moves: moves}));
                    })
            });
        });

        router.get('/fen/*', function(request, response) {
            response.writeHead(200);

            var fen = decodeURIComponent(request.params.wildcard)
            var db = new chessRepository.createDb(connectionOptions);
            db.open(function(error, db) {

                db.collection('move-hash', function(error, collection) {

                    collection.find({ hash: fen }, { limit: 10 }, function(err, cursor) {
                        cursor.each(function(err, hashItem) {
                            if (hashItem != null)
                                response.write('1');
                            else
                                response.end(fen);
                        });
                    });

                });
            });
        });

        router.listen(86); // start the server on port 8080
    };
});