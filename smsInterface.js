// Script modified: Sun August 23, 2020 @ 04:29:14 EDT
const logger = require('./logger');
var mailer = require("nodemailer");
require('dotenv/config');

// Use Smtp Protocol to send Email
var smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.NODEMAIL_USER,
        pass: process.env.NODEMAIL_PASS
    }
});

var mail = {
    from: "harIOT Mailer <harIOTnotice@gmail.com>",
    to: "7347878645@vtext.com",
    subject: "TEST",
    text: "Node.js New world for me",
}
var sms = {
    send: function send(mail) {
    try {
        smtpTransport.sendMail(mail, function(error, response){
            if(error){
                logger.error(`Error: ${error}`);
            } else {
                logger.debug("Message sent: " + response.message);
            }

            smtpTransport.close();
        });
    } catch (err) {
        logger.error("error sending message");
        logger.error(`> ${err}`);
    }
},
    recipient(name = 'all'){
        var mailList;
        switch (name) {
            case 'emma':
            mailList =
                `${process.env.PHONE_NUM_E}@vtext.com`;
            break;
            case 'jen':
            mailList =
                `${process.env.PHONE_NUM_J}@vtext.com`;
                break;
            case 'kyle':
            mailList =
                `${process.env.PHONE_NUM_K}@vtext.com`;
            break;
            case 'scott':
            mailList =
                `${process.env.PHONE_NUM_S}@vtext.com`;
                break;
            default:
            logger.warn("No valid familiar recipient selected");
            case 'all':
            mailList =
                `${process.env.PHONE_NUM_E}@vtext.com,` +
                `${process.env.PHONE_NUM_J}@vtext.com,` +
                `${process.env.PHONE_NUM_K}@vtext.com,` +
                `${process.env.PHONE_NUM_S}@vtext.com`;
        }
        return mailList;
    }
}

module.exports = sms;
