var dir = require('node-dir');
var Picture = require('./models/picture');

module.exports = function (express) {
    // ROUTES FOR OUR API
    // =============================================================================
    var router = express.Router(); // get an instance of the express Router

    // middleware to use for all requests
    router.use(function (req, res, next) {
        // do logging
        console.log('Something is happening.');
        next(); // make sure we go to the next routes and don't stop here
    });

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function (req, res) {
        res.sendfile('./public/views/index.html'); // load our public/index.html file
    });

    // on routes that end in /pictures
    // ----------------------------------------------------
    router.route('/pictures')
        // get all the pictures (accessed at GET http://localhost:8080/api/pictures)
        .get(function (req, res) {
            Picture.find(function (err, pictures) {
                if (err)
                    res.send(err);

                res.json(pictures);
            });
        })
        // add the picture (accessed at POST http://localhost:8080/api/pictures)
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
            // update the picture with this id (accessed at PUT http://localhost:8080/api/pictures/:id)
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
        // add all the pictures in the specifeid folder (accessed at POST http://localhost:8080/api/upload)
        .post(function (req, res) {
            // Asynchronously iterate the files of a directory and its subdirectories and pass an array of file paths to a callback.
            dir.files(req.body.path, function (err, files) {
                if (err) 
                    res.send(err);
                
                for (var i = 0, len = files.length; i < len; i++) {
                    var file = files[i];
                    
                    var picture = new Picture();
                    picture.name = file.substring(file.lastIndexOf('\\') + 1, file.lastIndexOf('.'));
                    picture.path = file;
                    picture.tags = req.body.tags;

                    picture.save(function (err, pic) {
                        if (err)
                            res.send(err);
                    });
                }
                
                res.json({
                    message: 'Pictures added!'
                });
            });
        });

    return router;
};