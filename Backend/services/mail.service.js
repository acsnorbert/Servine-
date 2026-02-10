const nodemailer = require('nodemailer');

function createTransport(){
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

const transporter = createTransport();

async function sendMail({to, subject, message}){
    const from = process.env.SMTP_FROM;
    return await transporter.sendMail({
        from,
        to,
        subject,
        text: message
    });
}

module.exports = {
    createTransport,
    sendMail
}