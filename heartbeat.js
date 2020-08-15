// Script modified: Fri August 14, 2020 @ 09:15:00 EDT
const fs = require('fs');
const logger = require('./logger');
//const path = require('path');
//const status = require('./pulse');
require('dotenv/config');

var deviceVector = new Array;

function logStatus() {
    var pulse = fs.createWriteStream('./pulse.js')
    pulse.write("var devicePulse = [");
    deviceVector.forEach(el => {
        pulse.write(`{\nid: '${el.id}',`);
        pulse.write('status: {');
        Object.keys(el.status).forEach(key => {
            pulse.write(`${key}: "${el.status[key]}",`);
        });
        pulse.write(`},\ntime: ${el.time}\n},`);
    });
    pulse.write(`{ time: ${Date.now()}}\n];\nmodule.exports = devicePulse;`);
}

class Device {
    constructor(id, status) {
        this.id = id;
        if (status.type == 'string') status = { status: `${status}` };
        this.status = status;
        logger.debug("[Heartbeat][Device Constructor] Created new device");
        logger.debug(`> id: ${id}`);
        logger.debug(`> status: ${status}`);
        this.time = Date.now();
        deviceVector.push(this);
        logStatus();
    }
    static getStatus(x) {
        return x.status; 
    }
    statusOfKey(key = undefined) {
        if (key == undefined) {
            var errMsg = "[Heartbeat][Device.statusOfKey] Error: no key defined";
            logger.error(errMsg);
            logger.error(`> this.id: ${this.id}`);
            throw new Error(errMsg);
        }
        return this.status[key];
    }
    updateStatus(newStatus = null) {
        logger.debug("[harIOT/Heartbeat][Device updateStatus]")
        logger.debug(`> id: ${this.id}`);
        logger.debug(`> newStatus: ${newStatus}`);
        if(newStatus == null) {
            logger.warn("[harIOT/Heartbeat] Updating status to null");
            logger.warn(`> id: ${this.id}`);
            newStatus = { status: 'errored' }
        }
        if (newStatus.type == 'string') newStatus = { newStatus: `${newStatus}` };
        this.status = newStatus;
        this.time = Date.now();
        logStatus();
    }
    updateStatusKey(key, status = undefined) {
        logger.debug("[harIOT/Heartbeat][Device updateStatusKey]");
        logger.debug(`> id: ${this.id}`);
        logger.debug(`> key: ${key}`);
        logger.debug(`> status: ${status}`);
        this.status[key] = status;
        this.time = Date.now();
        logStatus();
    }
}

var deviceList = {
    garage: {
        main: new Device('garageMainDoor', { position: undefined }),
        side: new Device('garageSideDoor', { position: undefined })
    },
    location: {
        emma:       new Device('locationEmma',      { familiarLocation: undefined, geoLocation: undefined }),
        jennifer:   new Device('locationJennifer',  { familiarLocation: undefined, geoLocation: undefined }),
        kyle:       new Device('locationKyle',      { familiarLocation: undefined, geoLocation: undefined }),
        scott:      new Device('locationScott',     { familiarLocation: undefined, geoLocation: undefined })
    }
};

const heartbeat = {
    device: Device,
    devices: deviceList,
    takePulse: logStatus(),
}

module.exports = heartbeat;
