define(function(require, exports, module)
{
    var
        chess   = require("common/susu-chess"),
        Class1  = require("class");
    
    exports.GameTests = {
        setUp: function(done)
        {
            this.initialPositionWithSinglePawn = new chess.Position();
            this.initialPositionWithSinglePawn.addPiece(new chess.Coord(4, 1), new chess.Piece(chess.PieceType.Pawn, chess.ChessColor.White));
            done();
        },

        testMakeFirstMove: function(test)
        {
            var game = new chess.Game(this.initialPositionWithSinglePawn);

            game.begin();
            game.addHalfMove(4, 1, 4, 3); //e2 - e4
            game.end();

            var testGameContext = new (Class1.extend({ Implements: [chess.IGameContext],
                movePiece: function(source, target) {
                    this.source = source;
                    this.target = target;
                },
                setEnPassantTargetCoord: function() { }
            }))();

            var firstHalfMove = game.getHalfMoveAt(0);
            firstHalfMove.execute(testGameContext);

            test.equals(4, testGameContext.source.file);
            test.equals(1, testGameContext.source.rank);
            test.equals(4, testGameContext.target.file);
            test.equals(3, testGameContext.target.rank);

            test.done();
        },

        testGetPositionAtMove: function(test)
        {
            var game = new chess.Game(this.initialPositionWithSinglePawn);

            game.begin();
            game.addHalfMove(4, 1, 4, 3); //e2 - e4
            game.end();

            var position0 = game.getPositionBefore(0);
            test.equals(true, position0.getPieceAt(4, 1).getType() == chess.PieceType.Pawn);

            var position1 = game.getPositionBefore(1);
            test.equals(true, position1.getPieceAt(4, 3).getType() == chess.PieceType.Pawn);

            test.done();
        },

        testAddShortCastlingMove: function(test)
        {
            var position = new chess.Position();
            position.addPiece(new chess.Coord(0, 0), chess.Pieces.White.Rook());
            position.addPiece(new chess.Coord(4, 0), chess.Pieces.White.King());

            var game = new chess.Game(position);

            game.begin();
            game.addCastlingHalfMove(chess.CastlingType.Long);
            game.end();

            var position1 = game.getPositionBefore(1);
            test.equals(chess.PieceType.King, position1.getPieceAt(2, 0).getType());
            test.equals(chess.PieceType.Rook, position1.getPieceAt(3, 0).getType());

            test.done();
        },

        testPawnMoveWithEnPassant: function(test)
        {
            var position = new chess.Position();
            position.addPiece(new chess.Coord(0, 1), chess.Pieces.White.Pawn());

            var game = new chess.Game(position);

            game.begin();
            game.addHalfMove(0, 1, 0, 3);
            game.end();

            var position1 = game.getPositionBefore(1);
            test.ok(position1.getEnPassantTargetCoord() != null);
            test.equals(0, position1.getEnPassantTargetCoord().file);
            test.equals(2, position1.getEnPassantTargetCoord().rank);
            
            test.done();
        },

        testPawnPromotionMove: function(test)
        {
            var position = new chess.Position();
            position.addPiece(new chess.Coord(0, 6), chess.Pieces.White.Pawn());
            
            var game = new chess.Game(position);

            game.begin();
            game.addPromotionMove(0, 6, 0, 7, chess.PieceType.Queen);
            game.end();

            var position1 = game.getPositionBefore(1);
            test.equals(chess.PieceType.Queen, position1.getPieceAt(0, 7).getType());

            test.done();
        }
    };
});    
