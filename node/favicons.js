(function() {
  var MONGODB_SERVER, app, db, express, mongo,
    _this = this;

  express = require('express');

  mongo = require('mongodb');

  MONGODB_SERVER = process.env.NODE_ENV === 'dev' ? 'localhost' : 'db04';

  db = new mongo.Db('newsblur', new mongo.Server(MONGODB_SERVER, 27017));

  app = express.createServer();

  app.use(express.bodyParser());

  db.open(function(err, client) {
    _this.client = client;
  });

  app.get(/^\/rss_feeds\/icon\/(\d+)\/?/, function(req, res) {
    var feed_id;
    feed_id = parseInt(req.params, 10);
    return _this.client.collection("feed_icons", function(err, collection) {
      return collection.findOne({
        _id: feed_id
      }, function(err, docs) {
        var etag;
        if (!err && docs && docs.data) {
          etag = req.header('If-None-Match');
          if (etag && docs.color === etag) {
            return res.send(304);
          } else {
            res.header('etag', docs.color);
            return res.send(new Buffer(docs.data, 'base64'), {
              "Content-Type": "image/png"
            });
          }
        } else {
          return res.redirect('/media/img/icons/silk/world.png');
        }
      });
    });
  });

  app.listen(3030);

}).call(this);
