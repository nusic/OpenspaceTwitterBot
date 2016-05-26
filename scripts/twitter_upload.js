if(process.argv.length != 4){
    throw new Error('Must provide 2 arguments: <media-type> <path-to-media>');
}

var bufferLength, filePath, finished, fs, oauthCredentials, offset, request, segment_index, theBuffer;

request = require('request');
fs = require('fs');

var config = require('./config.js');

mediaType = process.argv[2];
filePath = process.argv[3];
bufferLength = 100000;
theBuffer = new Buffer(bufferLength);
offset = 0;
segment_index = 0;
finished = 0;
oauthCredentials = config.twitter.credentials;

fs.stat(filePath, function(err, stats) {
    var formData, normalAppendCallback, options;

    formData = {
        command: "INIT",
        media_type: mediaType,
        total_bytes: stats.size
    };
    options = {
        url: 'https://upload.twitter.com/1.1/media/upload.json',
        oauth: oauthCredentials,
        formData: formData
    };

    normalAppendCallback = function(media_id) {
        return function(err, response, body) {

            finished++;
            if (finished === segment_index) {

                options.formData = {
                    command: 'FINALIZE',
                    media_id: media_id
                };
                request.post(options, function(err, response, body) {
                    console.log('FINALIZED',response.statusCode);
                    console.log(body);

                    delete options.formData;

                    //Note: This is not working as expected yet.
                    options.qs = {
                        command: 'STATUS',
                        media_id: media_id
                    };
                    request.get(options, function(err, response, body) {
                        console.log('STATUS: ', response.statusCode);
                        console.log(body);
                    });
                });
            }
        };
    };


    request.post(options, function(err, response, body) {
        var media_id;
        media_id = JSON.parse(body).media_id_string;

        fs.open(filePath, 'r', function(err, fd) {
            var bytesRead, data;

            while (offset < stats.size) {
                bytesRead = fs.readSync(fd, theBuffer, 0, bufferLength, null);
                data = bytesRead < bufferLength ? theBuffer.slice(0, bytesRead) : theBuffer;
                options.formData = {
                    command: "APPEND",
                    media_id: media_id,
                    segment_index: segment_index,
                    media_data: data.toString('base64')
                };
                request.post(options, normalAppendCallback(media_id));
                offset += bufferLength;
                segment_index++
            }
        });
    });
});