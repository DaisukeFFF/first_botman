var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var crypto = require("crypto");
const async = require('async');
const bot = require('../lib/lineBot');
const router = express.Router();


const parser = bodyParser.json({
    verify: (req, res, buf, encoding) => {
        console.log('aaa');
        req.rawBody = buf.toString(encoding);
    }
});

const returnMessage = (event) =>{
    if(event.message.text.indexOf('ほめて') !== -1){
            let displayName;
            if(event.source.type === 'user'){
                //displayName = 
            }
            console.log(lineProfile);
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
    }
}

const getGruopMemberProfile = (source) => {
    return bot.get('/group/'+source.groupId +'/member/'+ source.userId).then((res)  =>{
        console.log(res);
        return res.json();
    });
}

//minからmaxまでの乱数を返す関数
var getRandom = (min, max) => {
    return Math.round(Math.random() * (max - min + 1)) + min;
}

router.post('/', parser, (req, res, next) => {
    console.log(req.body);
    console.log(parser);
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
    const lineProfile;
    if(event.source.type !== 'user'){
        lineProfile = getGruopMemberProfile(event.source);
        //returnMessage(lineProfile);
    }else{
        lineProfile = event.source.profile();
    }
    
});

// router.post('/', function(req, res) {
//     async.waterfall([
//             function(callback) {
//                 // リクエストがLINE Platformから送られてきたか確認する
//                 if (!validate_signature(req.headers['x-line-signature'], req.body)) {
//                     return;
//                 }
//                 // テキストが送られてきた場合のみ返事をする
//                 if ((req.body['events'][0]['type'] !== 'message') || (req.body['events'][0]['message']['type'] !== 'text')) {
//                     return;
//                 }
//                 // 「ヘルプ」という単語がテキストに含まれている場合のみ返事をする

//                 // 「ほめて」という単語がテキストに含まれている場合のみ返事をする
//                 if (req.body['events'][0]['message']['text'].indexOf('ほめて') === -1) {
//                     if (req.body['events'][0]['message']['text'].indexOf('ヘルプ') !== -1 ) {
//                         callback('ヘルプ');
//                     }
//                     return;
//                 }

//                 // 1対1のチャットの場合は相手のユーザ名で返事をする
//                 // グループチャットの場合はユーザ名が分からないので、「お主ら」で返事をする
//                 if (req.body['events'][0]['source']['type'] === 'user') {
//                     // ユーザIDでLINEのプロファイルを検索して、ユーザ名を取得する
//                     var user_id = req.body['events'][0]['source']['userId'];
//                     var get_profile_options = {
//                         url: 'https://api.line.me/v2/bot/profile/' + user_id,
//                         proxy: process.env.FIXIE_URL,
//                         json: true,
//                         headers: {
//                             'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}'
//                         }
//                     };
//                     request.get(get_profile_options, function(error, response, body) {
//                         if (!error && response.statusCode === 200) {
//                             callback(body['displayName']);
//                         }
//                     });
//                 } else if ('room' === req.body['events'][0]['source']['type']) {
//                     callback('諸君');
//                 } else if ('group' === req.body['events'][0]['source']['type']) {
//                     callback('お主ら');
//                 }

//             },
//         ],
//         function(displayName) {
//             console.log('check');
//             display = displayName + '!\nよっっ！日本の宝!!';
//             if(displayName === 'ヘルプ'){
//                 display = 'お呼びですか?\n「ほめて」と言われたら褒めます。\n'+
//                     '今はただの褒め上手ですが、そのうち色々覚えていきますよ！';
//             }
//             //ヘッダーを定義
//             var headers = {
//                 'Content-Type': 'application/json',
//                 'Authorization': 'Bearer {' + process.env.LINE_CHANNEL_ACCESS_TOKEN + '}',
//             };

//             // 送信データ作成
//             var data = {
//                 'replyToken': req.body['events'][0]['replyToken'],
//                 "messages": [{
//                     "type": "text",
//                     "text": display
//                 }]
//             };

//             //オプションを定義
//             var options = {
//                 url: 'https://api.line.me/v2/bot/message/reply',
//                 proxy: process.env.FIXIE_URL,
//                 headers: headers,
//                 json: true,
//                 body: data
//             };

//             request.post(options, function(error, response, body) {
//                 if (!error && response.statusCode === 200) {
//                     console.log(body);
//                 } else {
//                     console.log('error: ' + JSON.stringify(response));
//                 }
//             });
//         }
//     );
// });

// 署名検証
function validate_signature(signature, body) {
    return signature === crypto.createHmac('sha256', process.env.LINE_CHANNEL_SECRET).update(new Buffer(JSON.stringify(body), 'utf8')).digest('base64');
}

module.exports = router;