define(function(require, exports, module){

    var $               = require("jquery")
      , ui              = require('jquery-ui')
      , _               = require("underscore")
      , StringPgnGamesReader  = require("common/susu-chess-game-notataion-parser").StringPgnGamesReader

    $(function() {
        var dropBox = $('div.pgn-drag-drop-zone');
        var fileList = $('div.pgn-drag-drop-zone ul.file-list');

        function AppendFiles(files) {

            AppendFile(files[0]);
        }

        function AppendFile(file) {

            var fileItem = $('<li>');
            fileItem.addClass('file-item');
            fileItem.append($('<div>').addClass('image'));
            fileItem.append($('<div>').addClass('text').html(file.name));
            fileItem.append($('<div>').addClass('status').html('Ready to upload'));
            fileItem.append($('<div>').addClass('upload-progress'));
            fileItem.append($('<div>').addClass('progress'));
            fileItem.data('file', file);
            fileList.append(fileItem);

            fileItem.find('div.upload-progress').progressbar({value: 0});

            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {

                var pgnReader = new StringPgnGamesReader(event.target.result);
                var count = 0;
                pgnReader.onNextGame(function(game) {
                    count++;
                    if (game == null)
                        fileItem.html(fileItem.html() + ' (Game count: ' + count.toString() + ')');
                });
                pgnReader.beginRead();
            };
        }

        function UploadIntoDatabse(uploadId, item) {

            $.getJSON('/get/upload/percentage/' + uploadId, {}, function(data) {
                var percent = Math.round(data.percent);
                item.find('div.status').html('Loading into database: ' + percent.toString() + '%.');
                item.find('.upload-progress').progressbar("option", "value", percent);

                setTimeout(function() {
                    UploadIntoDatabse(uploadId, item);
                }, 1000);
            });

        }

        function UploadFile(file, url, item) {
            var reader = new FileReader();


            reader.onload = function() {
                var xhr = new XMLHttpRequest();
                item.find('div.status').html('Uploading: 0%.');

                xhr.upload.addEventListener("progress", function(e) {
                    if (e.lengthComputable) {
                        var progress = Math.round((e.loaded * 100) / e.total);
                        item.find('div.status').html('Uploading: ' + progress.toString() + '%.');
                        $(item).find('.progress').progressbar( "option", "value", progress );
                    }
                }, false);


                xhr.onreadystatechange = function ()
                {
                    if (this.readyState == 4) {
                        if(this.status == 200) {

                            item.find('div.status').html('Uploading: 100%.');
                            item.find('.upload-progress').progressbar("option", "value", 100);

                            var response = JSON.parse(this.responseText);
                            UploadIntoDatabse(response.uploadId, item);
                        }
                        else {
                            alert(this.status);
                        }
                    }
                };

                xhr.open("POST", url);
                var boundary = "1184049667376";

                // Устанавливаем заголовки
                xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);
                xhr.setRequestHeader("Cache-Control", "no-cache");

                // Формируем тело запроса
                var body = "--" + boundary + "\r\n";
                body += "Content-Disposition: form-data; name=\"myFile\"; filename=\"" + file.name + "\"\r\n";
                body += "Content-Type: application/octet-stream\r\n\r\n";
                body += reader.result + "\r\n";
                body += "--" + boundary + "--";

                /*var length = body.length;
                body =
                    'Content-Type: multipart/form-data; boundary=' + boundary + "\r\n" +
                    'Content-Length: ' + length.toString() + "\r\n" +
                    body;*/

                if(xhr.sendAsBinary) {
                    // только для firefox
                    xhr.sendAsBinary(body);
                }
                else {
                    // chrome (так гласит спецификация W3C)
                    xhr.send(body);
                }
            };
            // Читаем файл
            reader.readAsBinaryString(file);
        }

        dropBox.bind({
            dragenter: function(event) {
                $(this).addClass('highlighted');
                return false;
            },

            dragleave: function() {
                $(this).removeClass('highlighted');
                return false;
            },

            dragover: function() {
                return false;
            },

            drop: function(e) {
                $(this).removeClass('highlighted');
                e.preventDefault();
                var dt = e.originalEvent.dataTransfer;
                AppendFiles(dt.files);
                return false;
            }
        });

        $('#upload').click(function(event){
            fileList.find('li.file-item').each(function(index, item) {
                var file = $(item).data('file');
                UploadFile(file, '/post/upload', $(item));
            });
        });

    });


});
