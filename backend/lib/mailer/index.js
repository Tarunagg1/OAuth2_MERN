'use strict';

const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD // generated ethereal password
    }
});

const sendMail = async (to, subject, template, data, event) => {
    let mail = {
        from: process.env.EMAIL, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: template,
    };
    try {
        let info = await transporter.sendMail(mail);
        return true;
    } catch (error) {
        return false;
    }
};



const commonMailFunctionToAll = (dataToCompile) => {
    try {
        let Subject = dataToCompile?.subject;
        return sendMail(dataToCompile.to, Subject, dataToCompile.html);
    } catch (e) {
        console.log(e);
    }
};


module.exports.sendMail = sendMail;
module.exports.commonMailFunctionToAll = commonMailFunctionToAll;