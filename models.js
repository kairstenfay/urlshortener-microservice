const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
        .catch(function(reason) {console.log(reason)});

/* Schemas and models */
var Schema = mongoose.Schema;

var urlSchema = new Schema({
    url: {type: String, required: true},
});
urlSchema.plugin(AutoIncrement, {inc_field: 'short_url'});

var URL = mongoose.model('URL', urlSchema);

/* CRUD methods */
var createAndSaveURL = function(url, done) {
  var document = new URL({ url: url });

  document.save(function (err, url) {
    if (err) return console.error(err);
    console.log(document.name + " saved to url collection.");
    done(null, url);
  });
};

const findURL = function(url, done) {
    URL.findOne({ url: url }, function(err, doc) {
        if (err) return console.error(err);
        done(null, doc);
    });
}

const findShortURL = function(short_url, done) {
    URL.findOne({ short_url: short_url }, function(err, doc) {
        if (err) return console.error(err);
        done(null, doc);
    })
}

exports.URLModel = URL;
exports.findURL = findURL;
exports.findShortURL = findShortURL;
exports.createAndSaveURL = createAndSaveURL;
