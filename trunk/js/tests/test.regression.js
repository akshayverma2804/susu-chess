define(function(require, exports, module)
{
    var
        chess   = require("common/susu-chess");

    exports.GameRestorerRegressionTest = {
        setUp: function(done)
        {
            this.position = chess.createDefaultGamePosition();
            this.game = new chess.Game(this.position);
            this.restorer = new chess.GameRestorer(chess.AlgebraicNotationParser);
            done();
        },

        testRegression1: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 e6 3.Nf3 c5 4.d5 exd5 5.cxd5 d6 6.Nc3 g6 7.e4 Bg7 8.Be2 O-O 9.O-O Re8 10.Nd2 Nbd7 11.a4 Ne5 12.Qc2 g5 13.Ra3 g4 14.b3 a6 15.a5 Nh5 16.Nc4 Qf6 17.Nd1 Nf3+ 18.gxf3 gxf3 19.Bxf3 Qxf3 20.b4 Qxe4 21.Qxe4 Rxe4 22.Nxd6 Rxb4 23.Re1 Bd7 24.Ne3 Bf8 25.Nef5 Rg4+ 26.Kh1 Rg6 27.Rf3 Bxd6 28.Nh6+ Rxh6 29.Bxh6 f6 30.Bd2 Rd8 31.Bc3 Kf7 32.Re4 Rg8 33.Bb2 Rg5  0-1';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression2: function(test)
        {
            var moveText = '1.d4 Nf6 2.Nf3 c5 3.d5 e6 4.c4 d6 5.Nc3 exd5 6.cxd5 g6 7.g3 Bg7 8.Bg2 O-O 9.O-O Re8 10.Nd2 Nbd7 11.h3 Nb6 12.a4 Bd7 13.a5 Nc8 14.Nc4 Qc7 15.e4 b5 16.axb6 Nxb6 17.Na3 a6 18.Re1 Rab8 19.Kh2 Nc8 20.Bf1 Qb7 21.Qd3 Ra8 22.Qf3 h6 23.Nc4 Bb5 24.Na5 Qd7 25.Bxh6 Bxh6 26.Qxf6 Bg7 27.Qf3 Nb6 28.Kg2 Na4 29.Nxa4 Bxa4 30.Nc4 Rab8 31.Nxd6 Qxd6 32.Rxa4 Rxb2 33.Rxa6 Qe5 34.Re2 Rxe2 35.Qxe2 Qxe4+ 36.Qxe4 Rxe4 37.Ra8+ Bf8 38.Kf3 Rd4 39.Rd8 Kg7 40.Ke3 f5 41.Bd3 Be7 42.Rd7 Kf8 43.f4 Ke8 44.Bb5 Kf8 45.h4 Re4+ 46.Kf3 Rd4 47.Ke3 Re4+ 48.Kd3 Rd4+ 49.Kc2 Rb4 50.d6 Bxh4 51.gxh4 Rxb5 52.Re7 Rb4 53.h5 gxh5 54.Re5 Rd4 55.Rxf5+ Kg7 56.Rxh5 Rxd6 57.Rxc5 Rd4 58.Rf5 Kg6 59.Rf8 Kg7 60.Kc3 Ra4  1/2-1/2';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression3: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 c5 3.d5 e5 4.Nc3 d6 5.e4 g6 6.f4 exf4 7.Bxf4 Bg7 8.Qa4+ Bd7 9.Qb3 Bc8 10.Qb5+ Kf8 11.Be2 Na6 12.Qb3 Nc7 13.Nf3 h6 14.Bxd6+ Qxd6 15.e5 Qd8 16.exf6 Bxf6 17.O-O Kg7 18.Ne4 Re8 19.Bd3 b6 20.Rae1 Bg4 21.Nxf6 Qxf6 22.Ne5 Bf5 23.Qc3 b5 24.b3 Rxe5 25.Rxe5 Re8 26.d6 Qxe5 27.Qxe5+ Rxe5 28.Bxf5 gxf5 29.dxc7 Re8 30.Rxf5 bxc4 31.Rxc5 Rc8 32.Rxc4 Kf8 33.Rc6 Ke8 34.h4 h5 35.Rc5 Kd7 36.Rxh5 Rxc7 37.Ra5 Ke7 38.Ra6 Kf8 39.Kh2 Kg7 40.Kh3 Rd7 41.b4 Rd3+ 42.g3 Rd7 43.b5 Rd5 44.Rxa7 Rxb5 45.a4 Rb4 46.a5 Ra4 47.a6 Kg6 48.Ra8 Kf6 49.h5 Kg7 50.g4 Kh7 51.a7 Kg7 52.Kg3 Kh7 53.Kf3 Kg7 54.g5 Kh7 55.h6 Ra6 56.Kf4 Ra5 57.Kg4 Ra1 58.Kf5 Rf1+ 59.Ke5 Re1+ 60.Kf6 Re8 61.Rb8 Rxb8 62.axb8B Kg8 63.Bd6  1-0';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression4: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 c5 3.d5 d6 4.Nc3 e6 5.Nf3 exd5 6.cxd5 g6 7.Nd2 Na6 8.Nc4 Nc7 9.a4 b6 10.e4 Ba6 11.Bg5 h6 12.Bh4 Bxc4 13.Bxc4 Bg7 14.O-O O-O 15.f4 Qd7 16.e5 Nh7 17.e6 fxe6 18.dxe6 Nxe6 19.Qg4 Rfe8 20.Qxg6 Nf8 21.Qh5 Kh7 22.f5 Bd4+ 23.Kh1 Ng7 24.Qf3 a6 25.f6 Nfe6 26.f7 Red8 27.Bd3+  1-0';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression5: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.f4 c5 6.d5 O-O 7.Nf3 e6 8.Be2 exd5 9.cxd5 Bg4 10.O-O Nbd7 11.Re1 Re8 12.h3 Bxf3 13.Bxf3 a6 14.g4 h6 15.h4 b5 16.g5 hxg5 17.hxg5 Nh7 18.Kg2 Nb6 19.Rh1 Ra7 20.Ne2 Nc4 21.Rb1 Qa5 22.a3 b4 23.Qd3 Qb5 24.Rd1 Na5 25.Qxb5 axb5 26.axb4 cxb4 27.Be3 Raa8 28.b3 Rac8 29.Bb6 Nb7 30.Rbc1 Nf8 31.Bg4 Rxc1 32.Rxc1 Rxe4 33.Rc7 Nc5 34.Bxc5 dxc5 35.Kf3 Re8 36.Rxc5 Rb8 37.Ke4 f5 38.gxf6 Bxf6 39.Nd4 Re8+ 40.Ne6 Bc3 41.Rxb5 Nxe6 42.Bxe6+ Kf8 43.Kf3 Ke7 44.Rb7+ Kd6 45.Ke4 Bd2 46.Rd7+ Kc5 47.Rc7+ Kd6 48.Rc2 Bc3 49.Rg2  1-0';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression6: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 e6 3.Nf3 c5 4.d5 d6 5.Nc3 exd5 6.cxd5 g6 7.Nd2 Bg7 8.Nc4 O-O 9.Bg5 Qe7 10.Qd2 Bd7 11.a4 Na6 12.f3 Nb4 13.e4 h6 14.Bf4 Ne8 15.Be2 g5 16.Be3 f5 17.O-O f4 18.Bf2 b6 19.Rfe1 h5 20.e5 Bxe5 21.Nxe5 dxe5 22.d6 Qxd6 23.Bc4+ Kg7 24.Rad1 Qxd2 25.Rxd2 Bf5 26.Rxe5 Nc6 27.Ree2 Nf6 28.Nb5 Rad8 29.Nd6 Bg6 30.Bb5 Na5 31.Re7+ Kh6 32.Re6 h4 33.Rde2 Kh5 34.g4 fxg3 35.hxg3 Nd5 36.g4 Kh6 37.Bd3 Rf6 38.Rxf6 Nxf6 39.Re6 Bxd3 40.Nf7+ Kg7 41.Nxd8 Nd5 42.Be3 Nxe3 43.Rxe3 Bc2 44.Re7+ Kf6 45.Rxa7 Bxa4 46.Ra6 Bd1 47.Rxb6+ Ke7 48.Nc6+ Nxc6 49.Rxc6 Bxf3 50.Rxc5 Bxg4 51.Rxg5 Bd7+ 52.Rh5 h3 53.Rh7+ Kd6 54.Kf2 Bc8 55.Ke3 Kc6 56.Rh5 Kb6 57.Kd4 Bg4 58.Rh4 Bc8+ 59.Kc4 Ba6+ 60.Kb4 Bf1 61.Rh6+ Kc7 62.Kc5 Kd7 63.b4 Bg2 64.b5 Ke7 65.Rh7+ Kd8 66.Kb6 Bf1 67.Rh5 Kd7 68.Ka7 h2 69.b6  1-0';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        },

        testRegression7: function(test)
        {
            var moveText = '1.d4 Nf6 2.c4 c5 3.d5 d6 4.Nc3 Bf5 5.Nf3 h6 6.g3 Qd7 7.Bg2 Bh3 8.O-O Bxg2 9.Kxg2 g5 10.e4 Bg7 11.Ne1 Na6 12.Nd3 Ng4 13.a3 Ne5 14.Nxe5 Bxe5 15.f4 gxf4 16.Bxf4 Bxc3 17.bxc3 f6 18.Rf2 h5 19.h3 O-O-O 20.a4 Rdg8 21.Rb1 Kc7 22.Rfb2 Rb8 23.Rb5 h4 24.g4 Rhg8 25.Kh1 Kc8 26.a5 Nc7 27.R5b2 Na8 28.Ra1 b5 29.Rab1 a6 30.Qe2 Nc7 31.cxb5 axb5 32.Ra1 Ra8 33.Rba2 Ra6 34.Be3 Kb7 35.Bf2 Rh8 36.Qf3 Raa8 37.Kg2 Ka6 38.Rd2 Rag8 39.Qf5 Qxf5 40.exf5 Rh7 41.Kf3 Rb8 42.Ke4 Rb7 43.Rb2 Rh8 44.Be1 Rhb8 45.Raa2 Ka7 46.Ra1 Na6 47.Rab1 c4 48.Rh2 Nc5+ 49.Kf3 Rh8 50.Ra1 Ka6 51.Rg2 Na4 52.g5 fxg5 53.Rxg5 Rh7 54.Kg4 Kxa5 55.Bxh4 Kb6 56.Bf2+ Kc7 57.Bd4 Nc5 58.Re1 Nd3 59.Ra1 Nc5 60.Ra8 Rb8 61.Rxb8 Kxb8 62.h4 Kc7 63.h5 Kd7 64.Rg8 Na6 65.Kg5 Nc7 66.Kg6 Rxh5 67.Kxh5 Nxd5 68.Rb8 Kc6 69.Kg5 Nc7 70.Kf4 Kd5 71.Rb7 Kc6 72.Rb8 Kd5 73.Rc8 e5 74.fxe6+ Nxe6+ 75.Ke3 Nxd4 76.cxd4 b4 77.Rb8 b3 78.Rb4 Kc6 79.Rxc4+ Kb5 80.Rc8  1-0';

            this.restorer.restoreGame(this.game, moveText);

            test.done();
        }

    };

});