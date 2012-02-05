define(function(require, exports, module)
{

    require("knockout");

    var
        $       = require("jquery"),
        _       = require("underscore"),
        chessView   = require("common/susu-chess-view"),
        chess   = require("common/susu-chess"),
        Class   = require("class"),
        viewModels = require('client/game_view_models');

    var PageViewModel = Class.extend({
        init: function() {
            this.game = this._createGame();
            this.gameViewModel = ko.observable(new viewModels.GameViewModel(this.game));
        },

        _createGame: function() {
            var position = chess.createDefaultGamePosition();
            var game = new chess.Game(position);
            var moveText = '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 c5 6.d5 O-O 7.Nf3 e6 8.Be2 exd5 9.cxd5 Bg4 10.O-O Nbd7 11.Re1 Re8 12.h3 Bxf3 13.Bxf3 a6 14.g4 h6 15.h4 b5 16.g5 hxg5 17.hxg5 Nh7 18.Kg2 Nb6 19.Rh1 Ra7 20.Ne2 Nc4 21.Rb1 Qa5 22.a3 b4 23.Qd3 Qb5 24.Rd1 Na5 25.Qxb5 axb5 26.axb4 cxb4 27.Be3 Raa8 28.b3 Rac8 29.Bb6 Nb7 30.Rbc1 Nf8 31.Bg4 Rxc1 32.Rxc1 Rxe4 33.Rc7 Nc5 34.Bxc5 dxc5 35.Kf3 Re8 36.Rxc5 Rb8 37.Ke4 f5 ';
            var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);
            restorer.restoreGame(game, moveText);
            return game;
        }

    });

    var pageViewModel = new PageViewModel();
    ko.applyBindings(pageViewModel);

    var boardView = viewModels.boardView = new chessView.BoardView($('div.board'));
    var boardViewGameContext = viewModels.boardViewGameContext = new chessView.BoardViewToGameContextAdapter(boardView);

});