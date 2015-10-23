// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express'); // call express
var app = express(); // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./app/routes')(express);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'));

// set our port
var port = process.env.PORT || 8080;

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with nothing
app.use('', routes);

// CONNECT TO OUR DB -------------------------------
mongoose.connect('mongodb://localhost/pictureDB');

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);