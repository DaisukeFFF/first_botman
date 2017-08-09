var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
const async = require('async');
const http = require('http');
const bot = require('../lib/lineBot');
const openWeather = require('../lib/openWeatherMap');
const router = express.Router();


const parser = bodyParser.json({
    verify: (req, res, buf, encoding) => {
        req.rawBody = buf.toString(encoding);
    }
});

const weatherData = () => {
    const location = "Fukuoka-shi,jp";
    const units = 'metric';
    const APIKEY = process.env.OPEN_WEATHER_KEY;
    const URL = 'http://api.openweathermap.org/data/2.5/weather?q='+ location +'&units='+ units +'&appid='+ APIKEY;

    http.get(URL, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            body += chunk;
        });
        res.on('data', (chunk) => {
            res = JSON.parse(body);
            console.log(res);
        });
    });
};

const setlineProfile = (source) => {
    if(source.type === 'user'){
        return source.profile().then((lineProfile) => {
            return lineProfile;
        });
    }else{
        return getGruopMemberProfile(source).then((lineProfile) =>{
            return lineProfile;
        });
    }
};

const returnMessage = (event) =>{
    setlineProfile(event.source).then( (lineProfile) =>{
        console.log(lineProfile);
        if(event.message.text.indexOf('ほめて') !== -1){
                const num = getRandom(1,3);
                switch (num){ 
                case 1:
                    event.reply('素晴らしい！君は日本の宝だ！');
                case 2:
                    event.reply(lineProfile.displayName + 'さん！\nさすがっすね！');
                case 3:
                    event.reply('よっ！若頭！');
                case 4:
                    event.reply(lineProfile.displayName +'さん\n今日もお疲れ様！夜はゆっくり休んでくださいね');
                }
        }else if(event.message.text === 'ヘルプ'){
            event.reply('お呼びですか?\n「ほめて」と言われたら褒めます。\n'+
                             '今はただの褒め上手ですが、そのうち色々覚えていきますよ！');
        }else if(event.message.text === 'くっころ'){
            event.reply(lineProfile.displayName + 'にこんな辱めを受けるとは...！\nくっ...殺せ！');
        }else if(event.message.text === 'FUJII'){
            event.reply('@FUJII DAISUKE ');
        }
    });
}

const getGruopMemberProfile = (source) => {
    return bot.get('/group/'+source.groupId +'/member/'+ source.userId).then((res)  =>{
        return res.json();
    });
}

//minからmaxまでの乱数を返す関数
var getRandom = (min, max) => {
    return Math.round(Math.random() * (max - min + 1)) + min;
}

//init
router.post('/', parser, (req, res, next) => {
    if (req.body.events === '') {
        return;
    }
    if (!bot.verify(req.rawBody, req.get('X-Line-Signature'))) {
        return res.sendStatus(400);
    }
    bot.parse(req.body);
    console.log('test');
    res.set('Content-Type', 'text/plain');
    res.status(200).end();
});

// 友達追加
bot.on('follow', (event) => {
    weatherData();
    console.log('follow success!');
});

// // ブロック
bot.on('unfollow', (event) => {
    console.log('unfollow success');
});

bot.on('message', (event) => {
    console.log(event);
    if(event.message.type !== 'text'){
        return;
    }
    returnMessage(event);
});

// 署名検証
function validate_signature(signature, body) {
    return signature === crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

module.exports = router;