// Tests revised: Sun August 16, 2020 @ 08:34:36 EDT
const logger = require('./logger');
const monitor = require('./monitor');

global.counter = 0;
global.incidents = 0;

monitor.attach(() => { return true }, 1000, function f() { global.counter++; logger.info(`${global.counter}`); });
monitor.attach(() => { return (global.counter < 15)}, 10000, function f() { global.incidents++; logger.info(`Counter less than 15`) });
setTimeout(() => { if (global.counter < 31 || global.incidents != 2) throw new Error; process.exit(0); }, 30000);
