define(function(require, exports, module)
{
    var
        _   = require("underscore"),
        pgn = require('common/susu-chess-game-notataion-parser');

    var LF = "\n";

    module.exports.PgnParserTests = {

        setUp: function(done) {
            done();
        },

        testStringPgnReader: function(test) {
            var pgnText =
                '[Event "?"]' + LF +
                '[Site "corr CS ch xx (FS"] + newLine' + LF +
                '[Date "????.??.??"]' + LF +
                '[Round "1024"]' + LF +
                '[White "Pecenka X"]' + LF +
                '[Black "Nun J"]' + LF +
                '[Result "1-0"]' + LF +
                '[ECO "A67/01"]' + LF +
                '' + LF +
                '1.d4 Nf6 2.c4 c5 3.d5 e6 4.Nc3 exd5' + LF +
                '5.cxd5 d6 6.e4 g6 7.f4 Bg7 8.Bb5+ Nfd7' + LF +
                '9.a4 Qh4+ 10.g3 Qe7 11.Nf3 O-O 12.O-O Na6' + LF +
                '13.e5 Nb4 14.Ne4 dxe5 15.d6 Qd8 16.fxe5 Nc6' + LF +
                '17.Bg5 Qb6 18.Nf6+ Kh8 19.Nd5 Qa5 20.Nd2 Ndxe5' + LF +
                '21.Nb3 Bg4 22.Qc1 Nf3+ 23.Rxf3 Bxf3 24.Nxa5 Bxd5' + LF +
                '25.Nxc6 bxc6 26.Qxc5  1-0' + LF +
                '' + LF +
                '[Event "?"]' + LF +
                '[Site "corr EU ch 26 (FS"]' + LF +
                '[Date "????.??.??"]' + LF +
                '[Round "1536"]' + LF +
                '[White "Vefling G"]' + LF +
                '[Black "Taschruschin W"]' + LF +
                '[Result "0-1"]' + LF +
                '[ECO "A77/05"]' + LF +
                '' + LF +
                '1.d4 Nf6 2.c4 e6 3.Nf3 c5 4.d5 exd5' + LF +
                '5.cxd5 d6 6.Nc3 g6 7.e4 Bg7 8.Be2 O-O' + LF +
                '9.O-O Re8 10.Nd2 Nbd7 11.a4 Ne5 12.Qc2 g5' + LF +
                '13.Ra3 g4 14.b3 a6 15.a5 Nh5 16.Nc4 Qf6' + LF +
                '17.Nd1 Nf3+ 18.gxf3 gxf3 19.Bxf3 Qxf3 20.b4 Qxe4' + LF +
                '21.Qxe4 Rxe4 22.Nxd6 Rxb4 23.Re1 Bd7 24.Ne3 Bf8' + LF +
                '25.Nef5 Rg4+ 26.Kh1 Rg6 27.Rf3 Bxd6 28.Nh6+ Rxh6' + LF +
                '29.Bxh6 f6 30.Bd2 Rd8 31.Bc3 Kf7 32.Re4 Rg8' + LF +
                '33.Bb2 Rg5  0-1' + LF;


            var splitter = new pgn.StringPgnGamesReader(pgnText);
            splitter.readGames().join(function(items)
            {
                test.equals(2, items.length);
                test.done();
            });
        },

        testPgnParser: function(test) {
            var pgnText =
               '[Event "?"]' + LF +
               '[Site "corr CS ch xx (FS"] + newLine' + LF +
               '[Date "????.??.??"]' + LF +
               '[Round "1024"]' + LF +
               '[White "Pecenka X"]' + LF +
               '[Black "Nun J"]' + LF +
               '[Result "1-0"]' + LF +
               '[ECO "A67/01"]' + LF +
               '' + LF +
               '1.d4 Nf6' + LF +
               '2.c4 1-0' + LF;

            var parser = new pgn.PortableGameNotationParser();

            var gameInfo = parser.parse(pgnText);

            test.equals('1.d4 Nf6 2.c4 1-0', gameInfo.getGameNotation());
            test.equals('1024', gameInfo.getProperty('Round'));

            test.done();
        },

        testPgnParser_Regression1: function(test) {
            var pgnText =
            '[Event "It"]' + LF +
            '[Site "Barmen (Germany)"]' + LF +
            '[Date "1905.??.??"]' + LF +
            '[Round "?"]' + LF +
            '[White "Caro H"]' + LF +
            '[Black "Nimzowitsch Aaron"]' + LF +
            '[Result "1-0"]' + LF +
            '[ECO "A56/01"]' + LF +
            '' + LF +
            '1.c4 c5 2.Nc3 g6 3.e3 Bg7 4.Nf3 Nf6' + LF +
            '5.d4 cxd4 6.exd4 O-O 7.Be2 Nc6 8.d5 Nb8' + LF +
            '9.Be3 d6 10.Qd2 Ng4 11.Bf4 Qb6 12.O-O Nd7' + LF +
            '13.Ng5 Ndf6 14.h3 Nh6 15.Be3 Qd8 16.Ne6 fxe6 ' + LF +
            '17.Bxh6 e5 18.Bxg7 Kxg7 19.f4 Qb6+ 20.Kh2 e4 ' + LF +
            '21.Rae1 h5 22.Bd1 Bf5 23.Qf2 Qb4 24.Qe2 Rfc8 ' + LF +
            '25.Bb3 a5 26.Qd1 a4 27.Nxa4 Rxa4 28.Bxa4 Rxc4 ' + LF +
            '29.Bb3 Rd4 30.Qc1 Nxd5 31.Rd1 Nb6 32.Qc7 Bd7 ' + LF +
            '33.Qd8 d5 34.Rxd4 Qxd4 35.Qxe7+ Kh8 36.Rd1  1-0' + LF;

            var parser = new pgn.PortableGameNotationParser();

            var gameInfo = parser.parse(pgnText);

            test.equals('1.c4 ', gameInfo.getGameNotation().substr(0, 5));
            test.equals('It', gameInfo.getProperty('Event'));

            test.done();
        }
    }
});