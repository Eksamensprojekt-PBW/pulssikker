const nodemailer = require("nodemailer");

// Create a transporter object using the default SMTP transport for Outlook
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com", // Outlook's SMTP server
  port: 587, // SMTP port for Outlook
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

// sendEmail function to be used in the routes
const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // Your Outlook email
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
