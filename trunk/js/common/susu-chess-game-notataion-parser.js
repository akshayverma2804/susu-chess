define(function(require, exports, module)
{
    var
        chess,
        _       = require("underscore"),
        events  = require("microevent"),
        Class  = require("class"),
        Lazy  = require("lazy");

    var PgnGamesReader = module.exports.PgnGamesReader = Class.extend({
        readGames: function()
        { }
    });

    var StringPgnGamesReader = module.exports.StringPgnGamesReader = PgnGamesReader.extend({

        init: function(pgnString)
        {
            this.pgnString = pgnString;
        },

        readGames: function()
        {
            var result = new Lazy();

            setTimeout(function() {
                var game = '';
                var isNotationSection = false;
                var lines = this.pgnString.split("\n");
                lines.push(null);

                _.each(lines, function(line)
                {
                    if (line == null){
                        result.end();
                    }
                    else if (isNotationSection)
                    {
                        if ((/\[.*?\]/i).test(line) || line.trim() == '')
                        {
                            var g = game.trim();
                            result.push(g);
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
            }.bind(this), 1);

            return result;
        }

    });

    var GameInfo = module.exports.GameInfo = Class.extend({

        init: function(gameNotation)
        {
            this.gameNotation = gameNotation;
            this.properties = {};
        },

        setProperty: function(name, value)
        {
            this.properties[name] = value;
        },

        getProperty: function(name)
        {
            return this.properties[name];
        },

        getGameNotation: function()
        {
            return this.gameNotation;
        },

        setGameNotation: function(value)
        {
            this.gameNotation = value;
        }
    });

    var PortableGameNotationParser = module.exports.PortableGameNotationParser = Class.extend({

        parse: function(pgnText)
        {
            var result = new GameInfo('');
            var lines = pgnText.split("\n");

            var completed = false;
            var isNotationSection = false;

            _.each(lines, function(line)
            {
                if (completed)
                    return ;

                if (isNotationSection) {
                    if ((/\[.*?\]/i).test(line) || line.trim() == '') {
                        completed = true;
                    }
                    else {
                        result.setGameNotation(result.getGameNotation() + " " + line);
                    }
                }
                else
                {
                    if ((/\[.*?\]/i).test(line))
                    {
                        var propertyMatch = (/\[(.*?)"(.*?)"\]/i).exec(line);
                        result.setProperty(propertyMatch[1].trim(), propertyMatch[2].trim());
                        // set property
                    }
                    else if (!(line.trim() == ''))
                    {
                        result.setGameNotation(line);
                        isNotationSection = true;
                    }
                }
            }.bind(this));


            return result;
        }
    });

    var GamesLoader = module.exports.GamesLoader = Class.extend({

        init: function(reader) {
            this.reader = reader;
        },

        load: function() {
            var result = new Lazy();
            var parser = new PortableGameNotationParser();
            var restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);

            this.reader.readGames().forEach(function(gameText)
            {
                var gameInfo = parser.parse(gameText);
                var position = chess.createDefaultGamePosition();
                var game = new chess.Game(position);
                restorer.restoreGame(game, gameInfo.getGameNotation());
                result.push({ gameInfo: gameInfo, game: game });
            }.bind(this))
            .finish(function(){
                result.end();
            });
            return result;
        }
    });

    chess = require('./susu-chess');
});