var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
const async = require('async');
const botman = require('./routes/botman');


app.set('port', (process.env.PORT || 8000));
// JSONの送信を許可
app.use(bodyParser.urlencoded({
    extended: true
}));
// JSONのパースを楽に（受信時）
app.use(bodyParser.json({
  verify(req, res, buf) {
    req.rawBody = buf
  }
}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/callback',botman);

app.listen(app.get('port'), function() {
    console.log('Node app is running');
});

