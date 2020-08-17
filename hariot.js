// Script modified: Mon August 17, 2020 @ 12:50:18 EDT
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
const sms = require('./smsInterface');
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
const eventLocation = require('./events/location');

app.use('/grg', eventGarage);
app.use('/loc', eventLocation);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort, () => {
    logger.info("Http server listening on port : " + httpPort);
});

httpsServer.listen(httpsPort, () => {
    logger.info("Https server listening on port : " + httpsPort);
});

function garageEvents() {
    var main = heartbeat.devices.garage.main;
    var side = heartbeat.devices.garage.side;
monitor.attach(() => {
    return (main.statusOfKey('position') == 'up' || side.statusOfKey('position') == 'up')
}, (1000 * 60), () => {
    var options = {
        host: 'maker.ifttt.com',
        path: `/trigger/garage_lighton/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
    };
    http.request(options, () => { logger.info("Successfully activated garage lights.") }).end();
});

// if both doors are closed, wait 15 and shut off garage lights. Longer cooldown gives 2 hours to work in garage with lights on.
monitor.attach(() => {
    return (
    main.statusOfKey('position') == 'down' &&
    side.statusOfKey('position') == 'down' &&
    Math.max(main.time, side.time) <= Date.now() - (1000 * 60 * 15));
}, (1000 * 60 * 120), () => {
    var options = {
        host: 'maker.ifttt.com',
        path: `/trigger/garage_lightoff/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
    };
    http.request(options, () => { logger.info("Successfully disabled garage lights.") }).end();
    
});
}

garageEvents();
