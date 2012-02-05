define(function(require, exports, module){

    var
        _           = require("underscore"),
        chessDomain = require("common/susu-chess-domain"),
        Class       = require("class"),
        events      = require("microevent"),
        history     = require("history"),
        $           = require("jquery");

    module.exports.boardView = null;
    module.exports.boardViewGameContext = null;

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

    var MoveViewModel = module.exports.MoveViewModel = Class.extend({
        /**
         * @param {chess.Move} move
         */
        init: function(move, halfMoveIndex) {
            this.move = move;
            this.caption = ko.observable(move.getCaption());
            this.halfMoveIndex = ko.observable(halfMoveIndex);
            this.moveIndex = ko.observable(halfMoveIndex / 2 + 1);
            this.moveIndexVisible = ko.observable(halfMoveIndex % 2 == 0);
        },

        getMove: function(){
            return this.move;
        },

        activate: function() {
            FillBoardByPosition(module.exports.boardView, this.move.initialPosition);
            this.move.execute(module.exports.boardViewGameContext);
            this.trigger('onActivate', this);
        },

        onActivate: function(callback){
            this.bind('onActivate', callback);
        },

        onClick: function() {
            $.history.load(this.halfMoveIndex());
            //FillBoardByPosition(module.exports.boardView, this.move.initialPosition);
            //this.move.execute(module.exports.boardViewGameContext);
            //this.trigger('onActivate', this);
        }
    });
    events.mixin(MoveViewModel);

    var BeginGameMoveViewModel = Class.extend({
        init: function() {
            this.caption = ko.observable('Begin');
            this.halfMoveIndex = ko.observable(-1);
            this.moveIndex = ko.observable(0);
            this.moveIndexVisible = ko.observable(true);
        },

        getMove: function(){
            return null;
        },

        activate: function() {
            //FillBoardByPosition(module.exports.boardView, this.move.initialPosition);
            this.trigger('onActivate', this);
        },

        onActivate: function(callback){
            this.bind('onActivate', callback);
        },

        onClick: function() {
            $.history.load('begin');
            //this.trigger('onActivate', this);
        }

    });
    events.mixin(BeginGameMoveViewModel);

    var GameInfoViewModel = Class.extend({

        init: function(game, moveIndex){
            this.white = ko.observable(game.white());
            this.black = ko.observable(game.black());
            this.id = ko.observable(game.id());
            this.moveIndex = ko.observable(moveIndex);
        }

    });

    var MoveStatItemViewMovel = Class.extend({

        init: function(move, whiteScore, blackScore) {
            this.move = move;
            this.moveCaption = ko.observable(move.getCaption());
            this.whiteScore = ko.observable(whiteScore);
            this.blackScore = ko.observable(blackScore);
        }

    });

    function roundNumber(num, dec) {
    	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
    	return result;
    }

    var GameViewModel = module.exports.GameViewModel = Class.extend({
        init: function(game, gameInfo)
        {
            this.game = game;
            this.gameInfo = gameInfo;
            this.moves = ko.observableArray([]);
            var moveViewModel = new BeginGameMoveViewModel();
            moveViewModel.onActivate(function(move) { this._activeMoveChanged(move); }.bind(this));
            this.moves.push(moveViewModel);
            this.samePositionGames = ko.observableArray([]);

            this.nextMoveStatItems = ko.observableArray([]);
            this.activeMoveIndex = 0;

            var index = 0;
            _.each(this.game.getHalfMoves(), function(halfMove) {
                var moveViewModel = new MoveViewModel(halfMove, index++);
                moveViewModel.onActivate(function(move) { this._activeMoveChanged(move) }.bind(this));
                this.moves.push(moveViewModel);
            }.bind(this));

        },

        gotoBegin: function(){
            $.history.load('begin');
        },

        gotoNextMove: function(){
            $.history.load((this.activeMoveIndex + 1).toString());
        },
        gotoPrevMove: function(){
            if (this.activeMoveIndex == 0)
                $.history.load('begin');
            else
                $.history.load((this.activeMoveIndex - 1).toString());
        },
        gotoEnd: function(){
            $.history.load((this.moves().length - 2).toString());
        },

        load: function()
        {
            $.history.init(function(hash) { this._loadContent(hash); }.bind(this));
        },


        _loadContent: function(hash){
            if (hash == "" || hash == "begin" || (parseInt(hash) < 0))
            {
                FillBoardByPosition(module.exports.boardView, this.moves()[1].getMove().getPositionBefore());
                this.moves()[0].activate();
                this.activeMoveIndex = -1;

                document.title = 'Begin: ' + this.gameInfo.white() + '-' + this.gameInfo.black();
            }
            else
            {
                var halfMoveIndex = parseInt(hash);
                this.moves()[halfMoveIndex + 1].activate();
                this.activeMoveIndex = halfMoveIndex;
                document.title = 'Move #' + (halfMoveIndex + 1).toString() + ' (' + this.moves()[halfMoveIndex + 1].getMove().getCaption() + '): ' + this.gameInfo.white() + '-' + this.gameInfo.black();
            }
        },

        _loadMoveStat: function(move){

            var nextMove =_.indexOf(this.moves(), move) + 1;
            var currentPosition;
            if (nextMove >= (this.moves().length))
                currentPosition = move.getMove().getPositionBefore();
            else if (nextMove == 1)
                currentPosition = (this.moves()[nextMove]).getMove().getPositionBefore();
            else
                currentPosition = (this.moves()[nextMove]).getMove().getPositionBefore();

            var fen = currentPosition.toFEN(false);

            $.getJSON('/json/games/movestat/fen/' + encodeURIComponent(fen), {}, function(data)
            {
                var moves = [];
                this.nextMoveStatItems.removeAll();

                for (var i = 0; i < data.moves.length; i++) {

                    var moveJson = data.moves[i]._id;
                    var domainMove = new chessDomain.Move();
                    domainMove.fromJSON(moveJson);

                    var move = domainMove.createMove(currentPosition);

                    this.nextMoveStatItems.push(new MoveStatItemViewMovel(
                        move,
                        roundNumber(data.moves[i].value.whiteWinPercentage * 100, 2),
                        roundNumber(data.moves[i].value.blackWinPercentage * 100, 2)
                    ));
                }

            }.bind(this));
        },

        _loadSamePositionGames: function(move) {
            var nextMove =_.indexOf(this.moves(), move) + 1;
            var fen;
            if (nextMove >= (this.moves().length))
                fen = move.getMove().getPositionBefore().toFEN(false);
            else if (nextMove == 1)
                fen = (this.moves()[nextMove]).getMove().getPositionBefore().toFEN(false);
            else
                fen = (this.moves()[nextMove]).getMove().getPositionBefore().toFEN(false);

            $.getJSON('/json/games/fen/' + encodeURIComponent(fen), {}, function(data)
            {
                var games = [];
                this.samePositionGames.removeAll();
                for (var i = 0; i < data.games.length; i++) {
                    var game = new chessDomain.Game();
                    game.fromJSON(data.games[i]);
                    games.push(game);
                    this.samePositionGames.push(new GameInfoViewModel(game, nextMove - 2));
                }
            }.bind(this));
        },

        _activeMoveChanged: function(move) {
            this._loadSamePositionGames(move);
            this._loadMoveStat(move);

        }
    });


});