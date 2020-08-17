// Script modified: Mon August 17, 2020 @ 11:46:17 EDT
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const heartbeat = require('./heartbeat');
const http = require('http');
const https = require('https');
const httpPort = 3030;
const httpsPort = 3031;
const logger = require('./logger');
const monitor = require('./monitor');
require('dotenv/config');

app.use(bodyParser.text());
app.use(express.static(__dirname + '/public'));

var key = fs.readFileSync(__dirname + process.env.SSL_KEY);
var cert = fs.readFileSync(__dirname + process.env.SSL_CRT);

var credentials = {
    key: key,
    cert: cert
};

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.REQUEST_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const eventGarage = require('./events/garage');
//const eventLocation = require('./events/location');

app.use('/grg', eventGarage);
//app.use('/loc', eventLocation);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort, () => {
    logger.info("Http server listening on port : " + httpPort);
});

httpsServer.listen(httpsPort, () => {
    logger.info("Https server listening on port : " + httpsPort);
});

monitor.attach(() => {
    return (heartbeat.devices.garage.main.statusOfKey('position') == 'up');
}, (1000 * 60), () => {
    var options = {
        host: 'maker.ifttt.com',
        path: `/trigger/garage_lighton/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
    };
    console.log("Main door is open");
    http.request(options).end();
});

monitor.attach(() => {
    return (heartbeat.devices.garage.side.statusOfKey('position') == 'up');
}, (1000 * 60), () => {
    console.log("Side door is open");
});
