var dir = require('node-dir');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var Picture = require('./models/picture');

module.exports = function (express) {
    var router = express.Router(); // get an instance of the express Router
    // Start Binary.js server
    var server = BinaryServer({
        port: 9050
    });

    function errorHandler(err) {
        if (err) {
            console.log(err);
            throw err;
        }
    };

    // ROUTES FOR OUR API
    // =============================================================================

    // middleware to use for all requests
    router.use(function (req, res, next) {
        // do logging
        console.log('Something is happening.');
        next(); // make sure we go to the next routes and don't stop here
    });

    // on routes that end in /pictures
    // ----------------------------------------------------
    router.route('/pictures')
        // Get all the pictures (accessed at GET http://localhost:8080/pictures)
        // Params: ?tags=tag1&tags=tag2
        .get(function (req, res) {
            var tags = req.param('tags');
            var query = {
                tags: tags
            };

            Picture.find(query, function (err, pictures) {
                errorHandler(err);

                // Wait for new user connections
                server.on('connection', function (client) {
                    console.log('CLIENT CONNECTED!');
                    var filesSend = 0;
                    for (var i = 0, len = pictures.length; i < len; i++) {
                        var file = fs.createReadStream(pictures[i].path + pictures[i].name);
                        console.log('STREAM FILE ' + pictures[i].name);
                        client.send(file, [filesSend]);
                        filesSend++;
                    };

                    client.on('stream', function (stream, meta) {
                        stream.on('data', function (filesReceived) {
                            console.log("CLIENT RECIEVED " + filesReceived);
                            if (filesSend == filesReceived) {
                                console.log("CLOSE CONNECTION!");
                                client.close();
                            }
                        });
                    });
                });
                
                res.json(pictures);
            });
        })
        // Add all the pictures in the specified folder (accessed at POST http://localhost:8080/pictures)
        // Params: ?folder=absolute-path-to-folder&tags=tag1&tags=tag2
        .post(function (req, res) {
            // Asynchronously iterate the files of a directory and pass an array of file paths to a callback.
            var folder = req.param('folder');
            var tags = req.param('tags');
            dir.files(folder, 'file', function (err, files) {
                errorHandler(err);

                var imageTypes = ['jpg', 'jpeg', 'gif', 'tiff', 'bmp', 'png'];
                var picture, file, fileNameStart, fileExtentionStart;

                for (var i = 0, len = files.length; i < len; i++) {
                    file = files[i];
                    fileNameStart = file.lastIndexOf('\\') + 1;
                    fileExtentionStart = file.lastIndexOf('.') + 1;

                    if (imageTypes.indexOf(file.substring(fileExtentionStart, file.length).toLocaleLowerCase()) !== -1) {
                        picture = new Picture();
                        picture.name = file.substring(fileNameStart, file.length);
                        picture.path = file.substring(0, fileNameStart);
                        picture.tags = tags;

                        picture.save(function (err, pic) {
                            errorHandler(err);
                            console.log("PICTURE ADDED: " + pic);
                        });
                    }
                }

                res.json({
                    message: 'All pictures added from: ' + folder
                });
            });
        })
        // Update all the picture's meta data in the specified folder (accessed at PUT http://localhost:8080/pictures)
        // Params: ?folder=absolute-path-to-folder&tags=tag1&tags=tag2
        .put(function (req, res) {
            var folder = req.param('folder');
            var tags = req.param('tags');
            dir.files(folder, function (err, files) {
                errorHandler(err);

                var conditions = {path: files[0].substring(0, files[0].lastIndexOf('\\') + 1)}
                var update = {tags: tags}
                var options = {multi: true};

                Picture.update(conditions, update, options, function (err, numAffected) {
                    res.json({
                        message: 'All pictures updated in: ' + folder
                    });
                });
            });
        })
        // Delete all the pictures in the specified folder (accessed at DELETE http://localhost:8080/upload)
        // Params: ?folder=absolute-path-to-folder
        .delete(function (req, res) {
            var folder = req.param('folder');
            dir.files(folder, function (err, files) {
                errorHandler(err);

                var path = files[0].substring(0, files[0].lastIndexOf('\\') + 1);
                var query = {'path': path};

                Picture.find(query, function (err, pictures) {
                    errorHandler(err);

                    pictures.forEach(function (pic) {
                        pic.remove();
                        console.log("PICTURE REMOVED: " + pic);
                    });

                    res.json({
                        message: 'All pictures removed from: ' + folder
                    });
                });
            });
        });


    // FRONTED ROUTES
    // =============================================================================

    // route to handle all angular requests (accessed at GET http://localhost:8080/picture-viewer)
    router.get('/picture-viewer', function (req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

    return router;
};
