const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/mailer");
const { ObjectId } = require("mongodb"); // Ensure this is the correct import

module.exports = (db) => {
  // Route to handle course order form submission
  router.post("/order-course", async (req, res) => {
    const { courseId, name, email, company, additionalInfo } = req.body;

    let course;
    try {
      // Validate and use the courseId to fetch the course details
      if (!ObjectId.isValid(courseId)) {
        throw new Error("Invalid course ID.");
      }
      course = await db
        .collection("courses")
        .findOne({ _id: new ObjectId(courseId) });
      if (!course) {
        throw new Error("Course not found.");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      return res.status(400).send("Invalid course ID or course not found.");
    }

    // Construct the email body with the course and order details
    const emailBody = `
      <h1>Course Order Received</h1>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
      <p><strong>Course Title:</strong> ${course.title}</p>
      <p><strong>Additional Information:</strong> ${additionalInfo}</p>
    `;

    // Attempt to send the email
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL, // Admin email from environment variables
        subject: `New Course Order - ${course.title}`,
        html: emailBody,
      });
      res.send("Order has been sent successfully.");
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).send("There was an error processing your order.");
    }
  });

  return router;
};
