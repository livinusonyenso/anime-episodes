const nodemailer = require('nodemailer');

function makeTransport() {
  const secure = String(process.env.SMTP_SECURE).toLowerCase() === 'true';

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // allows shared hosting / mailtrap
    },
  });

  return transporter;
}

async function sendMail(to, subject, html) {
  const transporter = makeTransport();
  const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
  return transporter.sendMail({ from, to, subject, html });
}

module.exports = { sendMail };
