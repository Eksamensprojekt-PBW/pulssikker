const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const sendEmail = require("../utils/mailer");
const { ObjectId } = require("mongodb");
require("dotenv").config();

module.exports = (db) => {
  router.post("/order-course", [
    body('courseId').custom(value => ObjectId.isValid(value)).withMessage('Invalid course ID'),
    body('name').trim().escape(),
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('company').optional().trim().escape(),
    body('additionalInfo').optional().trim().escape()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, name, email, company, additionalInfo } = req.body;

    if (!ObjectId.isValid(courseId)) {
      return res.status(400).send("Invalid course ID.");
    }

    let course =
      (await db
        .collection("businessCourses")
        .findOne({ _id: new ObjectId(courseId) })) ||
      (await db
        .collection("privateCourses")
        .findOne({ _id: new ObjectId(courseId) }));

    if (!course) {
      return res.status(404).send("Course not found.");
    }

    const emailBody = `
    <h1>Course Order Received</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
    <p><strong>Course Title:</strong> ${course.title}</p>
    <p><strong>Additional Information:</strong> ${additionalInfo}</p>
  `;

    // Send email to pulssikker@outlook.dk
    try {
      await sendEmail({
        to: "pulssikker@outlook.dk",
        subject: `New Course Order - ${course.title}`,
        html: emailBody,
      });

      // Send a thank you email to the user
      await sendEmail({
        to: email, // E-mail indtastet af brugeren i formularen
        subject: "Tak for din bestilling",
        html: `<p>Kære ${name},</p><p>Tak fordi du har tilmeldt dig kurset: ${course.title}.</p><p>Vi vil snart kontakte dig med flere oplysninger.</p><p>Med venlig hilsen,</p><p>Pulssikker</p>`,
      });

      res.render("index", { currentPage: "index" });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).send("There was an error processing your order.");
    }
  });

  return router;
};
