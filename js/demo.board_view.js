define(function(require) {

    var
        $           = require("jquery"),
        Class       = require("class"),
        chess       = require("common/susu-chess"),
        chessView   = require("common/susu-chess-view"),
        _           = require("underscore");

    function FillBoardByPosition(boardView, position)
    {
        boardView.clear();
        var pieces = position.getPieces();
        _.each(pieces, function(piece)
        {
            var coord = position.getPieceCoord(piece);
            boardView.addPiece(coord.file, coord.rank, piece.getType(), piece.getColor());

        });
    }

    $(function()
    {
        var boardView = new chessView.BoardView($("#board"));
        var boardViewGameContext = new chessView.BoardViewToGameContextAdapter(boardView);
        var position = new chess.createDefaultGamePosition();
        //var position = new chess.createEmptyGamePosition();

        //position.addPiece(0, 0, new chess.Piece(chess.PieceType.Rook, chess.ChessColor.White));
        //position.addPiece(4, 0, new chess.Piece(chess.PieceType.King, chess.ChessColor.White));

        var game = new chess.Game(position);
        /* game.begin();
        game.addCastlingHalfMove(chess.CastlingType.Long);
        game.end(); */

        var moveText = '1.d4 Nf6 2.c4 c5 3.d5 d6 4.Nc3 e6 5.Nf3 exd5 6.cxd5 g6 7.Nd2 Na6 8.Nc4 Nc7 9.a4 b6 10.e4 Ba6 11.Bg5 h6 12.Bh4 Bxc4 13.Bxc4 Bg7 14.O-O O-O 15.f4 Qd7 16.e5 Nh7 17.e6 fxe6 18.dxe6 Nxe6 19.Qg4 Rfe8 20.Qxg6 Nf8 21.Qh5 ';
        $('#moveText').val(moveText);
        var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);
        restorer.restoreGame(game, moveText);

        var currentMove = 0;
        FillBoardByPosition(boardView, game.getPositionBefore(currentMove));

        $('#prev-move').click(function(event) {
            game.getHalfMoveAt(currentMove - 1).rollback(boardViewGameContext);
            currentMove--;
        });

        $('#next-move').click(function(event) {
            game.getHalfMoveAt(currentMove).execute(boardViewGameContext);
            currentMove++;
        });

        $('#check-position').click(function(event) {
            FillBoardByPosition(boardView, game.getPositionBefore(currentMove));
        });


    });

});