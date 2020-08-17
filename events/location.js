// Script modified: Mon August 17, 2020 @ 01:59:48 EDT
const express = require('express');
const heartbeat = require('../heartbeat');
const location = heartbeat.devices.location;
const logger = require('../logger');
const router = express.Router();

router.post('/life360/arriveHome', async (req, res) => {
    logger.debug("[Events/Location] POST to '/life360/arriveHome'");
    try {
        location.life360.updateStatusKey('atHome', true);
        res.status(200).send("Successfully updated location").end();
    } catch (err) {
        logger.error("[Events/Location] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`).end();
    }
});
router.post('/life360/allNotHome', async (req, res) => {
    logger.debug("[Events/Location] POST to '/life360/allNotHome'");
    try {
        location.life360.updateStatusKey('atHome', false);
        res.status(200).send("Successfully updated location").end();
    } catch (err) {
        logger.error("[Events/Location] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`).end();
    }
});
router.post('/life360/arriveShanty', async (req, res) => {
    logger.debug("[Events/Location] POST to '/life360/arriveShanty'");
    try {
        location.life360.updateStatusKey('atShanty', true);
        res.status(200).send("Successfully updated location").end();
    } catch (err) {
        logger.error("[Events/Location] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`).end();
    }
});
router.post('/life360/allNotShanty', async (req, res) => {
    logger.debug("[Events/Location] POST to '/life360/allNotShanty'");
    try {
        location.life360.updateStatusKey('atShanty', false);
        res.status(200).send("Successfully updated location").end();
    } catch (err) {
        logger.error("[Events/Location] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`).end();
    }
});


module.exports = router;
