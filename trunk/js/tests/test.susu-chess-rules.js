define(function(require, exports, module)
{
    var
        chess   = require("common/susu-chess");

    exports.GameRulesTests = {

        setUp: function(done)
        {
            this.position = new chess.Position();
            this.gameRules = new chess.DefaultGameRules();

            this.assertPossibleMove = function (test, piece, targetFile, targetRank) {
                var target = new chess.Coord(targetFile, targetRank);
                test.equals(true, this.gameRules.IsMovePossible(this.position, piece, target.file, target.rank));
            };

            this.assertImpossibleMove = function (test, piece, targetFile, targetRank) {
                var target = new chess.Coord(targetFile, targetRank);
                test.equals(false, this.gameRules.IsMovePossible(this.position, piece, target.file, target.rank));
            };

            done();
        },

        testSimplePawnMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 1), piece); // e2

            this.assertPossibleMove(test, piece, 4, 3);
            this.assertPossibleMove(test, piece, 4, 2);
            this.assertImpossibleMove(test, piece, 5, 2);

            test.done();
        },

        testIsPositionWithCheck: function(test)
        {
            this.position.addPiece(new chess.Coord(0, 0), chess.Pieces.White.King());
            this.position.addPiece(new chess.Coord(1, 1), chess.Pieces.White.Rook());
            this.position.addPiece(new chess.Coord(2, 2), chess.Pieces.Black.Bishop());

            test.equals(false, this.gameRules.canCaptureKing(this.position, chess.ChessColor.White));
            this.position.movePiece(new chess.Coord(1, 1), new chess.Coord(1, 7));
            test.equals(true, this.gameRules.canCaptureKing(this.position, chess.ChessColor.White));

            test.done();
        },

        testSimpleKnightMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Knight, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 4), piece);

            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 6, 5));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 6, 3));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 5, 6));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 5, 2));

            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 2, 5));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 2, 3));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 3, 6));
            test.equals(true, this.gameRules.IsMovePossible(this.position, piece, 3, 2));

            test.equals(false, this.gameRules.IsMovePossible(this.position, piece, 6, 6));

            test.done();
        },

        testSimpleKingMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.King, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 4), piece); 

            this.assertPossibleMove(test, piece, 5, 5);
            this.assertPossibleMove(test, piece, 5, 4);
            this.assertPossibleMove(test, piece, 5, 3);

            this.assertPossibleMove(test, piece, 4, 5);
            this.assertPossibleMove(test, piece, 4, 3);

            this.assertPossibleMove(test, piece, 3, 5);
            this.assertPossibleMove(test, piece, 3, 4);
            this.assertPossibleMove(test, piece, 3, 3);

            this.assertImpossibleMove(test, piece, 6, 3);
            test.done();
        },

        testSimpleQueenMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Queen, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 4), piece); // e2

            this.assertPossibleMove(test, piece, 4, 5);
            this.assertPossibleMove(test, piece, 4, 7);
            this.assertPossibleMove(test, piece, 4, 3);
            this.assertPossibleMove(test, piece, 4, 0);

            this.assertPossibleMove(test, piece, 5, 4);
            this.assertPossibleMove(test, piece, 7, 4);
            this.assertPossibleMove(test, piece, 3, 4);
            this.assertPossibleMove(test, piece, 0, 4);

            this.assertPossibleMove(test, piece, 5, 5);
            this.assertPossibleMove(test, piece, 6, 6);
            this.assertPossibleMove(test, piece, 0, 0);

            this.assertPossibleMove(test, piece, 2, 6);
            this.assertPossibleMove(test, piece, 6, 2);

            this.assertImpossibleMove(test, piece, 5, 6);

            test.done();
        },

        testQueenCanBeatSameColorPieces: function(test)
        {
            var queen = chess.Pieces.White.Queen();
            this.position.addPiece(new chess.Coord(4, 4), queen); // e2

            this.position.addPiece(new chess.Coord(5, 5), chess.Pieces.White.Pawn());
            this.assertImpossibleMove(test, queen, 5, 5);

            test.done();
        },

        testQueenMoveOverOtherPieces: function(test)
        {
            var queen = chess.Pieces.White.Queen();

            this.position.addPiece(new chess.Coord(4, 4), queen); // e2

            this.position.addPiece(new chess.Coord(5, 5), chess.Pieces.Black.Pawn());
            this.assertPossibleMove(test, queen, 5, 5);
            this.assertImpossibleMove(test, queen, 6, 6);

            test.done();
        },

        testSimpleRookMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Rook, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 4), piece); // e2

            this.assertPossibleMove(test, piece, 4, 5);
            this.assertPossibleMove(test, piece, 4, 7);
            this.assertPossibleMove(test, piece, 4, 3);
            this.assertPossibleMove(test, piece, 4, 0);

            this.assertPossibleMove(test, piece, 5, 4);
            this.assertPossibleMove(test, piece, 7, 4);
            this.assertPossibleMove(test, piece, 3, 4);
            this.assertPossibleMove(test, piece, 0, 4);

            this.assertImpossibleMove(test, piece, 5, 6);

            test.done();
        },


        testF8ToE8RookMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Rook, chess.ChessColor.Black);
            this.position.addPiece(new chess.Coord(5, 7), piece); // e2

            this.assertPossibleMove(test, piece, 4, 7);

            test.done();
        },

        testSimpleBishopMove: function(test)
        {
            var piece = new chess.Piece(chess.PieceType.Bishop, chess.ChessColor.White);
            this.position.addPiece(new chess.Coord(4, 4), piece); // e2

            this.assertPossibleMove(test, piece, 5, 5);
            this.assertPossibleMove(test, piece, 6, 6);
            this.assertPossibleMove(test, piece, 0, 0);

            this.assertPossibleMove(test, piece, 2, 6);
            this.assertPossibleMove(test, piece, 6, 2);

            this.assertImpossibleMove(test, piece, 5, 6);

            test.done();
        },

        testPawnMoveOverPiece: function(test)
        {
            var piece1 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            var piece2 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);

            this.position.addPiece(new chess.Coord(4, 1), piece1);
            this.position.addPiece(new chess.Coord(4, 2), piece2);

            test.equals(false, this.gameRules.IsMovePossible(this.position, piece1, 4, 3));

            test.done();
        },

        testPawnMoveToPiece: function(test)
        {
            var piece1 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            var piece2 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.Black);

            this.position.addPiece(new chess.Coord(4, 1), piece1);
            this.position.addPiece(new chess.Coord(4, 3), piece2);

            test.equals(false, this.gameRules.IsMovePossible(this.position, piece1, 4, 3));

            test.done();
        },

        testPawnSimpleBeat: function(test)
        {
            var piece1 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White);
            var piece2 = new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.Black);

            this.position.addPiece(new chess.Coord(4, 1), piece1);
            this.position.addPiece(new chess.Coord(5, 2), piece2);

            this.assertPossibleMove(test, piece1, 5, 2);
            this.assertImpossibleMove(test, piece1, 3, 2);

            test.done();
        },
        
        testPawnEnPassantBeat: function(test)
        {
            var piece;
            this.position.addPiece(new chess.Coord(1, 4), piece = chess.Pieces.White.Pawn()); // b5
            this.position.addPiece(new chess.Coord(0, 4), chess.Pieces.Black.Pawn()); // a5
            this.position.setEnPassantTargetCoord(new chess.Coord(0, 5));

            this.assertPossibleMove(test, piece, 0, 5);
            this.assertImpossibleMove(test, piece, 2, 5);

            test.done();
        }
    };
});    
