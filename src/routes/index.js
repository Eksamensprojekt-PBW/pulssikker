const express = require("express");

module.exports = (client) => {
  const router = express.Router();
  const db = client.db("FirstAidCourses");
  const privateCoursesCollection = db.collection("privateCourses");
  const businessCoursesCollection = db.collection("businessCourses");

  // Serve initial pages
  router.get("/", (req, res) => {
    res.render("index");
  });

  // Fetch and render business courses data directly
  router.get("/erhverv", async (req, res) => {
    try {
      const courses = await businessCoursesCollection.find({}).toArray();
      res.render("erhverv", { courses }); // Assuming you have an EJS template named "erhverv" that expects 'courses' data
    } catch (error) {
      console.error("Failed to fetch business courses:", error);
      res.status(500).render("error", { error: "Internal Server Error" }); // You can have a generic error.ejs template
    }
  });

  // Fetch and render private courses data directly
  router.get("/privat", async (req, res) => {
    try {
      const courses = await privateCoursesCollection.find({}).toArray();
      res.render("privat", { courses }); // Assuming you have an EJS template named "privat" that expects 'courses' data
    } catch (error) {
      console.error("Failed to fetch private courses:", error);
      res.status(500).render("error", { error: "Internal Server Error" });
    }
  });

  // Contact and About pages
  router.get("/kontakt", (req, res) => {
    res.render("kontakt");
  });

  router.get("/om", (req, res) => {
    res.render("om");
  });

  return router;
};
