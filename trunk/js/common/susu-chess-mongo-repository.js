define(function(require, exports, module) {

    var
        _           = require("underscore"),
        Class       = require("class"),
        Barrier     = require("barrier"),
        Db          = require('mongodb').Db,
        Connection  = require('mongodb').Connection,
        Server      = require('mongodb').Server,
        Code        = require('mongodb').BSONPure.Code,
        Deferred    = require('deferred').Deferred,
        Lazy        = require('lazy');

    var createDb = module.exports.createDb = function(connectionOptions){

        var integerAutoincrementPrimaryKeyFactory = {
            counter:0,
            createPk: function() {
                return ++this.counter;
            }
        };

        return new Db(
            connectionOptions.database,
            new Server(connectionOptions.host, connectionOptions.port),
            {
                pk: integerAutoincrementPrimaryKeyFactory
            }
        );
    };

    var ChessRepository = module.exports.ChessRepository = Class.extend({

        init: function(db) {
            this.db = db;
        },

        getNextValue: function(counterName, inc) {
            inc = inc || 1;
            var self = this;
            var promise = new Deferred();

            self.db.collection('counters', function(err, counters){
                counters.findAndModify({ _id: "game" }, [], { $inc: { c: inc } }, function(err, doc) {

                    promise.resolve(doc.c);
                });
            });
            return promise;
        },

        createSchema: function() {
            var self = this;
            var result = new Deferred();

            console.log(1);
            self.checkCounters().then(function(){

                self.db.createCollection('game', function(){
                    self.db.createCollection('move-hash', function(){
                        self.ensureIndexes().then(function()
                        {
                            result.resolve();
                        });
                    });
                });
            });

            return result;
        },

        resetCounters: function() {
            var self = this;
            var promise = new Deferred();

            this.db.collection('counters', function(err, counters){
                counters.findAndModify({ _id: "game" }, [], { c: 0 }, function(err, doc) {
                    promise.resolve();
                });
            });
            return promise;
        },

        checkCounters: function() {
            var result = new Deferred();

            this.db.collection('counters', function(err, counters){
                counters.findOne({ _id: "game" }, {}, function(err, counterDoc) {
                    if (counterDoc == null) {
                        counters.insert({ _id: "game", c: 0 }, [], function(){

                            result.resolve();
                        });
                    }
                    else {

                        result.resolve();
                    }
                })
            });

            return result;
        },


        findGamesById: function(ids){
            var self = this;
            var result = new Lazy();
            self.db.collection('game', function(error, collection) {
                collection.find({_id : { $in: ids }}, function(err, cursor){
                    cursor.each(function(err, gameDoc){
                        if (gameDoc != null)
                            result.emit('data', gameDoc);
                        else
                            result.emit('end');
                    });
                });
            });
            return result;
        },

        removeAllGames: function() {
            var self = this;
            var promise = new Deferred();
            promise.resolve(0);
            return promise;
        },

        getGameCount: function() {
            var self = this;
            var promise = new Deferred();
            self.db.collection('game', function(err, collection){
                collection.count(function(err, count) {
                    promise.resolve(count);
                });
            });
            return promise;
        },

        findGamesByPositionHash: function(positionHash, fields, options) {
            var self = this;
            var result = new Lazy();
            fields = fields || {};
            options = options || {};

            self.db.collection('game', function(err, collection){
                collection.find({ 'moves.positionHash': positionHash }, fields, options, function(err, cursor) {
                    cursor.each(function(err, item){
                        if (item != null)
                            result.emit('data', {
                                game: item,
                                moveNumber: function() {
                                    return _.find(this.game.moves, function(move) {
                                        return move.positionHash == positionHash;
                                    }).number;
                                }
                            });
                        else
                            result.emit('end');
                    });
                });
            });

            return result;
        },

        getGamesGroupedByNextMoveFromPosition: function(positionHash){

            var self = this;
            var result = new Lazy();
            self.db.collection('move-hash', function(err, moveHashCollection) {
                moveHashCollection.find({hash: positionHash}, function(err, cursor) {

                    cursor.toArray(function(err, array) {
                        self.db.collection('game', function(err, collection) {
                            var map = function() { emit(this.moves[ moveNumber[this._id] ].moveHash,
                            {
                                _id: this._id,
                                move: this.moves[ moveNumber[this._id] ],
                                 gameResult: this.gameResult,
                                whiteWinPercentage: (this.gameResult == 1) ? 1 : ((this.gameResult == 2) ? 0 : 0.5),
                                blackWinPercentage: (this.gameResult == 1) ? 0 : ((this.gameResult == 2) ? 1 : 0.5)
                            } ); };

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
                                    move: v[0].move,
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

                            collection.mapReduce(map, reduce,
                                {
                                    query: { _id : { $in : _.map(array, function(m) { return m.gameId; }) } },
                                    scope: {
                                        test: new Code('function() { return 1; }'),
                                        moveNumber: moveNumbers
                                    }
                                },
                                function(err, collection) {
                                    collection.find(function(err, cursor) {
                                        cursor.each(function(err, doc) {
                                            if (doc != null) {
                                                result.emit('data', doc);
                                            }
                                            else {
                                                result.emit('end');
                                            }
                                        });
                                    })
                                });
                        });
                    });
                });
            });
            return result;
        },

        ensureIndexes: function(){
            var self = this;
            var result = new Deferred();

            self.db.collection('game', function(error, collection) {
                collection.ensureIndex({ 'move.hash': 1 }, function(err){
                    collection.ensureIndex({ 'move.positionHash': 1 }, function(err){

                        self.db.collection('move-hash', function(error, collection) {
                            collection.ensureIndex( { 'hash' : 1 }, function(){
                                result.resolve();
                            });
                        });
                    });
                });
            });

            return result;
        },

        insertGames: function(games) {
            var self = this;
            var barrier = new Barrier();
            var result = new Deferred();
            barrier.complete(function(){
                result.resolve();
            });
            barrier.sync();
            _.each(games, function(game){ barrier.sync(); });
            _.each(games, function(game){
                self.insertGame(game).then(function(){
                    barrier.finish();
                });
            });
            barrier.finish();
            return result;
        },

        insertGame: function(game) {
            var self = this;
            var result = new Deferred();
            self.db.collection('game', function(error, collection) {

                var gameDoc = game.toJSON();
                self.getNextValue('game').then(function(nextId) {

                    gameDoc._id = nextId;

                    collection.insert(gameDoc, function(err){

                        game.id(gameDoc._id);

                        self.db.collection('move-hash', function(error, collection) {

                            var barrier = new Barrier();
                            barrier.complete(function() {
                                result.resolve(game);
                            });

                            barrier.sync();
                            _.each(game.moveHashesAsJSON(), function(moveHash) { barrier.sync(); });
                            _.each(game.moveHashesAsJSON(), function(moveHash) {
                                collection.insert(_.extend({}, moveHash, { gameId: gameDoc._id }), function()
                                {
                                    barrier.finish();
                                });
                            });
                            barrier.finish();
                        });

                    });

                });
            });
            return result;
        }
    });

    module.exports.RepositoryConnection = Class.extend({

        init: function(connectionOptions)
        {
            this.connectionOptions = connectionOptions;
            this.db = createDb(this.connectionOptions);
        },

        open: function(){

            var deferred = new Deferred();

            this.db.open(function(err, db){
                var repository = new ChessRepository(db);
                repository.checkCounters()
                    .then(function(){
                            deferred.resolve(repository);
                        });
            });


            return deferred;

        },

        dropDatabase: function() {
            var self = this;
            var result = new Deferred();

            self.db.dropDatabase(function(err, dropResult){
                self.db.close(function(){
                    result.resolve(dropResult);
                });
            });

            return result;
        },

        close: function() {
            this.db.close();
        }

    });



});