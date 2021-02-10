'use stritct';

const express = require('express');
const multer = require('multer');
const twitter = require('twitter');

require('dotenv').config();

const upload = multer({ storage: multer.memoryStorage() });

var client = new twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

const app = express();

const asyncRoute = (handler) => {
  return (req, res, next, ...params) => {
    return handler.call(this, req, res, next, ...params).catch(next);
  }
};

app.post('/', upload.single('thumb'), asyncRoute(async (req, res, next) => {
  const payload = JSON.parse(req.body.payload);

  if (payload.event == 'media.rate') {
    // レートを変更したら twitter に投稿する。

    let thumbneil;
    if (req.file && req.file.buffer) {
      thumbneil = req.file.buffer;

    } else if (payload.thumb) {
      thumbneil = await request.get({
        uri: payload.thumb,
        encoding: null
      });
    }

    // tweet
    const stars = ("★".repeat(Number(payload.rating) / 2) + "☆☆☆☆☆").substr(0, 5)  // payload.rating は10段階。★は5段階で表現する。
    const message = "#NowRating " + stars + "\n" +
      "\"" + payload.Metadata.title + "\", " + payload.Metadata.parentTitle + ", " + payload.Metadata.grandparentTitle;

    if (thumbneil) {
      // 画像ありで tweet する。

      client.post('media/upload', { media: thumbneil })
        .then(function (media) {
          const status = {
            status: message,
            media_ids: media.media_id_string
          }

          return client.post('statuses/update', status)
        })
        .then(function (tweet) {
          console.log("tweet", tweet);
        })
        .catch(function (error) {
          console.error("tweet error", error);
        })
    } else {
      // 画像なしで tweet する。

      const status = {
        status: message,
      }

      client.post('statuses/update', status)
        .then(function (tweet) {
          console.log("tweet", tweet);
        })
        .catch(function (error) {
          console.error("tweet error", error);
        })
    }
  }

  res.sendStatus(200); // webhook ハンドラーには常に 200 を返す。
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(200); // webhook ハンドラーには常に 200 を返す。
});

const port = process.env.PORT || 11000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
