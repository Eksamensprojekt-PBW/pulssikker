const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/mailer");
const { ObjectId } = require("mongodb");
require("dotenv").config();

module.exports = (db) => {
  router.post("/order-course", async (req, res) => {
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
        to: email, // Email entered by the user in the form
        subject: "Thank You for Your Order",
        html: `<p>Dear ${name},</p><p>Thank you for signing up for the course: ${course.title}.</p><p>We will be in touch with more information soon.</p>`,
      });

      res.render("index", { currentPage: "index" });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).send("There was an error processing your order.");
    }
  });

  return router;
};
