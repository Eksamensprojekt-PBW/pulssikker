var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "outlook",
  host: "smtp.office365.com",
  secure: false,
  auth: {
    user: "pulssikker@outlook.dk",
    pass: "Hejmeddig123",
  },
});

function sendEmail({ to, subject, html }) {
  var mailOptions = {
    from: "pulssikker@outlook.dk",
    to: to,
    subject: subject,
    html: html,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
