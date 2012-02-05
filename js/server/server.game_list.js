define(function(require, exports, module){

    var chessDomain = require('common/susu-chess-domain');
    
    module.exports.execute = function(request, response, searchString, db, mu) {

        var data = {
            queryString: '',
            games: []
        };

        db.collection('game', function(error, collection) {

            collection.find(
                {
                    $or: [
                        { event: { $regex: '.*' + searchString + '.*', $options: 'i'} } ,
                        { white: { $regex: '.*' + searchString + '.*', $options: 'i'} } ,
                        { black: { $regex: '.*' + searchString + '.*', $options: 'i'} }
                    ]
                },
                {
                    limit: 100,
                    skip: 0
                },
                function(err, cursor) {
                    cursor.each(function(err, item) {
                        if (item != null) {
                            var game = new chessDomain.Game();
                            game.fromJSON(item)
                            data.games.push(game);
                        }
                        else {
                            db.close();

                            data.queryString = searchString;

                            mu.compile('game_list.html.mu', function(err, parsed) {
                                mu.render('game_list.html.mu', data)
                                    .on('data', function(c) { response.write(c); })
                                    .on('end', function() { response.end();});
                            });

                        }
                });
            });
        });


    };

});