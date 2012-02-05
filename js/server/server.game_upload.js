define(function(require, exports, module){

    module.exports.display = function(request, response, mu) {

        mu.compile('game_upload.html.mu', function(err, parsed) {
            mu.render('game_upload.html.mu', {})
                .on('data', function(c) { response.write(c); })
                .on('end', function() { response.end();});
        });
    };

    var uploads = {};

    module.exports.getFilePercentage = function(request, response, uploadId) {
        response.writeHead(200, {'content-type': 'application/json'});
        response.end(JSON.stringify({ percent: uploads[uploadId] }));
    }

    module.exports.handleFile = function(request, response, connectionOptions) {

        var forms   = require('formidable')
          , util    = require('util')
          , fs      = require('fs')
          ,  _              = require('underscore')
          , pgn             = require('common/susu-chess-game-notataion-parser')
          , pgnFile         = require('common/susu-chess-file-pgn-games-reader')
          , chess           = require('common/susu-chess')
          , chessDomain     = require('common/susu-chess-domain')
          , chessRepository = require('common/susu-chess-mongo-repository')
          , Lazy            = require('lazy')
          , spawn = require('child_process').spawn

        var form = new forms.IncomingForm();
        form.parse(request, function(err, fields, files) {

            var uploadId = Math.round((Math.random() * 1000000000000));

            response.writeHead(200, {'content-type': 'text/plain'});
            response.end(JSON.stringify({uploadId: uploadId}));

            var file = files.myFile;
            var path = file.path;

            Lazy(spawn('node', ['upload-pgn.node.js', path]).stdout).lines.map(String)
                .forEach(function(line) {
                    console.log(line);
                    uploads[uploadId] = parseInt(line);
                });


        });
    };

});