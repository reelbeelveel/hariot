// Script modified: Fri August 14, 2020 @ 09:15:00 EDT
const express = require('express');
const heartbeat = require('../heartbeat');
const garage = hearbeat.deviceList.garage;
const joi = require('@hapi/joi');
const logger = require('../logger');
const path = require('path');
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
    logger.debug("[harIOT/Garage] POST call to '/:door/:position' ");
    try {
        const valid = await fileSchema.validateAsync(req.params);
        logger.debug("[harIOT/Garage] Successfully validated parameters");
        logger.debug(`> door: ${valid.door}`);
        logger.debug(`> position: ${valid.position}`);
        garage[valid.door].updateStatusKey('position', valid.position);
    } catch (err) {
        logger.error("[harIOT/Garage] Error:");
        logger.error(`> error: ${error}`);
        throw new Error(err);
    }

}})

module.exports = router;
