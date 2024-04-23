// routes/index.js
const express = require("express");

// We export a function that will accept the database client
module.exports = (client) => {
  const router = express.Router();

  // Access the database collections
  const db = client.db("FirstAidCourses");
  const privateCoursesCollection = db.collection("privateCourses");
  const businessCoursesCollection = db.collection("businessCourses");

  // Define routes here using the passed-in collections
  router.get("/privat", async (req, res) => {
    try {
      const courses = await privateCoursesCollection.find({}).toArray();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/erhverv", async (req, res) => {
    try {
      const courses = await businessCoursesCollection.find({}).toArray();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Other routes...

  return router;
};
