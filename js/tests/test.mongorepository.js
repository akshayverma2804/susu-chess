define(function(require, exports, module) {

    var
        chess           = require('common/susu-chess'),
        chessRepository = require('common/susu-chess-mongo-repository'),
        chessDomain     = require('common/susu-chess-domain');

    var testConnectionOptions = {
        host: '127.0.0.1',
        port: 27017,
        database: 'chess-tests-db'
    };

    module.exports.MongoRepositoryTests = {
        setUp: function(done) {
            this.db = new chessRepository.createDb(testConnectionOptions);

            this.db.open(function(error, db){
                db.collection('game', function(error, collection) {
                    collection.remove({}, function(err, result) {

                        db.collection('move-hash', function(error, collection) {
                            collection.remove({}, function(err, result) {
                                db.close();
                                done();
                            });
                        });

                    });
                });
            });
        },

        testFindGameByIdLazy: function(test) {
            var connection = new chessRepository.RepositoryConnection(testConnectionOptions);

            connection.open().then(function(repository){
                var game = new chessDomain.Game();
                game.event('Event 1');
                repository.insertGame(game).then(function(){
                    var game = new chessDomain.Game();
                    game.event('Event 2');
                    repository.insertGame(game).then(function(){
                        var count = 0;
                        repository.findGamesById([1, 2]).forEach(function(g){
                            count++;
                            test.equals(true, g._id == 1 || g._id == 2);
                        }).join(function(gs){
                            connection.close();
                            test.done();
                        });

                    });
                });
            });
        },

        testInsertGames: function(test) {
            var connection = new chessRepository.RepositoryConnection(testConnectionOptions);

            connection.open().then(function(repository){
                var game1 = new chessDomain.Game();
                game1.event('Event 1');

                var game2 = new chessDomain.Game();
                game2.event('Event 2');

                repository.insertGames([game1, game2]).then(function(){
                    repository.getGameCount().then(function(count){
                        test.equals(2, count);
                        test.done();
                        connection.close();
                    });
                });
            });
        },

        testGroupGamesByNextMoveFromPositions: function(test) {
            var connection = new chessRepository.RepositoryConnection(testConnectionOptions);

            connection.open().then(function(repository) {
                var game1 = new chessDomain.Game();
                game1.event('Event 1');
                game1.addMove({file: 1, rank: 1}, {file: 2, rank: 1}, 'hash1', 'a1-b1');
                game1.addMove({file: 2, rank: 1}, {file: 3, rank: 1}, 'hash2', 'b1-c1');

                var game2 = new chessDomain.Game();
                game2.event('Event 2');
                game2.addMove({file: 0, rank: 1}, {file: 1, rank: 1}, 'hash0', 'h1-a1');
                game2.addMove({file: 1, rank: 1}, {file: 2, rank: 1}, 'hash1', 'a1-b1');
                game2.addMove({file: 2, rank: 1}, {file: 3, rank: 1}, 'hash2', 'b1-c1');

                repository.insertGames([game1, game2]).then(function(){

                    repository.getGamesGroupedByNextMoveFromPosition('hash1')
                        .join(function(moves){
                            test.equals(1, moves.length);
                            test.equals(2, moves[0].value.count);
                            test.done();
                            connection.close();
                        });

                });
            });
        },

        testGetGamesWithPosition: function(test) {
            var connection = new chessRepository.RepositoryConnection(testConnectionOptions);

            connection.open().then(function(repository) {

                var game1 = new chessDomain.Game();
                game1.event('Event 1');
                game1.addMove({file: 1, rank: 1}, {file: 2, rank: 1}, 'hash1', 'a1-b1');
                game1.addMove({file: 2, rank: 1}, {file: 3, rank: 1}, 'hash2', 'b1-c1');

                var game2 = new chessDomain.Game();
                game2.event('Event 2');
                game2.addMove({file: 0, rank: 1}, {file: 1, rank: 1}, 'hash0', 'h1-a1');
                game2.addMove({file: 1, rank: 1}, {file: 2, rank: 1}, 'hash1', 'a1-b1');
                game2.addMove({file: 2, rank: 1}, {file: 3, rank: 1}, 'hash2', 'b1-c1');

                repository.insertGames([game1, game2]).then(function(){

                    repository.findGamesByPositionHash('hash1')
                        .join(function(games){
                            test.equals(2, games.length);

                            if (games.length == 2){

                                test.equals(0, games[0].moveNumber());
                                test.equals(1, games[1].moveNumber());
                            }

                            test.done();
                            connection.close();
                        });

                });
            });
        },

        testInsertGame: function(test) {
            
            this.db.open(function(error, db){
                db.collection('game', function(error, collection) {
                    collection.remove({}, function(err, result) {
                        var game = new chessDomain.Game();
                        game.event('Event name');
                        game.addMove(new chess.Coord(1, 1), new chess.Coord(1, 1));
                        game.addMove(new chess.Coord(1, 1), new chess.Coord(4, 4));

                        //console.log(game.toJSON());

                        collection.insert(game.toJSON());
                        collection.count(function(error, count){
                            test.equals(1, count);

                            collection.find({}, {limit: 1}, function(err, cursor)
                            {
                                cursor.each(function(err, item){
                                    if (item == null) {
                                        db.close();
                                        test.done();
                                    }
                                    else {
                                        test.equals(2, item.moves.length);
                                    }
                                });
                            });
                        });
                    })
                });
            });

        },

        getGameList: function(test) {
            this.db.open(function(error, db){
                db.collection('game', function(error, collection) {

                    var game = new chessDomain.Game();
                    game.event('Event name 1');
                    collection.insert(game.toJSON());
                    
                    game = new chessDomain.Game();
                    game.event('Event name 2');
                    collection.insert(game.toJSON());
                    
                    collection.find(function(err, cursor) {
                        cursor.each(function(err, item) {
                            if (item != null) {
                                test.equals(true, (item.event == 'Event name 1') || (item.event == 'Event name 2'));
                            }
                            else {
                                db.close();
                                test.done();
                            }
                        });
                    });
                });
            });
        },

        insertGameRepository: function(test) {

            var connection = new chessRepository.RepositoryConnection(testConnectionOptions);
            connection.open().
                then(function(repository) {
                    repository.resetCounters()
                        .then(function(){
                            repository.removeAllGames()
                                .then(function() {
                                    var game = new chessDomain.Game();

                                    game.event('Event name');
                                    game.addMove(new chess.Coord(1, 1), new chess.Coord(1, 1), '123');
                                    game.addMove(new chess.Coord(1, 1), new chess.Coord(4, 4), '321');

                                    repository.insertGame(game)
                                        .then(function() {
                                            test.equals(true, game.id() != null);
                                            test.equals(1, game.id());

                                            repository.getGameCount().
                                                then(function(count) {
                                                    test.equals(1, count);
                                                    connection.close();
                                                    test.done();
                                                });
                                        });
                                });

                        });
                });


        }
    };
            
});