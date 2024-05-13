const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "outlook",
  host: "smtp.office365.com",
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendEmail({ to, subject, html }) {
  if (!to || !subject || !html) {
    throw new Error("Missing required email parameters: to, subject, or html");
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    html: html,
  };

  return transporter
    .sendMail(mailOptions)
    .then((info) => {
      console.log(`Email sent: ${info.response}`);
      return info;
    })
    .catch((error) => {
      console.error(`Failed to send email: ${error.message}`);
      throw error;
    });
}

module.exports = sendEmail;
