const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const upload = require("../utils/uploadMiddleware");

module.exports = (db) => {
  router.post(
    "/course/:courseId?",
    upload.single("image"),
    async (req, res) => {
      console.log("REQ BODY: ", req.body);
      console.log("REQ FILE: ", req.file);
      const courseId = req.params.courseId;
      const { title, duration, price, description } = req.body;
      const update = {
        title,
        duration: parseInt(duration),
        price: parseFloat(price),
        description,
      };

      if (req.file) {
        console.log("Upload succesful: ", req.file);
        update.image = req.file.id;
      } else {
        console.log("Ingen fil blev uploadet");
      }

      try {
        let result;
        if (courseId) {
          console.log("Opdaterer eksisterende kursus med ID: ", courseId);
          result = await db
            .collection("courses")
            .updateOne({ _id: new ObjectId(courseId) }, { $set: update });
        } else {
          console.log("Opretter nyt kursus");
          result = await db.collection("courses").insertOne(update);
        }

        if (result.modifiedCount === 0 && result.insertedCount === 0) {
          console.error("Ingen ændringer blev foretaget i databasen");
          return res
            .status(404)
            .json({ message: "Failed to update or add course." });
        }

        console.log("Kursus blev gemt med succes: ", result);
        res.redirect("/courses"); // Juster redirect efter behov
      } catch (error) {
        console.error("Fejl ved gemning af kursus: ", error);
        return res.status(500).json({ error: error.message }); // Sørger for at sende en fejlresponse tilbage
      }
    }
  );

  // Route for viewing a single course
  router.get("/courses/:id", async (req, res) => {
    try {
      const course = await db
        .collection("courses")
        .findOne({ _id: ObjectId(req.params.id) });
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Route for adding a course
  router.get("/add-course", (req, res) => {
    console.log("Adding a course");
    res.render("courseEdit", { title: "tilføj kursus" });
  });

  // Route for editing a course (GET request)
  router.get("/edit-course/:id", async (req, res) => {
    try {
      console.log("Editing a course");
      const courseId = req.params.id;
      console.log("Course ID:", courseId);
      const course = await db
        .collection("courses")
        .findOne({ _id: ObjectId(courseId) });

      // Check if course exists
      if (!course) {
        return res.status(404).send("Course not found");
      }

      res.render("courseEdit", { title: "rediger kursus", course: course });
    } catch (error) {
      console.error("Error editing course:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
