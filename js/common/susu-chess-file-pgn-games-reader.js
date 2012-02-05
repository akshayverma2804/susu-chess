define(function(require, exports, module)
{
    var _       = require("underscore")
      , pgn     = require('common/susu-chess-game-notataion-parser')
      , Class   = require("class")

    module.exports.FilePgnGamesReader = pgn.PgnGamesReader.extend({

        init: function(filePath)
        {
            this.filePath = filePath;
        },

        readGames: function()
        {
            var lazy = require('lazy');
            var result = new lazy();
            var fs = require('fs');
            var stream = fs.createReadStream(this.filePath);

            var i = 0;
            var game = '';
            var isNotationSection = false;

            stream.on('end', function()
            {
                if (game.trim() != '')
                    result.emit('data', game);
                result.emit('end');
            }.bind(this));

            new lazy(stream)
                .lines
                .forEach(function(lineObject)
                {
                    var line = lineObject != 0 ? lineObject.toString() : "";
                    if (isNotationSection)
                    {
                        if ((/\[.*?\]/i).test(line) || line.trim() == '')
                        {
                            result.emit('data', game.trim());
                            game = '';
                            game += line + "\n";
                            isNotationSection = false;
                        }
                        else
                        {
                            game += line + "\n";
                        }
                    }
                    else
                    {
                        if ((/\[.*?\]/i).test(line) || line.trim() == '')
                        {
                            game += line + "\n";
                        }
                        else
                        {
                            isNotationSection = true;
                            game += line + "\n";
                        }
                    }
                }.bind(this));
            return result;
        }
    });

});