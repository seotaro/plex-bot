'use stritct';

const express = require('express');
const multer = require('multer');
// const sharp = require('sharp');
const twitter = require('twitter');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();

var client = new twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


const asyncRoute = (handler) => {
  return (req, res, next, ...params) => {
    return handler.call(this, req, res, next, ...params).catch(next);
  }
};

app.post('/', upload.single('thumb'), asyncRoute(async (req, res, next) => {
  const payload = JSON.parse(req.body.payload);

  // レートが変更したらtwitter, slackに投稿する。
  if (payload.event == 'media.rate') {
    let buffer;
    if (req.file && req.file.buffer) {
      buffer = req.file.buffer;

    } else if (payload.thumb) {
      buffer = await request.get({
        uri: payload.thumb,
        encoding: null
      });
    }

    if (buffer) {
      // image = await sharp(buffer)
      //   .resize({
      //     height: 75,
      //     width: 75,
      //     fit: 'contain',
      //     background: 'white'
      //   })
      //   .toBuffer();
    }

    console.log('media.rate', payload.Metadata.originalTitle, payload.Metadata.grandparentTitle, payload.Metadata.parentTitle, payload.Metadata.title, payload.rating);

    const stars = ("★".repeat(Number(payload.rating) / 2) + "☆☆☆☆☆").substr(0, 5)  // payload.rating は10段階。★は5段階で表現する。
    const message = "#NowRating " + stars + "\n" +
      "\"" + payload.Metadata.title + "\", " + payload.Metadata.parentTitle + ", " + payload.Metadata.grandparentTitle;

    // post to twitter
    (async () => {
      client.post('media/upload', { media: buffer }, function (error, media, response) {
        if (!error) {
          console.log(media);
          const status = {
            status: message,
            media_ids: media.media_id_string
          }

          client.post('statuses/update', status, function (error, tweet, response) {
            if (!error) {
              console.log(tweet);
            }
          });
        }
      });
    })();
  }

  res.sendStatus(200);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.sendStatus(200); // webhook ハンドラーには常に 200 を返す。
});

const port = process.env.PORT || 11000;
app.listen(port, () => {
  console.log('listening on port ' + port);
});
