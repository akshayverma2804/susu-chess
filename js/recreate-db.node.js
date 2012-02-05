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

    var connection = new chessRepository.RepositoryConnection(connectionOptions);

    connection.open().then(function() {
        connection.dropDatabase().then(function(result) {
            console.log('Database drop: ', result);
            var connection = new chessRepository.RepositoryConnection(connectionOptions);
            connection.open().then(function(repository) {
                repository.createSchema().then(function(){
                    connection.close();
                });
            });
        });
    });

})(requirejs);

