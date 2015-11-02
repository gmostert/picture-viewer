var dir = require('node-dir');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var Picture = require('./models/picture');

module.exports = function (express) {
    var router = express.Router(); // get an instance of the express Router

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
        // get all the pictures (accessed at GET http://localhost:8080/pictures)
        .get(function (req, res) {
            Picture.find(function (err, pictures) {
                if (err)
                    throw err;

                var paths = new Array();
                for (var i = 0, len = pictures.length; i < len; i++) {
                    paths.push(pictures[i].path);
                }
                
                // Start Binary.js server
                var server = BinaryServer({
                    port: 9050
                });

                // Wait for new user connections
                server.on('connection', function (client) {
                    console.log('CLIENT CONNECTED!');
                    var filesSend = 0;
                    for (var i = 0, len = paths.length; i < len; i++) {
                        var file = fs.createReadStream(paths[i]);
                        console.log('STREAM FILE ' + (i + 1));
                        client.send(file, [filesSend]);
                        filesSend++;
                    };

                    client.on('stream', function (stream, meta) {
                        stream.on('data', function (filesReceived) {
                            console.log("CLIENT RECEVED " + filesReceived);
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
        // add the picture (accessed at POST http://localhost:8080/pictures)
        .post(function (req, res) {
            var picture = new Picture(); // create a new instance of the Picture model
            picture.name = req.body.name;
            picture.path = req.body.path;
            picture.tags = req.body.tags;

            picture.save(function (err) {
                if (err)
                    res.send(err);

                res.json({
                    message: 'Picture added!'
                });
            });
        })
        .put(function (req, res) {
            // update the picture with this id (accessed at PUT http://localhost:8080/pictures/:id)
            Picture.findById(req.params.id, function (err, picture) {
                if (err)
                    res.send(err);

                picture.tags = req.body.tags; // update tag info

                picture.save(function (err) {
                    if (err)
                        res.send(err);

                    res.json({
                        message: 'Picture updated!'
                    });
                });
            });
        });

    // on routes that end in /upload
    // ----------------------------------------------------
    router.route('/upload')
        // add all the pictures in the specifeid folder (accessed at POST http://localhost:8080/upload)
        // params: path=absolute-path-to-folder-containing-images&tags=tag1&tags=tag2
        .post(function (req, res) {
            // Asynchronously iterate the files of a directory and pass an array of file paths to a callback.
            dir.files(req.body.path, 'file', function (err, files) {
                if (err)
                    res.send(err);

                var imageTypes = ['jpg', 'jpeg', 'gif', 'tiff', 'bmp', 'png'];
                var picture, file, fileNameStart, fileExtentionStart;

                for (var i = 0, len = files.length; i < len; i++) {
                    file = files[i];
                    fileNameStart = file.lastIndexOf('\\') + 1;
                    fileExtentionStart = file.lastIndexOf('.') + 1;

                    if (imageTypes.indexOf(file.substring(fileExtentionStart, file.length).toLocaleLowerCase()) !== -1) {
                        picture = new Picture();
                        picture.name = file.substring(fileNameStart, fileExtentionStart - 1);
                        picture.path = file;
                        picture.tags = req.body.tags;

                        picture.save(function (err, pic) {
                            if (err)
                                res.send(err);
                            console.log("IMAGE ADDED: " + pic);
                        });
                    }
                }

                res.json({
                    message: 'All pictures added!'
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
