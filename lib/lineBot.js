//linebot sdkを取得し、特記事項を認証条件を記載したものをexportしている
//このモジュールを呼び出すことで、このアカウントでline apiを扱うことができる

const linebot = require('linebot-forked');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
const async = require('async');

//line bot-forkedのconstructerをセットしている
const bot = linebot({
    channelId: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN
});

module.exports = bot;