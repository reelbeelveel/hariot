// Script modified: Sun August 23, 2020 @ 05:14:18 EDT
const express = require('express');
const heartbeat = require('../heartbeat');
const garage = heartbeat.devices.garage;
const joi = require('@hapi/joi');
const logger = require('../logger');
const router = express.Router();

const doorEvent = joi.object({
    door: joi.string()
    .regex(/^(Main Door|Side Door)$/)
    .required(),
    position: joi.string()
    .regex(/^(open|closed)$/)
    .required()
});

router.post('/:door/:position', async (req, res) => {
    logger.debug("[Event/Garage] POST call to '/:door/:position' ");
    try {
        const valid = await doorEvent.validateAsync(req.params);
        logger.debug("[Event/Garage] Successfully validated parameters");
        logger.debug(`> door: ${valid.door == 'Main Door' ? 'main' : 'side'}`);
        logger.debug(`> position: ${valid.position == 'open' ? 'up' : 'down'}`);
        garage[valid.door == 'Main Door' ? 'main' : 'side'].updateStatusKey('position', valid.position == 'open' ? 'up' : 'down');
        res.status(200).send("Door position updated successfully").end();
        logger.debug("[Event/Garage] Successfully updated door")
    } catch (err) {
        logger.error("[harIOT/Garage] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`);
    }
});



module.exports = router;
