var express = require('express');
var dns = require('dns');
var bodyParser = require('body-parser');
var URLModel = require('./models.js').URLModel;
var findURL = require('./models.js').findURL;
var findShortURL = require('./models.js').findShortURL;
var createURL = require('./models.js').createAndSaveURL;

var app = express();
var timeout = 10000;

app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.use('/public', express.static(process.cwd() + '/public'));

app.post('/api/shorturl/new', function(req, res, next) {
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  const url = req.body.url;

  if (!validURL(url)) {
    res.send({ error: "Invalid URL " + url });
    return;
  }

  findURL(url, function(err, doc) {
    clearTimeout(t);
    if(err) { return (next(err)); }
    if (!doc) {
      createURL(url, function(err, doc) {
        if(err) { return (next(err)); }
        URLModel.findById(doc._id, function(err, doc) {
          if(err) { return (next(err)); }
          res.json(doc);
        });
      });

    } else {
      res.json(doc);
    }
  });
});

app.get('/api/shorturl/:short_url', function(req, res, next) {
  var t = setTimeout(() => { next({message: 'timeout'}) }, timeout);
  const short_url = Number(req.params.short_url);
  findShortURL(short_url, function(err, doc) {
    clearTimeout(t);
    if(err) return (next(err));
    res.redirect(doc.url);
  });
});

// Error handler
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }
});

// Unmatched routes handler
app.use(function(req, res){
  if(req.method.toLowerCase() === 'options') {
    res.end();
  } else {
    res.status(404).type('txt').send('Not Found');
  }
})

var listener = app.listen(process.env.PORT || 3000 , function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

const validURL = (url) => {
  try {
    new URL(url);
    dns.lookup(url, function(err, address, family) {
      if (err) { return console.error(err); }
      // Handle my ISP's "helpful" white label IP address
      if (address == process.env.WHITE_LABEL_IP) {
        return false;
      }});
    return true;
  } catch (e) {
    return false;
  }
}
