var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require('crypto');
const async = require('async');
const http = require('http');
const config = require('config');
const bot = require('../lib/lineBot');
const router = express.Router();

const parser = bodyParser.json({
    verify: (req, res, buf, encoding) => {
        req.rawBody = buf.toString(encoding);
    }
});

const weatherData = () => new Promise((resolve, reject) =>  {

    const location = 'Tokyo,jp';
    const units = 'metric';
    const APIKEY = process.env.OPEN_WEATHER_KEY;
    const URL = 'http://api.openweathermap.org/data/2.5/weather?q='
        + location +'&units='+ units +'&appid='+ APIKEY;
    http.get(URL, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            body += chunk;
        });
        res.on('data', (chunk) => {
            tokyoWeather = JSON.parse(body);
            resolve(tokyoWeather);
        });
    });
});

const getJapanWeather = (text) =>{
    return text;
}

const setlineProfile = (source) => {
    if(source.type === 'user'){
        return source.profile().then((lineProfile) => {
            return lineProfile;
        });
    }else if(source.type === 'group'){
        return getGruopMemberProfile(source).then((lineProfile) =>{
            return lineProfile;
        });
    }else {
        return getRoomMemberProfile(source).then((lineProfile) =>{
            return lineProfile;
        });
    }
};

const returnMessage = (event) =>{
    setlineProfile(event.source).then( (lineProfile) =>{
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
        }else if(event.message.text.indexOf('疲れた') !== -1 || event.message.text.indexOf('つかれた') !== -1 || event.message.text.indexOf('悲しい') !== -1){
            const googlePhotoUrl = 'https://lh3.googleusercontent.com/Zylsh2x6bogkgoYiZVBJxIqHOrHG6V7rLCT_DN_h7Pr-VYk5PUelT48BBvucgixVe_eKlBW1uTT1O5m0BBBEwGf6y3FxhNzVtsZmzFUbmnGy5asMsGxB7a-H_55AZt1i0iet-yLU5mW4nZBBKviqyWhDIS94O2wCGndR9jN0Ax6h5VDtw3x15lpbrVOysfYa_DxD4KCgUA1HxvsjXsxQkcoRZd-Sr_tn7QQP87emKjg5c5OU2ZuqAxptfA0umLaHKo7GzYmBdFr9DEF4xD7BJk9vr3Fb3jQM7QZZ9w8SvOTyJA8J5RQ9yvPxF007d-FkiXugFGx8RUH12nuurkk_Z6FUyg7dKlBUIEQ1Jao5iQak9nFzGWHOpaNzU7busH0RAU97w8Idzahnel4k-Q4KhCp-1KuigjELccLiU7c2UIXZqpPYKeqPNDFTiHo0Vs_nkOAdF3GsT3ieY_u1GDE_jp4CvkjgG-a0tgghXgXpZypwTHIz-GHMAui7JO4E9AiqBHm7X5iksWhszyUYaRA27Bj-N_1NiilWELIXH6NKrwnqQI03k8KqfDXayYDjy-2s2x0HRWYo9_q1x9dxDiQC56uHPSl0Dxm8Od6H_tmJBGzO6XvpYhsVub9l0M6RsBPpdcEMsMCxRAkXEHe5YhXcYhwUmI2jB7kmiHbVQKbtmukYSg=w600-h596-no';
            message = {
                type: 'image',
                originalContentUrl: googlePhotoUrl,
                previewImageUrl: googlePhotoUrl
            }
            event.reply(message);
        }else if(event.message.text === '天気'){
            weatherData().then((tokyoWeather) => {

                event.reply(['本日の天気(東京)\n'+ '天候：'+ tokyoWeather.weather[0].main+ 
                    '\n気温：'+ tokyoWeather.main.temp+ '℃',
                    ]);
            });
        }else if(event.message.text === 'お天気'){
            message = {
                        type: "template",
                        altText: "this is a confirm template",
                        template: {
                            type: "confirm",
                            text: "Are you sure?",
                            actions: [
                                {
                                  type: "message",
                                  label: "Yes",
                                  text: "yes"
                                },
                                {
                                  type: "message",
                                  label: "No",
                                  text: "no"
                                }
                            ]
                        }
            }
            event.reply(message);
        }else if(event.message.text === 'ボタン'){
            message = {
                        type: "template",
                        altText: "this is a buttons template",
                        template: {
                            type: "buttons",
                            thumbnailImageUrl: "https://openweathermap.org/img/w/10d.png",
                            title: "Menu",
                            text: "Please select",
                            actions: [
                                {
                                  type: "postback",
                                  label: "Buy",
                                  data: "action=buy&itemid=123"
                                },
                                {
                                  type: "postback",
                                  label: "Add to cart",
                                  data: "action=add&itemid=123"
                                },
                                {
                                  type: "uri",
                                  label: "View detail",
                                  uri: "http://example.com/page/123"
                                }
                            ]
                        }
            }
            event.reply(message);
        }
    });
}

const getGruopMemberProfile = (source) => {
    return bot.get('/group/'+source.groupId +'/member/'+ source.userId).then((res)  =>{
        return res.json();
    });
}

const getRoomMemberProfile = (source) => {
    return bot.get('/room/'+source.roomId +'/member/'+ source.userId).then((res)  =>{
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

router.get('/cron', (req,res) => {
            weatherData().then((tokyoWeather) => {
                console.log(tokyoWeather.weather[0]);
                console.log(tokyoWeather.main);
                bot.push('U3cec006ed81ed2abbf10ff808ef31f13' ,'本日の天気(東京)\n'+ '天候：'+ tokyoWeather.weather[0].main+ 
                    '\n気温：'+ tokyoWeather.main.temp+ '℃');
            });
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
    if(event.message.type !== 'text'){
        return;
    }
    event.source.profile().then((lineProfile) =>{
        console.log(lineProfile.displayName +' : '+ event.message.text);
    });
    returnMessage(event);
});

// 署名検証
function validate_signature(signature, body) {
    return signature === crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

module.exports = router;