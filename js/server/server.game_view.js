define(function(require, exports, module){

    var
        chess       = require('common/susu-chess'),
        chessDomain = require('common/susu-chess-domain');
    
    module.exports.execute = function(request, response, gameId, db, mu) {

        var data = {
            queryString: '',
            games: []
        };

        db.collection('game', function(error, collection) {

            collection.findOne({ _id: parseInt(gameId) }, function(err, gameDoc) {

                console.log('Collection find: ', gameId, err, gameDoc);

                var gameInfo = new chessDomain.Game();
                gameInfo.fromJSON(gameDoc);

                mu.compile('game_view.html.mu', function(err, parsed) {
                    mu.render('game_view.html.mu', {
                        gameJSON: JSON.stringify(gameDoc),
                        game: gameInfo
                    })
                    .on('data', function(c) { response.write(c); })
                    .on('end', function() { response.end();});
                });

            });
        });


    };

});