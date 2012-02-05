define(function(require, exports, module)
{
    require("knockout");
    var
        $           = require("jquery"),
        Class       = require("class"),
        chess       = require("common/susu-chess"),
        chessDomain = require("common/susu-chess-domain"),
        chessView   = require("common/susu-chess-view"),
        _           = require("underscore"),
        viewModels  = require('client/game_view_models');


    var PageViewModel = Class.extend({
        init: function() {
            this.game = this._createGame();
            this.gameInfo = new chessDomain.Game();
            this.gameInfo.fromJSON(gameJSON);
            this.gameViewModel = ko.observable(new viewModels.GameViewModel(this.game, this.gameInfo));
        },

        _createGame: function() {
            var position = chess.createDefaultGamePosition();
            var game = new chess.Game(position);
            game.loadFromJSON(gameJSON);
            return game;
        },

        load: function()
        {
            this.gameViewModel().load();
        }
    });


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
        pageViewModel = new PageViewModel();
        ko.applyBindings(pageViewModel);

        var boardView = viewModels.boardView = new chessView.BoardView($('div.board'));
        var boardViewGameContext = viewModels.boardViewGameContext = new chessView.BoardViewToGameContextAdapter(boardView);

        pageViewModel.load();

    });
});