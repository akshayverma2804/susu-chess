define(function(require, exports, module) {

    var
        chess   = require('common/susu-chess'),
        _       = require("underscore"),
        Class   = require('class');

    module.exports.Move = Class.extend({
        init: function() {

        },

        createMove: function(initialPosition) {
            switch(this.moveType){
                case chess.MoveType.Regular:
                    return new chess.RegularMove(initialPosition,
                        new chess.Coord(this.source.file, this.source.rank),
                        new chess.Coord(this.target.file, this.target.rank));
                break;
                case chess.MoveType.Castling:
                    return new chess.CastlingMove(initialPosition,
                        this.castlingType);
                break;
                case chess.MoveType.PawnPromotion:
                    return new chess.RegularMove(initialPosition,
                        new chess.Coord(this.source.file, this.source.rank),
                        new chess.Coord(this.target.file, this.target.rank),
                        this.promotedPieceType);
                break;
            }

        },

        fromJSON: function(json) {
            this.moveType = json.moveType;
            switch(json.moveType){
                case chess.MoveType.Regular:
                    this.source = json.source;
                    this.target = json.target;
                break;
                case chess.MoveType.Castling:
                    this.castlingType = json.castlingType;
                break;
                case chess.MoveType.PawnPromotion:
                    this.source = json.source;
                    this.target = json.target;
                    this.promotedPieceType = json.promotedPieceType;
                break;
            }
        }
    });

    module.exports.Game = Class.extend({

        init: function() {
            this._id = null;
            this._moves = [];
            this.moveCount = 0;
            this.moveHash = [];
        },

        addMove: function (source, target, hash, moveHash){
            this._moves.push({
                number: this.moveCount,
                moveType: chess.MoveType.Regular,
                source: { file: source.file, rank: source.rank },
                target: { file: target.file, rank: target.rank },
                positionHash: hash,
                moveHash: moveHash
            });
            this.moveHash.push({
                gameId: null,
                number: this.moveCount,
                hash: hash
            });
            this.moveCount++;
        },

        addCastlingMove: function (castlingType, hash, moveHash){
            this._moves.push({
                number: this.moveCount,
                moveType: chess.MoveType.Castling,
                castlingType: castlingType,
                positionHash: hash,
                moveHash: moveHash
            });
            this.moveHash.push({
                gameId: null,
                number: this.moveCount,
                hash: hash
            });
            this.moveCount++;
        },

        addPromotionMove: function (source, target, promotedPieceType, hash, moveHash){
            this._moves.push({
                number: this.moveCount,
                moveType: chess.MoveType.PawnPromotion,
                promotedPieceType: promotedPieceType,
                source: { file: source.file, rank: source.rank },
                target: { file: target.file, rank: target.rank },
                positionHash: hash,
                moveHash: moveHash
            });
            this.moveHash.push({
                gameId: null,
                number: this.moveCount,
                hash: hash
            });
            this.moveCount++;
        },

        id: function(value) {
            return _.isUndefined(value) ? this._id : this._id = value ;
        },

        event: function(value) {
            return _.isUndefined(value) ? this._event : this._event = value ;
        },

        black: function(value) {
            return _.isUndefined(value) ? this._black: this._black = value ;
        },

        white: function(value) {
            return _.isUndefined(value) ? this._white : this._white = value;
        },

        gameResult: function(value) {
            return _.isUndefined(value) ? this._gameResult : this._gameResult = value;
        },

        toJSON: function() {
            return {
                event: this._event,
                black: this._black,
                white: this._white,
                moves: this._moves,
                gameResult: this._gameResult
            };
        },

        moveHashesAsJSON: function() {
            return this.moveHash;
        },

        fromJSON: function(data) {
            this.id(data._id);
            this.event(data.event);
            this.black(data.black);
            this.white(data.white);
        }
    });

});