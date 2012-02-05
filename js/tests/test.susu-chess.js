define(function(require, exports, module)
{
    var
        chess   = require("common/susu-chess");

    exports.BoardTests = {
        testPutPieceOnBoard: function(test)
        {
            var board = new chess.Board();
            var piece = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            board.addPiece(new chess.Coord(0, 0), piece); // a1
            test.equals(piece, board.getPieceAt(0, 0));
            test.done();
        },

        testContainsPiece: function(test)
        {
            var board = new chess.Board();
            var piece = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            var notOnBoardPiece = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);

            board.addPiece(new chess.Coord(0, 0), piece); // a1

            test.equals(true, board.containsPiece(piece));
            test.equals(false, board.containsPiece(notOnBoardPiece));

            test.done();
        },

        testGetPieceCoords: function(test)
        {
            var board = new chess.Board();
            var piece = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            var notOnBoardPiece = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            board.addPiece(new chess.Coord(1, 2), piece); // b3
            var coord = board.getPieceCoord(piece)
            test.equals(1, coord.file);
            test.equals(2, coord.rank);
            test.done();
        }
    };

    var CoordUtilsTests =
        //exports.CoordUtilsTests =
    {

        testUp: function(test)
        {
            var coord = new chess.Coord(1, 1);
            var series = chess.CoordUtils.up(coord, 2);

            test.equals(2, series.length);

            test.equals(1, series[0].file);
            test.equals(2, series[0].rank);
            test.equals(1, series[1].file);
            test.equals(3, series[1].rank);

            test.done();
        },

        testCoordCreation: function(test)
        {
            var coord1 = new chess.Coord(1, 2);
            test.equals(1, coord1.file);
            test.equals(2, coord1.rank);

            var coord2 = new chess.Coord("1", "2");
            test.equals(1, coord2.file);
            test.equals(2, coord2.rank);

            var coord3 = new chess.Coord("b3");
            test.equals(1, coord3.file);
            test.equals(2, coord3.rank);

            var coord4 = new chess.Coord("b", "3");
            test.equals(1, coord4.file);
            test.equals(2, coord4.rank);

            var coord5 = new chess.Coord("b", 3);
            test.equals(1, coord5.file);
            test.equals(2, coord5.rank);

            test.done();
        }

    };

    exports.RestoreFullMovesInformation = {

        testRestoreFullMoveInfoFromSinglePiecePosition: function(test)
        {
            var partialMove = {
                    moveType: chess.MoveType.Regular,
                    pieceType: chess.PieceType.Pawn,
                    target: {
                        file: 4, // e
                        rank: 3  // 4
                    }
                };

            var position = new chess.Position();
            var piece = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            position.addPiece(new chess.Coord(4, 1), piece); // e2

            var gameRestorer = new chess.HalfMoveRestorer();
            var move = gameRestorer.restoreMove(position, partialMove);

            test.equals(4, move.source.file);
            test.equals(1, move.source.rank);
            test.equals(4, move.target.file);
            test.equals(3, move.target.rank);

            test.done();
        },

        testRestoreKnightMove: function(test)
        {
            var partialMove = {
                    moveType: chess.MoveType.Regular,
                    pieceType: chess.PieceType.Knight,
                    target: {
                        file: 3, // d
                        rank: 2  // 3
                    }
                };

            var position = new chess.Position();
            var piece1 = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            var piece2 = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            position.addPiece(new chess.Coord(5, 0), piece1); // f1
            position.addPiece(new chess.Coord(2, 0), piece2); // c1

            var gameRestorer = new chess.HalfMoveRestorer();
            var move = gameRestorer.restoreMove(position, partialMove);

            test.equals(2, move.source.file);
            test.equals(0, move.source.rank);
            test.equals(3, move.target.file);
            test.equals(2, move.target.rank);

            test.done();
        }
    };

    exports.GameRestorerTest = {
        testParseSimpleGame: function(test)
        {
            var moveText = '1. e4 e6';
            var position = chess.createDefaultGamePosition();
            var game = new chess.Game(position);

            var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);
            restorer.restoreGame(game, moveText);

            var move0 = game.getHalfMoveAt(0);
            test.equals(4, move0.source.file);
            test.equals(1, move0.source.rank);
            test.equals(4, move0.target.file);
            test.equals(3, move0.target.rank);

            var move1 = game.getHalfMoveAt(1);
            test.equals(4, move1.source.file);
            test.equals(6, move1.source.rank);
            test.equals(4, move1.target.file);
            test.equals(5, move1.target.rank);

            test.done();
        },

        testParseSimpleGame: function(test)
        {
            var moveText = '1. e4 e6 0-1';
            var position = chess.createDefaultGamePosition();
            var game = new chess.Game(position);

            var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);
            restorer.restoreGame(game, moveText);
            test.equals(chess.GameResult.BlackWin, game.getGameResult());

            test.done();
        }
    };

    exports.AlgebraicNotationParserTest = ({

        setUp: function(done)
        {
            this.notationParser = new chess.AlgebraicNotationParser();
            done();
        },

        testParseSingleMove: function(test)
        {
            var moveText = "1. e4 e6";

            var notationParser = new chess.AlgebraicNotationParser();

            var halfMovesInfo = notationParser.parse(moveText);

            test.equals(2, halfMovesInfo.length);

            test.equals(4, halfMovesInfo[0].target.file);
            test.equals(3, halfMovesInfo[0].target.rank);

            test.equals(4, halfMovesInfo[1].target.file);
            test.equals(5, halfMovesInfo[1].target.rank);

            test.done();
        },

        testParseTwoMoves: function(test)
        {
            var moveText = "1. e4 e6 2. d4 d6";

            var notationParser = new chess.AlgebraicNotationParser();

            var halfMovesInfo = notationParser.parse(moveText);

            test.equals(4, halfMovesInfo.length);

            test.equals(chess.PieceType.Pawn, halfMovesInfo[0].pieceType);
            test.equals(3, halfMovesInfo[2].target.file);
            test.equals(3, halfMovesInfo[2].target.rank);

            test.done();
        },

        testParseKnightMove: function(test)
        {
            var moveText = "1. Nd3 e6";

            var notationParser = new chess.AlgebraicNotationParser();

            var halfMovesInfo = notationParser.parse(moveText);

            test.equals(2, halfMovesInfo.length);

            test.equals(chess.PieceType.Knight, halfMovesInfo[0].pieceType);
            test.equals(3, halfMovesInfo[0].target.file);
            test.equals(2, halfMovesInfo[0].target.rank);

            test.done();
        },

        testParseWithPlusSing: function(test)
        {
            var moveText = "1. Nd3 e6";

            var notationParser = new chess.AlgebraicNotationParser();

            var halfMovesInfo = notationParser.parse(moveText);

            test.equals(2, halfMovesInfo.length);

            test.equals(chess.PieceType.Pawn, halfMovesInfo[1].pieceType);
            test.equals(4, halfMovesInfo[1].target.file);
            test.equals(5, halfMovesInfo[1].target.rank);

            test.done();
        },

        testParseAmbigousMoveWithFile: function(test)
        {
            var moveText = "1. exd5 ";

            var halfMovesInfo = this.notationParser.parse(moveText);

            test.equals(1, halfMovesInfo.length);

            test.equals(chess.PieceType.Pawn, halfMovesInfo[0].pieceType);
            test.equals(4, halfMovesInfo[0].source.file);
            test.equals(3, halfMovesInfo[0].target.file);
            test.equals(4, halfMovesInfo[0].target.rank);

            test.done();
        },

        testParseAmbigousMoveWithRank: function(test)
        {
            var moveText = "1. N2d4 ";

            var halfMovesInfo = this.notationParser.parse(moveText);

            test.equals(1, halfMovesInfo.length);

            test.equals(chess.PieceType.Knight, halfMovesInfo[0].pieceType);
            test.equals(1, halfMovesInfo[0].source.rank);
            test.equals(3, halfMovesInfo[0].target.file);
            test.equals(3, halfMovesInfo[0].target.rank);

            test.done();
        },

        testParseCastlingMove: function(test)
        {
            var moveText = "1. O-O O-O-O";

            var notationParser = new chess.AlgebraicNotationParser();

            var halfMovesInfo = notationParser.parse(moveText);

            test.equals(2, halfMovesInfo.length);

            test.equals(chess.MoveType.Castling, halfMovesInfo[0].moveType);
            test.equals(chess.CastlingType.Short, halfMovesInfo[0].castlingType);

            test.equals(chess.MoveType.Castling, halfMovesInfo[1].moveType);
            test.equals(chess.CastlingType.Long, halfMovesInfo[1].castlingType);

            test.done();
        }
    });

    exports.PositionTests = {

        testToFEN: function(test){
            var position = chess.createDefaultGamePosition();
            test.equals(
                'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -',
                position.toFEN());

            test.done();
        }

    };

});