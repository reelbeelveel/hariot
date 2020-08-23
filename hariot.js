// Script modified: Sun August 23, 2020 @ 05:52:32 EDT
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

    // force known state on init
    var requests = [
        {
            host: 'maker.ifttt.com',
            path: `/trigger/garage_maindown/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
        },{
            host: 'maker.ifttt.com',
            path: `/trigger/garage_sidedown/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
        }
    ];

    requests.forEach(req => { http.request(req, () => { logger.info("Forcing known state"); }).end() })

    const timing = {
        lighton: (600),                             // Every 600ms, try to turn on lights if door open
        lightoff_inactive: (1000 * 60 * 15),        // If doors closed for 15 minutes, turn off lights
        lightoff_cooldown: (1000 * 60 * 60 * 2),    // Don't try to turn off the lights again for 2 hours
        doordown_inactive: (1000 * 60 * 60 * 1.5),  // Close a garage door that hes been left open for 90 minutes
        doordown_cooldown: (1000 * 60 * 5),         // Don't try to close door again for 5 minutes (wait for door to close)
    }

    // activate lights if doors are open
    monitor.attach(() => {
        return (main.statusOfKey('position') == 'up' || side.statusOfKey('position') == 'up')
    }, (timing.lighton), () => {
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
            Math.max(main.time, side.time) <= Date.now() - (timing.lightoff_inactive));
    }, (timing.lightoff_cooldown), () => {
        var options = {
            host: 'maker.ifttt.com',
            path: `/trigger/garage_lightoff/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
        };
        http.request(options, () => { logger.info("Successfully disabled garage lights.") }).end();
    });

    monitor.attach(() => {
        return (
            main.statusOfKey('position') == 'up' &&
            main.time  <= Date.now() - (timing.doordown_inactive));
    }, (timing.doordown_cooldown), () => {
        var options = {
            host: 'maker.ifttt.com',
            path: `/trigger/garage_maindown/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
        };
        http.request(options, () => {
            logger.info("Closed main door after 90 minutes of inactivity.");
            sms.send({ from: "harIOT Mailer <harIOTnotice@gmail.com>",
                to: sms.recipient('all'),
                subject: "IOT Event",
                text: "The main garage door has been left open for some time. I've closed it for you." })}).end();
    });

    monitor.attach(() => {
        return (
            side.statusOfKey('position') == 'up' &&
            main.time <= Date.now() - (timing.doordown_inactive));
    }, (timing.doordown_cooldown), () => {
        var options = {
            host: 'maker.ifttt.com',
            path: `/trigger/garage_sidedown/with/key/${process.env.IFTTT_WEBHOOK_KEY}`
        };
        http.request(options, () => {
            logger.info("Closed side door after 90 of inactivity.");
            sms.send({ from: "harIOT Mailer <harIOTnotice@gmail.com>",
                to: sms.recipient('all'),
                subject: "IOT Event",
                text: "The side garage door has been left open for some time. I've closed it for you." })}).end();
    });
}

garageEvents();
