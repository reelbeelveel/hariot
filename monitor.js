// Script modified: Sun August 16, 2020 @ 08:28:22 EDT
const logger = require('./logger');

function evaluate(process, condition, callback) {
    console.log("interval");
    logger.debug("Evaluating condition");
    if(condition() && process.cooledDown) {
        logger.debug("Evaluated true");
        callback();
        process.cooledDown = false;
        setTimeout((process) => {
        process.cooledDown = true;
        }, process.cooldown, process);
    } else {
        logger.debug("Evaluated false");
    }
}

class Process { //                     3,600,000ms = 1 hour
    constructor(condition, cooldown = (1000*60*60), callback) {
        console.log("hello?");
        try {
            this.cooledDown = true;
            this.cooldown = cooldown;
            evaluate(this, condition, callback)
            setInterval((process, condition, callback) => { evaluate(process, condition, callback) }, 300, this, condition, callback);
        } catch (err) {
            console.log(err);
        }
    }
}

var monitor = {
    attach: function(condition, cooldown, callback) {
        new Process(condition, cooldown, callback);
    },
}

module.exports = monitor;
