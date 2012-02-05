define(function(require, exports, module)
{
    var
        utils   = require("common/utils"),
        _       = require("underscore"),
        Class  = require("class"),
        Hashtable  = require('hash-table').Hashtable;


    var ExceptionClass = Class.extend({
        init: function(message)
        {
            this.message = message;
        },

        getMessage: function()
        {
            return this.message;
        }
    });

    var PositionDoesNotContainPieceError = ExceptionClass.extend({
    });

    var BoardDoesNotContainPieceError = ExceptionClass.extend({
    });

    var RestoreMoveError = ExceptionClass.extend({
    });

    var ChessCoordinateArgumentsError = ExceptionClass.extend({
    });

    var UnknownChessColorError = ExceptionClass.extend({
    });

    var UnsupportedOperationError = ExceptionClass.extend({
    });

    var GameResult = module.exports.GameResult = {
        WhiteWin: 1,
        BlackWin: 2,
        Draw: 3
    };

    var PieceTypeUtils = {
        pieceTypeAsEnglishAlgebraicNotation: function(pieceType) {
            switch(pieceType)
            {
                case PieceType.Pawn:
                    return 'P';
                    break;
                case PieceType.Knight:
                    return 'N';
                    break;
                case PieceType.Queen:
                    return 'Q';
                    break;
                case PieceType.Rook:
                    return 'R';
                    break;
                case PieceType.Bishop:
                    return 'B';
                    break;
                case PieceType.King:
                    return 'K';
                    break;
            }
        }
    };

    var PieceType = module.exports.PieceType = {
        Pawn:   'P',
        Knight: 'N',
        Queen:  'Q',
        Rook:   'R',
        Bishop: 'B',
        King:   'K'
    };

    var ColorUtils = module.exports.ColorUtils = {
        invert: function(chessColor) {
            switch(chessColor) {
                case ChessColor.White:
                    return ChessColor.Black;
                case ChessColor.Black:
                    return ChessColor.White;
            }
            throw new UnknownChessColorError(chessColor);
        }
    };

    var ChessColor = module.exports.ChessColor = {
        White: 0,
        Black: 1
    };

    var CastlingType = module.exports.CastlingType = {
        Long: 1,
        Short: 2
    };

    var MoveType = module.exports.MoveType = {
        Regular: 1,
        Castling: 2,
        PawnPromotion: 3,
        EndGame: 4
    };

    var CoordUtils = module.exports.CoordUtils = {

        incRank: function(coord, value)
        {
            return newCoord(coord.file, coord.rank + value);
        },

        containsSame: function(coordArray, testValue)
        {
            return _.find(coordArray, function (coord) { return CoordUtils.same(coord, testValue); })
                ? true : false;
        },

        same: function(left, right)
        {
            right = right || {  };
            return (left.file === right.file) &&
                (left.rank === right.rank);
        },

        inBoard: function(coord)
        {
            return coord.file >= 0 && coord.file <= 7 && coord.rank >= 0 && coord.rank <= 7;
        },

        topRightDiagonal: function(coord, includeSource)
        {
            return _(_.range(-8, 9)).chain()
                .map(function(i) { return newCoord(coord.file + i, coord.rank + i); })
                .filter(function(c) { return CoordUtils.inBoard(c) && (!includeSource || !CoordUtils.same(c, coord)); })
                .value();
        },

        topLeftDiagonal: function(coord, includeSource)
        {
            return _(_.range(-8, 9)).chain()
                .map(function(i) { return newCoord(coord.file - i, coord.rank + i); })
                .filter(function(coord) { return CoordUtils.inBoard(coord) && (!includeSource || !CoordUtils.same(c, coord)); })
                .value();
        },

        vertical: function(coord, includeSource)
        {
            return _(_.range(-8, 9)).chain()
                .map(function(i) { return newCoord(coord.file, coord.rank + i); })
                .filter(function(coord) { return CoordUtils.inBoard(coord) && (!includeSource || !CoordUtils.same(c, coord)); })
                .value();
        },

        horizontal: function(coord, includeSource)
        {
            return _(_.range(-8, 9)).chain()
                .map(function(i) { return newCoord(coord.file + i, coord.rank); })
                .filter(function(coord) { return CoordUtils.inBoard(coord) && (!includeSource || !CoordUtils.same(c, coord)); })
                .value();
        },

        neighbours: function(coord)
        {
            return _([
                [-1, +1], [-1, 0], [-1, -1],
                [ 0, +1],          [ 0, -1],
                [+1, +1], [+1, 0], [+1, -1]]).chain()
                .map(function(c) { return newCoord(coord.file + c[0], coord.rank + c[1]); })
                .filter(function(coord) { return CoordUtils.inBoard(coord); })
                .value();
        },

        up: function(coord, count, includeSource)
        {
            return _.map(
                _.range(coord.rank + (includeSource ? 0 : 1), _.min([coord.rank + count, 7]) + 1),
                function(i) { return newCoord(coord.file, i); }
            );
        },

        down: function(coord, count, includeSource)
        {
            return _.map(
                _.range(coord.rank - (includeSource ? 0 : 1), _.max([coord.rank - count, 0]) - 1, -1),
                function(i) { return newCoord(coord.file, i); });
        }
    };

    var Board = module.exports.Board = Class.extend({
        init: function()
        {
            this.cells = _.map(_.range(8),
                function() {
                    return _.map(_.range(8),
                        function() {
                            return null;
                        })
                });
        },

        findPieceCoord: function(pieceType, pieceColor)
        {
            var result = null;
            var piece = _.first(this.getPieces(function(piece, coord) {
                if (piece.getType() === pieceType && piece.getColor() === pieceColor){
                    result = coord;
                    return true;
                }
                return false;
            }));
            return result;
        },

        movePiece: function(source, target)
        {
            var piece = this.cells[source.file][source.rank];
            this.cells[source.file][source.rank] = null;
            this.cells[target.file][target.rank] = piece;
        },

        getPieces: function(filterCallback)
        {
            var callback = _.isUndefined(filterCallback) ? (function(){return true;}) : filterCallback;
            var result = [];
            for(var file = 0; file < 8; file++)
                for(var rank = 0; rank < 8; rank++)
                    if (this.getPieceAt(file, rank) != null)
                        if (callback(this.getPieceAt(file, rank), {file: file, rank: rank}))
                            result.push(this.getPieceAt(file, rank));
            return result;
        },

        removePiece: function(coord) {
            this.cells[coord.file][coord.rank] = null;
        },

        addPiece: function(coord, piece) {
            this.cells[coord.file][coord.rank] = piece;
        },

        containsPiece: function(piece)
        {
            for(var file = 0; file < 8; file++)
                for(var rank = 0; rank < 8; rank++)
                    if (this.getPieceAt(file, rank) === piece)
                        return true;
            return false;
        },

        getPieceCoord: function(piece)
        {
            for(var file = 0; file < 8; file++)
                for(var rank = 0; rank < 8; rank++)
                    if (this.getPieceAt(file, rank) === piece)
                        return {
                            file: file,
                            rank: rank
                        };
            throw new BoardDoesNotContainPieceError();
        },

        getPieceAt: function(file, rank) {
            return this.cells[file][rank];
        }
    });

    var DefaultGameRules = module.exports.DefaultGameRules = Class.extend({

        _canMoveOverOtherPieces: function(piece) {
            return piece.getType() === PieceType.Knight;
        },

        _getPiecePath: function(piece, source, target, removeEdges) {

            function sameAsSource(coord) { return CoordUtils.same(coord, source); }
            function sameAsTarget(coord) { return CoordUtils.same(coord, target); }

            function extractPathFromLine(abstractPath, source, target, removeEdges) {
                var tmpSource = _.indexOf(abstractPath, _.find(abstractPath, sameAsSource));
                var tmpTarget = _.indexOf(abstractPath, _.find(abstractPath, sameAsTarget));
                var sourceIndex = _.min([tmpSource, tmpTarget]);
                var targetIndex = _.max([tmpSource, tmpTarget]);
                return _(abstractPath).chain().first(targetIndex + (removeEdges ? 0 : 1)).rest(sourceIndex + (removeEdges ? 1 : 0)).value();
            }

            var abstractPath = this._getPossibleAbstractMoves(piece, source);

            if (_.isUndefined(_.find(abstractPath, sameAsTarget))) {
                throw "Error"; // TODO доделать исключение
            }
            else if (piece.getType() === PieceType.Pawn) {
                return extractPathFromLine(abstractPath, source, target, removeEdges);
            }
            else if (piece.getType() === PieceType.Queen)
            {
                if (CoordUtils.containsSame(CoordUtils.horizontal(source), target))
                {
                    return extractPathFromLine(CoordUtils.horizontal(source), source, target, removeEdges)
                }
                else if (CoordUtils.containsSame(CoordUtils.vertical(source), target))
                {
                    return extractPathFromLine(CoordUtils.vertical(source), source, target, removeEdges)
                }
                else if (CoordUtils.containsSame(CoordUtils.topRightDiagonal(source), target))
                {
                    return extractPathFromLine(CoordUtils.topRightDiagonal(source), source, target, removeEdges)
                }
                else if (CoordUtils.containsSame(CoordUtils.topLeftDiagonal(source), target))
                {
                    return extractPathFromLine(CoordUtils.topLeftDiagonal(source), source, target, removeEdges)
                }
            }
            else if (piece.getType() === PieceType.Rook)
            {
                if (CoordUtils.containsSame(CoordUtils.horizontal(source), target))
                {
                    return extractPathFromLine(CoordUtils.horizontal(source), source, target, removeEdges)
                }
                else if (CoordUtils.containsSame(CoordUtils.vertical(source), target))
                {
                    return extractPathFromLine(CoordUtils.vertical(source), source, target, removeEdges)
                }
            }
            else if (piece.getType() === PieceType.Bishop)
            {
                if (CoordUtils.containsSame(CoordUtils.topRightDiagonal(source), target))
                {
                    return extractPathFromLine(CoordUtils.topRightDiagonal(source), source, target, removeEdges)
                }
                else if (CoordUtils.containsSame(CoordUtils.topLeftDiagonal(source), target))
                {
                    return extractPathFromLine(CoordUtils.topLeftDiagonal(source), source, target, removeEdges)
                }
            }
        },


        /**
         * Возвращает набор клеток на которые может пойти
         * фигура с заданой клетки на пустой доске.
         */
        _getPossibleAbstractMoves: function(piece, source) {
            if (piece.getType() === PieceType.Pawn)
            {
                if (piece.getColor() === ChessColor.White)
                    return (source.rank === 1) ? CoordUtils.up(source, 2, true) : CoordUtils.up(source, 1, true);
                else
                    return (source.rank === 6) ? CoordUtils.down(source, 2, true) : CoordUtils.down(source, 1, true);
            }
            else if (piece.getType() === PieceType.Knight)
            {
                return _([ [+2, +1], [+2, -1], [+1, +2], [+1, -2], [-2, +1], [-2, -1], [-1, +2], [-1, -2] ]).chain()
                    .map(function (shift) {
                        return newCoord(source.file + shift[0], source.rank + shift[1]); })
                    .filter(function(coord) {
                        return coord.file >= 0 && coord.file <= 7 && coord.rank >= 0 && coord.rank <= 7;
                    })
                    .value();
            }
            else if (piece.getType() === PieceType.Queen) {
                return _.flatten([
                    CoordUtils.topRightDiagonal(source, false),
                    CoordUtils.topLeftDiagonal(source, false),
                    CoordUtils.horizontal(source, false),
                    CoordUtils.vertical(source, false)
                ]);
            }
            else if (piece.getType() === PieceType.Rook) {
                return _.flatten([
                    CoordUtils.horizontal(source, false),
                    CoordUtils.vertical(source, false)
                ]);
            }
            else if (piece.getType() === PieceType.Bishop) {
                return _.flatten([
                    CoordUtils.topRightDiagonal(source, false),
                    CoordUtils.topLeftDiagonal(source, false)
                ]);
            }
            else if (piece.getType() === PieceType.King) {
                return CoordUtils.neighbours(source);
            }
        },

        canCaptureKing: function(position, kingColor) {
            var kingCoord = position.findPieceCoord(PieceType.King, kingColor);
            if (!kingCoord)
                return false;

            var pieces = position.getPieces( function(piece, coord) {
                var result = piece.getColor() === ColorUtils.invert(kingColor);
                if (!result)
                    return false;

                if (result && (piece.getType() === PieceType.Pawn))
                    result = result &&
                            (Math.abs(coord.file - kingCoord.file) <= 1) &&
                            (Math.abs(coord.rank - kingCoord.rank) <= 2);

                if (result && (piece.getType() === PieceType.Bishop))
                    result = result && ((coord.file + coord.rank) % 2) === ((kingCoord.file + kingCoord.rank) % 2);

                if (result && (piece.getType() === PieceType.Knight))
                    result = result &&
                            (Math.abs(coord.file - kingCoord.file) <= 3) &&
                            (Math.abs(coord.rank - kingCoord.rank) <= 3);

                return result;
            });

            return _.any(pieces,
                function(piece){
                    return this.IsMovePossible(position, piece, kingCoord.file, kingCoord.rank, true);
                }.bind(this));
        },

        IsMovePossible: function(position, piece, targetFile, targetRank, skipKingCaptureCheck, pieceCoord) {
            skipKingCaptureCheck = skipKingCaptureCheck || false;

            if (!position.containsPiece(piece))
                throw new PositionDoesNotContainPieceError();
            var target = newCoord(targetFile, targetRank);
            pieceCoord = pieceCoord || position.getPieceCoord(piece);

            var isEnPassantCapture = false;
            function sameAsTarget(coord) { return CoordUtils.same(coord, target); }
            var targetInThePossibleCoords = (
                _.any(
                    this._getPossibleAbstractMoves(piece, pieceCoord),
                    sameAsTarget
                ));

            // Проверка что не рубим своего
            if (position.hasPieceAt(target.file, target.rank)) {
                if (piece.getColor() === position.getPieceAt(target.file, target.rank).getColor())
                    return false;
            }

            var result = targetInThePossibleCoords;

            if (piece.getType() === PieceType.Pawn) {

                if (targetInThePossibleCoords) {
                    if (position.hasPieceAt(target.file, target.rank)) {
                        if (piece.getColor() != position.getPieceAt(target.file, target.rank).getColor())
                            return false;
                    }
                    // Проверка неперескакивания через фигуры
                    if (!this._canMoveOverOtherPieces(piece)) {
                        var path = this._getPiecePath(piece, pieceCoord, target, true);
                        function hasPieceAtTarget(coord) { return !position.hasPieceAt(coord.file, coord.rank); }
                        result = _.all(path, hasPieceAtTarget);
                    }
                    else {
                        result = true;
                    }
                }
                else {
                    if (Math.abs(pieceCoord.file - target.file) === 1) {
                        if (((piece.getColor() === ChessColor.White) && ((target.rank - pieceCoord.rank) === 1)) ||
                            ((piece.getColor() === ChessColor.Black) && ((pieceCoord.rank - target.rank) === 1)))
                        {
                            if (position.hasPieceAt(target.file, target.rank)) {
                                if (piece.getColor() != position.getPieceAt(target.file, target.rank).getColor())
                                    result = true;
                            }
                            else
                            {
                                result = false;
                                if (position.getEnPassantTargetCoord() != null)
                                {
                                    if (piece.getColor() === ChessColor.White)
                                    {
                                        if (target.rank === 5)
                                        {
                                            if (CoordUtils.same(target, position.getEnPassantTargetCoord()))
                                            {
                                                result = true;
                                                isEnPassantCapture = true;
                                            }
                                        }
                                    }
                                    else if (piece.getColor() === ChessColor.Black)
                                    {
                                        if (target.rank === 2)
                                        {
                                            if (CoordUtils.same(target, position.getEnPassantTargetCoord()))
                                            {
                                                result = true;
                                                isEnPassantCapture = true;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if (piece.getType() === PieceType.Queen || piece.getType() === PieceType.Rook || piece.getType() === PieceType.Bishop) {

                if (targetInThePossibleCoords) {
                    // Проверка неперескакивания через фигуры
                    if (!this._canMoveOverOtherPieces(piece)) {
                        path = this._getPiecePath(piece, pieceCoord, target, true);
                        result = _.all(path, function(coord) { return !position.hasPieceAt(coord.file, coord.rank); });
                    }
                    else {
                        result = true;
                    }
                }
                else {
                    result = false;
                }
            }

            if (!skipKingCaptureCheck && result)
            {
                var capturedPiece;
                var capturedPieceCoord;
                if (isEnPassantCapture)
                {
                    capturedPieceCoord =
                        CoordUtils.incRank(
                            position.getEnPassantTargetCoord(),
                            (position.getNextMoveBy() === ChessColor.White) ? -1 : 1
                        );
                    capturedPiece = position.getPieceAt(capturedPieceCoord.file, capturedPieceCoord.rank);
                    if (capturedPiece) {
                        position.removePiece(capturedPieceCoord);
                    }
                }
                else
                {
                    capturedPiece = position.getPieceAt(target.file, target.rank);
                    if (capturedPiece)
                        position.removePiece(target);
                }

                position.movePiece(pieceCoord, target);

                result = !this.canCaptureKing(position, position.getNextMoveBy());

                position.movePiece(target, pieceCoord);

                if (isEnPassantCapture)
                {
                    if (capturedPiece)
                        position.addPiece(capturedPieceCoord, capturedPiece);
                }
                else
                {
                    if (capturedPiece)
                        position.addPiece(target, capturedPiece);
                }
            }

            return result;
        },

        /**
         *
         * @param {Position} position
         */
        fillInitialPosition: function(position)
        {
            var i;
            for (i = 0; i < 8; i++)
                position.addPiece(new Coord(i, 1), new Piece(PieceType.Pawn, ChessColor.White));
            position.addPiece(new Coord(0, 0), new Piece(PieceType.Rook, ChessColor.White));
            position.addPiece(new Coord(7, 0), new Piece(PieceType.Rook, ChessColor.White));
            
            position.addPiece(new Coord(2, 0), new Piece(PieceType.Bishop, ChessColor.White));
            position.addPiece(new Coord(5, 0), new Piece(PieceType.Bishop, ChessColor.White));

            position.addPiece(new Coord(1, 0), new Piece(PieceType.Knight, ChessColor.White));
            position.addPiece(new Coord(6, 0), new Piece(PieceType.Knight, ChessColor.White));

            position.addPiece(new Coord(3, 0), new Piece(PieceType.Queen, ChessColor.White));
            position.addPiece(new Coord(4, 0), new Piece(PieceType.King, ChessColor.White));

            for (i = 0; i < 8; i++)
                position.addPiece(new Coord(i, 6), new Piece(PieceType.Pawn, ChessColor.Black));
            position.addPiece(new Coord(0, 7), new Piece(PieceType.Rook, ChessColor.Black));
            position.addPiece(new Coord(7, 7), new Piece(PieceType.Rook, ChessColor.Black));

            position.addPiece(new Coord(2, 7), new Piece(PieceType.Bishop, ChessColor.Black));
            position.addPiece(new Coord(5, 7), new Piece(PieceType.Bishop, ChessColor.Black));
            
            position.addPiece(new Coord(1, 7), new Piece(PieceType.Knight, ChessColor.Black));
            position.addPiece(new Coord(6, 7), new Piece(PieceType.Knight, ChessColor.Black));

            position.addPiece(new Coord(3, 7), new Piece(PieceType.Queen, ChessColor.Black));
            position.addPiece(new Coord(4, 7), new Piece(PieceType.King, ChessColor.Black));
        }
        
    });

    var Piece = module.exports.Piece = Class.extend({
        init: function(pieceType, color)
        {
            this.pieceType = pieceType;
            this.color = color;
        },

        getColor: function()
        {
            return this.color;
        },

        getType: function()
        {
            return this.pieceType;
        }
    });

    function PiecesFactoryByColor(color) {

        function PieceFactoryByColorAndType(color, pieceType) {
            return function() { return new Piece(pieceType, color); };
        }

        var result = {};
        for(var pieceType in PieceType)
            result[pieceType] = PieceFactoryByColorAndType(color, PieceType[pieceType]);
        return result;
    }

    var Pieces = module.exports.Pieces = {
        White: PiecesFactoryByColor(ChessColor.White),
        Black: PiecesFactoryByColor(ChessColor.Black)
    };

    var HalfMoveRestorer = module.exports.HalfMoveRestorer = Class.extend({

        init: function()
        { },

        /**
         * @param {Position} initialPosition
         */
        restoreMove: function(initialPosition, partialHalfMove)
        {
            if (partialHalfMove.moveType === MoveType.Regular || partialHalfMove.moveType === MoveType.PawnPromotion) {
                if (partialHalfMove.pieceType == PieceType.Pawn){
                }
            }

            if (partialHalfMove.moveType === MoveType.Regular || partialHalfMove.moveType === MoveType.PawnPromotion)
            {
                var result = null;
                var currentHalfMove = partialHalfMove;

                var pieces = initialPosition.getPieces(function(piece, coord) {
                    var result =
                            (piece.getType() === currentHalfMove.pieceType) &&
                            (piece.getColor() === initialPosition.getNextMoveBy());

                    if (result && (currentHalfMove.pieceType === PieceType.Pawn))
                        result = result &&
                                (Math.abs(coord.file - currentHalfMove.target.file) <= 1) &&
                                (Math.abs(coord.rank - currentHalfMove.target.rank) <= 2);

                    if (result && (currentHalfMove.pieceType === PieceType.Bishop))
                        result = result && ((coord.file + coord.rank) % 2) === ((currentHalfMove.target.file + currentHalfMove.target.rank) % 2);

                    if (result && (currentHalfMove.pieceType === PieceType.Knight))
                        result = result &&
                                (Math.abs(coord.file - currentHalfMove.target.file) <= 3) &&
                                (Math.abs(coord.rank - currentHalfMove.target.rank) <= 3);

                    if (!_.isUndefined(currentHalfMove.source)) {
                        if (!_.isUndefined(currentHalfMove.source.file)) {
                            return result && (coord.file === currentHalfMove.source.file);
                        }
                        else if (!_.isUndefined(currentHalfMove.source.rank)) {
                            return result && (coord.rank === currentHalfMove.source.rank);
                        }
                    }
                    return result;
                });


                for (var j = 0; j < pieces.length; j++)
                {
                    var currentPiece = pieces[j];
                    var sourceCoord = initialPosition.getPieceCoord(currentPiece);

                    if (defaultRules.IsMovePossible(initialPosition, currentPiece,
                            currentHalfMove.target.file, currentHalfMove.target.rank, pieces.length === 1, sourceCoord))
                    {

                        result = {
                            moveType: MoveType.Regular,
                            pieceType: currentPiece.getType(),
                            source: {
                                file: sourceCoord.file,
                                rank: sourceCoord.rank
                            },
                            target: {
                                file: currentHalfMove.target.file,
                                rank: currentHalfMove.target.rank
                            }
                        };
                        break;
                    }
                }

                if (partialHalfMove.moveType == MoveType.PawnPromotion)
                {
                    result.moveType = MoveType.PawnPromotion;
                    result.promotedPieceType = partialHalfMove.promotedPieceType;
                }

                return result;
            }
        }
        
    });


    module.exports.newCoordCount = 0;

    function newCoord(file, rank) {
        module.exports.newCoordCount++;
        return {file: file, rank: rank};
    }


    var Coord = module.exports.Coord = Class.extend({

        init: function(file, rank) {

            this.file = file;
            this.rank = rank;
            return ;

            if (_.isUndefined(rank)) {
                if (_.isString(file))
                {
                    var parseResult = (/([a-h])([1-8])/ig).exec(file);
                    if (parseResult)
                    {
                        this.file = (parseResult[1].charCodeAt(0) - "a".charCodeAt(0));
                        this.rank = parseInt(parseResult[2]) - 1;
                    }
                    else
                    {
                        throw new ChessCoordinateArgumentsError();
                    }
                }
                else
                {
                    throw new ChessCoordinateArgumentsError();
                }
            }
            else {
                if ((_.isNumber(file) || _.isString(file)) && (_.isNumber(file) || _.isString(file)))
                {
                    if (_.isString(file) && (/[a-h]/ig).test(file))
                    {
                        this.file = (file.charCodeAt(0) - "a".charCodeAt(0));
                        this.rank = (_.isNumber(rank) ? rank : parseInt(rank)) - 1;
                    }
                    else
                    {
                        this.file = _.isNumber(file) ? file : parseInt(file);
                        this.rank = _.isNumber(rank) ? rank : parseInt(rank);
                    }
                }
                else
                {
                    throw new ChessCoordinateArgumentsError();
                }
            }
        },

        toString: function() {
            return ("abcdefgh".charAt(this.file)) + ("12345678".charAt(this.rank));
        }

    });

    var Move = module.exports.Move = Class.extend({
        getPositionBefore: function()
        {
            return this.initialPosition;
        },

        execute: function(gameContext)
        { },

        rollback: function(gameContext)
        { },

        getMoveType: function()
        { },

        getCaption: function() {
            return "Unknown";
        }
    });

    var RegularMove = module.exports.RegularMove = Move.extend({

        init: function(initialPosition, sourceCoord, targetCoord) {
            this.initialPosition = initialPosition;
            this.source = sourceCoord;
            this.target = targetCoord;
        },

        getMoveType: function() {
            return MoveType.Regular;
        },

        getSource: function(){
            return this.source;
        },

        getTarget: function(){
            return this.target;
        },

        getCaption: function() {
            return this.initialPosition.getPieceAt(this.source.file, this.source.rank).getType() +
                this.source.toString() + '-' +
                this.target.toString();
        },

        /**
         * @param {IGameContext} gameContext
         */
        execute: function(gameContext) {
            if (this.initialPosition.hasPieceAt(this.target.file, this.target.rank))
            {
                gameContext.removePiece(this.target);
            }
            gameContext.movePiece(this.source, this.target);

            gameContext.setEnPassantTargetCoord(null);
            if (this.initialPosition.getPieceAt(this.source.file, this.source.rank).getType() == PieceType.Pawn)
            {
                var color = this.initialPosition.getPieceAt(this.source.file, this.source.rank).getColor();

                if (CoordUtils.same(this.target, this.initialPosition.getEnPassantTargetCoord()))
                {
                    switch(color)
                    {
                        case ChessColor.White:
                            gameContext.removePiece(CoordUtils.incRank(this.target, -1));
                        break;
                        case ChessColor.Black:
                            gameContext.removePiece(CoordUtils.incRank(this.target, 1));
                        break;
                    }
                }
                else
                {
                    switch(color)
                    {
                        case ChessColor.White:
                            if (Math.abs(this.source.rank - this.target.rank) == 2 && this.source.rank == 1)
                            {
                                gameContext.setEnPassantTargetCoord(new Coord(this.source.file, this.source.rank + 1));
                            }
                        break;
                        case ChessColor.Black:
                            if (Math.abs(this.source.rank - this.target.rank) == 2 && this.source.rank == 6)
                            {
                                gameContext.setEnPassantTargetCoord(new Coord(this.source.file, this.source.rank - 1));
                            }
                        break;
                    }
                }
            }
        },

        rollback: function(gameContext) {
            gameContext.movePiece(this.target, this.source);
            if (this.initialPosition.hasPieceAt(this.target.file, this.target.rank))
            {
                gameContext.addPiece(this.target, this.initialPosition.getPieceAt(this.target.file, this.target.rank));
            }
            gameContext.setEnPassantTargetCoord(this.initialPosition.getEnPassantTargetCoord());
        }
    });

    var PawnPromotionMove = module.exports.PawnPromotionMove = RegularMove.extend({

        init: function(initialPosition, sourceCoord, targetCoord, promotedPieceType)
        {
            this._super(initialPosition, sourceCoord, targetCoord);
            this.promotedPieceType = promotedPieceType;
        },

        getMoveType: function() {
            return MoveType.PawnPromotion;
        },

        getPromotedPieceType: function() {
            return this.promotedPieceType;
        },

        execute: function(gameContext)
        {
            this._super(gameContext);
            gameContext.removePiece(this.target);
            gameContext.addPiece(
                this.target,
                new Piece(this.promotedPieceType,
                    this.initialPosition.getPieceAt(this.source.file, this.source.rank).getColor()
                ));
        }
    });

    var CastlingMove = module.exports.CastlingMove = Move.extend({
        
        init: function(initialPosition, castlingType)
        {
            this.initialPosition = initialPosition;
            this.castlingType = castlingType;
        },

        getMoveType: function() {
            return MoveType.Castling;
        },

        getCastlingType: function() {
            return this.castlingType;
        },

        getCaption: function() {
            return this.castlingType == CastlingType.Long ? "O-O-O" : "O-O";
        },

        /**
         * @param {IGameContext} gameContext
         */
        execute: function(gameContext)
        {
            if (this.initialPosition.getNextMoveBy() == ChessColor.White)
            {
                switch(this.castlingType)
                {
                    case CastlingType.Long:
                        gameContext.movePiece(new Coord(4, 0), new Coord(2, 0));
                        gameContext.movePiece(new Coord(0, 0), new Coord(3, 0));
                    break;
                    case CastlingType.Short:
                        gameContext.movePiece(new Coord(4, 0), new Coord(6, 0));
                        gameContext.movePiece(new Coord(7, 0), new Coord(5, 0));
                    break;
                }
            }
            else if (this.initialPosition.getNextMoveBy() == ChessColor.Black)
            {
                switch(this.castlingType)
                {
                    case CastlingType.Long:
                        gameContext.movePiece(new Coord(4, 7), new Coord(2, 7));
                        gameContext.movePiece(new Coord(0, 7), new Coord(3, 7));
                    break;
                    case CastlingType.Short:
                        gameContext.movePiece(new Coord(4, 7), new Coord(6, 7));
                        gameContext.movePiece(new Coord(7, 7), new Coord(5, 7));
                    break;
                }
            }
        },

        rollback: function(gameContext)
        {
            //gameContext.movePiece(this.target, this.source);
        }
    });

    var Game = module.exports.Game = Class.extend({

        init: function(initialPosition) {
            this.initialPosition = initialPosition.clone();
            this.gameResult = null;
        },

        getGameResult: function(){
            return this.gameResult;
        },

        setGameResult: function(gameResult){
            this.gameResult = gameResult;
        },

        begin: function() {
            this.moves = [];
        },

        addCastlingHalfMove: function(castlingType) {
            var position = this.getPositionBefore(this.moves.length).clone();
            
            var move = new CastlingMove(this.getPositionBefore(this.moves.length).clone(), castlingType);
            move.execute(position);
            position.invertNextMoveBy();

            this.moves.push({
                move: move,
                moveType: MoveType.Castling,
                castlingType: castlingType,
                position: position
            });
        },

        addPromotionMove: function(sourceFile, sourceRank, targetFile, targetRank, promotedPieceType) {
            var position = this.getPositionBefore(this.moves.length).clone();

            var move = new PawnPromotionMove(
                this.getPositionBefore(this.moves.length).clone(),
                new Coord(sourceFile, sourceRank),
                new Coord(targetFile, targetRank),
                promotedPieceType);
            move.execute(position);
            position.invertNextMoveBy();

            this.moves.push({
                move: move,
                moveType: MoveType.PawnPromotion,
                promotedPieceType: promotedPieceType,
                position: position,
                source:
                {
                    file: sourceFile,
                    rank: sourceRank
                },
                target:
                {
                    file: targetFile,
                    rank: targetRank
                }
            });
        },

        addHalfMove: function(sourceFile, sourceRank, targetFile, targetRank) {
            var position = this.getPositionBefore(this.moves.length).clone();
            
            var move = new RegularMove(
                this.getPositionBefore(this.moves.length).clone(),
                new Coord(sourceFile, sourceRank),
                new Coord(targetFile, targetRank));
            move.execute(position);
            position.invertNextMoveBy();

            this.moves.push({
                move: move,
                moveType: MoveType.Regular,
                position: position,
                source:
                {
                    file: sourceFile,
                    rank: sourceRank
                },
                target:
                {
                    file: targetFile,
                    rank: targetRank
                }
            });
        },

        getPositionBefore: function(halfMoveIndex) {
            if (halfMoveIndex == 0)
                return this.initialPosition;
            else
                return this.moves[halfMoveIndex - 1].position;
        },

        getHalfMoveAt: function(index) {
            return this.moves[index].move;
        },

        end: function() {
            
        },

        loadFromJSON: function(json) {
            this.begin()
            _.each(json.moves, function(move) {

                switch (move.moveType)
                {
                    case MoveType.Regular:
                        this.addHalfMove(move.source.file, move.source.rank, move.target.file, move.target.rank);
                    break;
                    case MoveType.Castling:
                        this.addCastlingHalfMove(move.castlingType);
                    break;
                    case MoveType.PawnPromotion:
                        this.addPromotionMove(move.source.file, move.source.rank, move.target.file, move.target.rank, move.promotedPieceType);
                    break;
                }

            }.bind(this));
            this.end()
        },

        getHalfMoves: function() {
            return _.map(this.moves, function(m) { return m.move; });
        }
    });

    var IGameContext = module.exports.IGameContext = Class.extend({
        movePiece: function(source, target)
        { },

        removePiece: function(coord)
        { },

        addPiece: function(coord, piece)
        { },

        setEnPassantTargetCoord: function(coord)
        { }
    });

    var Position = module.exports.Position = Class.extend({
        // Implements: [IGameContext],

        init: function()
        {
            this.board = new Board();

            // Кто ходит следующим.
            this.nextMoveBy = ChessColor.White;

            // Возможность взятия пешки на проходе. Указывается проходимое поле
            this.enPassantTargetCoord = null; // new Coord();
        },

        findPieceCoord: function(pieceType, pieceColor)
        {
            return this.board.findPieceCoord(pieceType, pieceColor);
        },

        setEnPassantTargetCoord: function(coord)
        {
            this.enPassantTargetCoord = coord;
        },

        getEnPassantTargetCoord: function()
        {
            return this.enPassantTargetCoord;
        },

        /**
         * Устанавливает цвет, кто должен делать следующий ход
         */
        setNextMoveBy: function(chessColor)
        {
            this.nextMoveBy = chessColor;
        },

        /**
         * Возвращает цвет, кто должен делать следующий ход
         */
        getNextMoveBy: function()
        {
            return this.nextMoveBy;
        },

        /**
         * Инвертирует цвет, кто должен делать следующий ход
         */
        invertNextMoveBy: function()
        {
            if (this.nextMoveBy == ChessColor.White)
                this.nextMoveBy = ChessColor.Black;
            else
                this.nextMoveBy = ChessColor.White;
        },

        getPieces: function (filterCallback)
        {
            return this.board.getPieces(filterCallback);
        },

        removePiece: function(coord)
        {
            this.board.removePiece(coord);
        },
        
        addPiece: function(coord, piece) {
            this.board.addPiece(coord, piece)
        },

        containsPiece: function(piece)
        {
            return this.board.containsPiece(piece);
        },

        getPieceAt: function(file, rank)
        {
            return this.board.getPieceAt(file, rank);
        },

        hasPieceAt: function(file, rank)
        {
            return this.getPieceAt(file, rank) != null;
        },

        getPieceCoord: function(piece)
        {
            return this.board.getPieceCoord(piece);
        },

        movePiece: function(source, target)
        {
            this.board.movePiece(source, target);
        },

        toFEN: function(includeMoveCountInfo) {

            includeMoveCountInfo = includeMoveCountInfo || false;

            var piecePlacement = '';
            for (var rank = 7; rank >= 0; rank--) {

                if (rank != 7)
                    piecePlacement += '/';

                var lastEmptyCoordCount = 0;
                for (var file = 0; file < 8; file++) {
                    if (!this.hasPieceAt(file, rank)) {
                        lastEmptyCoordCount++;
                    }
                    else {
                        if (lastEmptyCoordCount > 0) {
                            piecePlacement += lastEmptyCoordCount.toString();
                            lastEmptyCoordCount = 0;
                        }
                        piecePlacement +=
                            this.getPieceAt(file, rank).getColor() == ChessColor.Black ?
                                PieceTypeUtils.pieceTypeAsEnglishAlgebraicNotation(
                                        this.getPieceAt(file, rank).getType()).toLowerCase() :
                                PieceTypeUtils.pieceTypeAsEnglishAlgebraicNotation(
                                        this.getPieceAt(file, rank).getType()).toUpperCase();
                    }
                }
                if (lastEmptyCoordCount > 0)
                    piecePlacement += lastEmptyCoordCount.toString();
            }

            var nextMove;
            if (this.getNextMoveBy() == ChessColor.White)
                nextMove = 'w';
            else
                nextMove = 'b';
            var castlings = 'KQkq';

            var enPassantCoord = '-';
            if (this.getEnPassantTargetCoord() != null)
                enPassantCoord = this.getEnPassantTargetCoord().toString();

            if (includeMoveCountInfo)
                throw new UnsupportedOperationError("");

            return piecePlacement + ' ' + nextMove + ' ' + castlings + ' ' + enPassantCoord;
        },

        clone: function()
        {
            var result = new Position();

            for(var file = 0; file < 8; file++){
                for(var rank = 0; rank < 8; rank++) {
                    if (this.hasPieceAt(file, rank))
                        result.addPiece(newCoord(file, rank), this.getPieceAt(file, rank));
                }
            }
            result.setNextMoveBy(this.getNextMoveBy());
            result.setEnPassantTargetCoord(this.getEnPassantTargetCoord());
            return result;
        }
    });

    var AlgebraicNotationParser = module.exports.AlgebraicNotationParser = Class.extend({

        _fileStringToFile: function(fileString)
        {
            switch (fileString)
            {
                case "a": return 0; break;
                case "b": return 1; break;
                case "c": return 2; break;
                case "d": return 3; break;
                case "e": return 4; break;
                case "f": return 5; break;
                case "g": return 6; break;
                case "h": return 7; break;
            }
        },

        _rankStringToRank: function(rankString)
        {
            return parseInt(rankString) - 1;
        },

        _pgnPieceLetterToPieceType: function(pieceString)
        {
            switch (pieceString)
            {
                case "P": return PieceType.Pawn; break;
                case "K": return PieceType.King; break;
                case "Q": return PieceType.Queen; break;
                case "R": return PieceType.Rook; break;
                case "B": return PieceType.Bishop; break;
                case "N": return PieceType.Knight; break;
            }
            return PieceType.Pawn
        },

        _extractHalfMoveInfo: function(regexpArray)
        {
            if (regexpArray[9])
            {
                return {
                    moveType: MoveType.Castling,
                    castlingType: CastlingType.Short
                };
            }
            else if (regexpArray[8])
            {
                return {
                    moveType: MoveType.Castling,
                    castlingType: CastlingType.Long
                };
            }
            else
            {
                var result = {
                    moveType: MoveType.Regular,
                    pieceType: this._pgnPieceLetterToPieceType(regexpArray[2]),
                    target:
                    {
                        file: this._fileStringToFile(regexpArray[5]),
                        rank: this._rankStringToRank(regexpArray[6])
                    }
                };

                if (regexpArray[3]) {
                    _.extend(result, {
                        source: {
                            file: this._fileStringToFile(regexpArray[3])
                        }
                    });
                }

                if (regexpArray[4]) {
                    _.extend(result, {
                        source: {
                            rank: this._rankStringToRank(regexpArray[4])
                        }
                    });
                }
                if (regexpArray[7]) {
                    result.moveType = MoveType.PawnPromotion;
                    result.promotedPieceType = this._pgnPieceLetterToPieceType(regexpArray[7]);
                }

                return result;
            }
        },

        _parseHalfMove: function(halfMoveText)
        {
            var regexp = /(([PNQRBK]){0,1}([a-h]){0,1}([1-8]){0,1}x{0,1}([a-h])([1-8])([PNQRBK]){0,1})|([0O]-[0O]-[0O])|([0O]-[0O])/i;
            var match = regexp.exec(halfMoveText);
            //console.log(match);
            return match ? this._extractHalfMoveInfo(match) : null;
        },

        parse: function(moveText)
        {
            var result = [];

            var movesRegexp = /\d\.\s*(\S*?)\s(\S*?)(\s|$)/ig;

            var fullMoveMatch;
            while ((fullMoveMatch = movesRegexp.exec(moveText)))
            {
                var firstHalfMove = fullMoveMatch[1];
                var secondHalfMove = fullMoveMatch[2];
                
                result.push(this._parseHalfMove(firstHalfMove));
                !secondHalfMove || result.push(this._parseHalfMove(secondHalfMove));
            }

            var gameResultRegExp = /(1-0)|(0-1)|(1\/2-1\/2)/i;
            var gameResultMatch = gameResultRegExp.exec(moveText);

            if (gameResultMatch)
            {
                if (gameResultMatch[1])
                    result.push({
                        moveType: MoveType.EndGame,
                        gameResult: GameResult.WhiteWin
                    });
                else if (gameResultMatch[2])
                    result.push({
                        moveType: MoveType.EndGame,
                        gameResult: GameResult.BlackWin
                    });
                else if (gameResultMatch[3])
                    result.push({
                        moveType: MoveType.EndGame,
                        gameResult: GameResult.Draw
                    });
            }
            return result;
        }
        
    });

    var GameRestorer = module.exports.GameRestorer = Class.extend({

        init: function(notationParserClass)
        {
            this.notationParser = new notationParserClass();
        },

        restoreGame: function(game, moveText)
        {
            var halfMoveRestorer = new HalfMoveRestorer();
            var halfMoves = this.notationParser.parse(moveText);

            var currentMove = 0;

            game.begin();
            _.each(halfMoves, function(halfMove)
            {
                if (halfMove.moveType == MoveType.Castling) {
                    game.addCastlingHalfMove(halfMove.castlingType);
                }
                else if (halfMove.moveType == MoveType.EndGame) {

                    game.setGameResult(halfMove.gameResult);
                }
                else
                {
                    var fullMove = halfMoveRestorer.restoreMove(game.getPositionBefore(currentMove), halfMove);
                    if (fullMove == null)
                    {
                        console.log(halfMove);
                        throw new RestoreMoveError('Unable to restore move ' +
                            halfMove.pieceType + ': ' + halfMove.target.file + '-' + halfMove.target.rank
                        );
                    }
                    switch(fullMove.moveType)
                    {
                        case MoveType.Regular:
                            game.addHalfMove(
                                    fullMove.source.file, fullMove.source.rank,
                                    fullMove.target.file, fullMove.target.rank);
                        break;
                        case MoveType.PawnPromotion:
                            game.addPromotionMove(
                                    fullMove.source.file, fullMove.source.rank,
                                    fullMove.target.file, fullMove.target.rank,
                                    fullMove.promotedPieceType);
                        break;
                    }
                }
                currentMove++;
            });
            game.end();
        }

    });

    var defaultRules = exports.defaultRules = new DefaultGameRules();

    var createDefaultGamePosition = module.exports.createDefaultGamePosition = function()
    {
        var position = new Position();
        defaultRules.fillInitialPosition(position);
        return position;
    };

    var createEmptyGamePosition = module.exports.createEmptyGamePosition = function()
    {
        return new Position();
    };

});