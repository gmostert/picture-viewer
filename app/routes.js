var fs = require('fs');
var dir = require('node-dir');
var BinaryServer = require('binaryjs').BinaryServer;
var Picture = require('./models/picture');
var Tag = require('./models/tag');

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

    function updateTags(tags) {
        Tag.find(function (err, allTags) {
            errorHandler(err);

            var tagObject, exists;
            tags.forEach(function (tag) {
                exists = false;

                allTags.forEach(function(existingTag) {
                    if (tag == existingTag.name) {
                        exists = true;
                    }
                });

                if (!exists) {
                    tagObject = new Tag();
                    tagObject.name = tag;

                    tagObject.save(function (err, savedTag) {
                        errorHandler(err);
                        console.log("TAG ADDED: " + savedTag);
                    });
                }
            });
        });
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

            function sendFileToClient(file, client) {
                var fileStream = fs.createReadStream(file.folder + file.name);
                console.log('STREAM FILE ' + file._id);
                client.send(fileStream, [file._id + ""]); // Stream file along with its id as meta data
            }

            function removeReceivedFile(fileReceived, pictures) {
                var picture;
                for (var i = 0, len = pictures.length; i < len; i++) {
                    picture = pictures[i];
                    if (picture._id == fileReceived) {
                        pictures.splice(i, 1);
                        break;
                    }
                }
                return pictures;
            }

            if (tags) {
                var query = {tags: tags};
                Picture.find(query, function (err, pictures) {
                    // pictures = [{_id: 563c649a8ea3c65c0eae008b, folder: 'C:\\Users\\Public\\Pictures\\Sample Pictures\\', name: 'Lighthouse.jpg', __v: 0, tags: [ 'tag1', 'tag2' ] }]
                    errorHandler(err);

                    // Wait for new user connections
                    server.on('connection', function (client) {
                        if (pictures.length > 0) {
                            sendFileToClient(pictures[0], client);
                        }

                        client.on('stream', function (stream, meta) {
                            stream.on('data', function (data) { // data = ['563c649a8ea3c65c0eae008b']
                                console.log("CLIENT RECIEVED " + data[0]);
                                pictures = removeReceivedFile(data[0], pictures);
                                if (pictures.length > 0) {
                                    sendFileToClient(pictures[0], client);
                                } else {
                                    console.log("CLOSE CONNECTION!");
                                    client.close();
                                }
                            });
                        });
                    });

                    res.json(pictures);
                });
            } else {
                 Picture.find(function (err, pictures) {
                    errorHandler(err);
                    res.json(pictures);
                });
            }
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
                        picture.folder = file.substring(0, fileNameStart);
                        picture.tags = tags;

                        picture.save(function (err, pic) {
                            errorHandler(err);
                            console.log("PICTURE ADDED: " + pic);
                        });
                    }
                }

                updateTags(tags);

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

                var conditions = {folder: files[0].substring(0, files[0].lastIndexOf('\\') + 1)}
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

                var folder = files[0].substring(0, files[0].lastIndexOf('\\') + 1);
                var query = {folder: folder};
                console.log(folder);
                Picture.find(query, function (err, pictures) {
                    errorHandler(err);
                    pictures.forEach(function (pic) {
                        console.log("REMOVE PICTURE: " + pic);
                        Picture.remove({_id: pic._id}, function(err) {
                            errorHandler(err);
                        });
                        //TODO: remove tag if no other pictures uses it
                    });

                    res.json({
                        message: 'All pictures removed from: ' + folder
                    });
                });
            });
        });

    // on routes that end in /tags
    // ----------------------------------------------------
    router.route('/tags')
        // Get all the tags (accessed at GET http://localhost:8080/tags)
        .get(function (req, res) {
            Tag
            .find({})
            .select({"name": 1, "_id": 0})
            .exec(function (err, tags) {
                errorHandler(err);
                res.json(tags);
            });
        })

    // FRONTED ROUTES
    // =============================================================================

    // route to handle all angular requests (accessed at GET http://localhost:8080/picture-viewer)
    router.get('/picture-viewer', function (req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    });

    return router;
};
