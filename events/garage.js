// Script modified: Mon August 17, 2020 @ 11:29:03 EDT
const express = require('express');
const heartbeat = require('../heartbeat');
const garage = heartbeat.devices.garage;
const joi = require('@hapi/joi');
const logger = require('../logger');
const router = express.Router();

const doorEvent = joi.object({
    door: joi.string()
    .regex(/^(main|side)$/)
    .required(),
    position: joi.string()
    .regex(/^(up|down)$/)
    .required()
});

router.post('/:door/:position', async (req, res) => {
    logger.debug("[Event/Garage] POST call to '/:door/:position' ");
    try {
        const valid = await doorEvent.validateAsync(req.params);
        logger.debug("[Event/Garage] Successfully validated parameters");
        logger.debug(`> door: ${valid.door}`);
        logger.debug(`> position: ${valid.position}`);
        garage[valid.door].updateStatusKey('position', valid.position);
        res.status(200).send("Door position updated successfully").end();
        logger.debug("[Event/Garage] Successfully updated door")
    } catch (err) {
        logger.error("[harIOT/Garage] Error:");
        logger.error(`> ${err}`);
        res.status(400).send(`Bad request: ${err}`);
    }
});



module.exports = router;
