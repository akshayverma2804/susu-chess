var requirejs = require('requirejs');

requirejs.config({
    paths: require('./common.config').libPaths(),
    nodeRequire: require
});

(function(require){

    var
        connectionOptions = {
            host: '127.0.0.1',
            port: 27017,
            database: 'chess-db'
        };

    var
        _ = require('underscore'),
        chessRepository = require('common/susu-chess-mongo-repository'),
        Code = require('mongodb').BSONPure.Code;

    var fen = 'rnb1k2r/pp1n1pbp/3p2p1/1BpP4/P3PP1q/2N5/1P4PP/R1BQK1NR w KQkq -';

    var db = chessRepository.createDb(connectionOptions);
    db.open(function(err, db) {

        db.collection('move-hash', function(err, moveHashCollection){

            moveHashCollection.find({hash: fen}, function(err, cursor){
                cursor.toArray(function(err, array){
                    //console.log(array.length);

                    db.collection('game', function(err, collection) {

                        var map = function() { emit(this.moves[ moveNumber[this._id] ],
                                { _id: this._id, gameResult: this.gameResult } ); };
                        var reduce = function(k, v) {

                            var whiteWin = 0;
                            var blackWin = 0;
                            var drawCount = 0;
                            for (var i = 0; i < v.length; i++)
                                if (v[i].gameResult == 1)
                                    whiteWin++;
                                else if (v[i].gameResult == 2)
                                    blackWin++;
                                else  if (v[i].gameResult == 3)
                                    drawCount++;

                            return {
                                count: v.length,
                                whiteWin: whiteWin,
                                blackWin: blackWin,
                                drawCount: drawCount,
                                whiteWinPercentage: (whiteWin + drawCount / 2) / (whiteWin + blackWin + drawCount),
                                blackWinPercentage: (blackWin + drawCount / 2)/ (whiteWin + blackWin + drawCount)
                            };
                        };

                        var moveNumbers = {};
                        for (var i = 0; i < array.length; i++)
                            moveNumbers[array[i].gameId] = array[i].number;
                        console.log(moveNumbers.toString());

                        collection.mapReduce(map, reduce,
                            {
                                query: { _id : { $in : _.map(array, function(m) { return m.gameId; }) } },
                                scope: {
                                    test: new Code('function() { return 1; }'),
                                    moveNumber: moveNumbers
                                }
                            },
                            function(err, collection) {
                                console.log(err);
                            collection.find(function(err, cursor){
                                cursor.each(function(err, doc){
                                    if (doc != null){
                                        console.log(doc);
                                    }
                                    else{
                                        db.close();
                                    }
                                });
                            })

                        });
                    });


                });

            });

        });
    });


})(requirejs);