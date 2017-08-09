const http = require('http');
const location = "Fukuoka-shi,jp";
const units = 'metric';
const APIKEY = process.env.OPEN_WEATHER_KEY;
const URL = 'http://api.openweathermap.org/data/2.5/weather?q='+ location +'&units='+ units +'&appid='+ APIKEY;


const weatherData = getweatherData => {
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
module.exports = weatherData;