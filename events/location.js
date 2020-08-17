// Script modified: Mon August 17, 2020 @ 12:47:22 EDT
const express = require('express');
const heartbeat = require('../heartbeat');
const location = heartbeat.devices.location;
const logger = require('../logger');
const router = express.Router();

router.post('/life360/allNotHome', async (req, res) => {
    logger.debug("[Events/Location] POST to '/life360/allNotHome'");
    try {
    location.forEach(device => {
        device.updateStatusKey('location', 'notHome');
    }); 
        res.status(200).send("Successfully updated location");
    } catch (err) {
        res.status(400).send(`Bad request: ${err}`);
    }
});

module.exports = router;
