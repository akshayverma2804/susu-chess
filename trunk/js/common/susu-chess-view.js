define(function(require, exports, module)
{
    var
        $       = require("jquery"),
        _       = require("underscore"),
        chess   = require("common/susu-chess"),
        Class   = require("class");

    
    var BoardView = module.exports.BoardView = Class.extend({

        init: function(rootElement, options)
        {
            this.options = _.defaults(_.isUndefined(options) ? {} : options,
            {
                size: 40
            });
            this.rootElement = rootElement;
            
            this.rootElement.addClass('chess-board');

            this.width = this.rootElement.width();
            this.height = this.rootElement.height();
            this._fillBoardSquares();

            this.cells = _.map(_.range(8),
                function() {
                    return _.map(_.range(8),
                        function()
                        {
                            return null;
                        })
                });
        },

        clear: function()
        {
            for (var file = 0; file < 8; file++)
                for (var rank = 0; rank < 8; rank++)
                {
                    if (this.cells[file][rank])
                        this.cells[file][rank].remove();
                    this.cells[file][rank] = null;
                }
        },

        _getTopByRank: function(rank)
        {
            return (7 - rank) * this.options.size + (this.options.size / 2);
        },

        _getLeftByFile: function(file)
        {
            return file * this.options.size + (this.options.size / 2);
        },

        _putElementAt: function(file, rank, element)
        {
            element.css("top", this._getTopByRank(rank));
            element.css("left", this._getLeftByFile(file));
            element.css("width", this.options.size);
            element.css("height", this.options.size);
        },

        removePiece: function(file, rank)
        {
            var piece = this.cells[file][rank];
            this.cells[file][rank] = null;
            piece.animate({
                opacity: 0
            }, "fast", "linear", function() {
                piece.remove();
            }.bind(this));
        },

        movePiece: function(sourceFile, sourceRank, targetFile, targetRank)
        {
            var piece = this.cells[sourceFile][sourceRank];
            piece.animate({
                top: this._getTopByRank(targetRank),
                left: this._getLeftByFile(targetFile)
            }, "fast");

            this.cells[sourceFile][sourceRank] = null;
            this.cells[targetFile][targetRank] = piece;
        },

        _getPieceClass: function(pieceType)
        {
            switch (pieceType)
            {
                case chess.PieceType.Pawn:
                    return "pawn";
                break;
                case chess.PieceType.Rook:
                    return "rook";
                break;
                case chess.PieceType.Bishop:
                    return "bishop";
                break;
                case chess.PieceType.Knight:
                    return "knight";
                break;
                case chess.PieceType.Queen:
                    return "queen";
                break;
                case chess.PieceType.King:
                    return "king";
                break;
            }
        },

        addPiece: function(file, rank, pieceType, chessColor)
        {
            var piece = $('<div></div>');
            piece.addClass("piece");

            piece.addClass(this._getPieceClass(pieceType));

            if (chessColor == chess.ChessColor.White)
                piece.addClass("white");
            else
                piece.addClass("black");
            
            this._putElementAt(file, rank, piece);
            this.cells[file][rank] = piece;
            this.rootElement.append(piece);
        },

        _fillBoardSquares: function()
        {
            var square;
            for (var rank = 0; rank < 8; rank++)
            {
                square = $('<div></div>');
                square.css("position", "absolute");
                square.css("padding-top", "10px");
                square.css("padding-left", "5px");
                square.css("z-index", "2");
                square.css("top", this._getTopByRank(rank));
                square.css("left", 0);
                square.css("width", this.options.size / 2);
                square.css("height", this.options.size);
                square.html((rank + 1).toString());
                
                this.rootElement.append(square);
            }

            for (var file = 0; file < 8; file++)
            {
                square = $('<div></div>');
                square.css("position", "absolute");
                square.css("padding-left", "15px");
                square.css("z-index", "1");
                square.css("top", 0);
                square.css("left", this._getLeftByFile(file));
                square.css("width", this.options.size);
                square.css("height", this.options.size / 2);
                square.html("abcdefgh".charAt(file));

                this.rootElement.append(square);
            }

            for (file = 0; file < 8; file++)
                for (rank = 0; rank < 8; rank++)
                {
                    square = $('<div></div>');
                    square.addClass("square");
                    if ((rank + file) % 2 == 0)
                        square.addClass("black");
                    else
                        square.addClass("white");

                    this._putElementAt(file, rank, square);

                    this.rootElement.append(square);
                }
        }
        
    });

    var BoardViewToGameContextAdapter = module.exports.BoardViewToGameContextAdapter = Class.extend({
        //Implements: [common.IGameContext],

        init: function(boardView)
        {
            this.boardView = boardView
        },

        setEnPassantTargetCoord: function() { },

        removePiece: function(coord)
        {
            this.boardView.removePiece(
                coord.file,
                coord.rank);
        },

        addPiece: function(coord, piece)
        {
            this.boardView.addPiece(
                coord.file,
                coord.rank,
                piece.getType(),
                piece.getColor());
        },

        movePiece: function(source, target)
        {
            this.boardView.movePiece(
                source.file,
                source.rank,
                target.file,
                target.rank);
        }
    });
});