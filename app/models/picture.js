var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PictureSchema = new Schema({
    name: String,
    path: String,
    tags: Array
});

module.exports = mongoose.model('Picture', PictureSchema);