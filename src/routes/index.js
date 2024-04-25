const express = require("express");
// import middleware
const middlewares = require("../middleware");
// import bcrypt
const bcrypt = require("bcrypt");
const passport = require("passport");

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

  /*
  router.get("/login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true
  }));
  */

  router.get("/registrer", (req, res) => {
    res.render("registrer");
  });

  router.post("/registrer", async (req, res) => {
    const hashedUsername = await bcrypt.hash(req.body.password, 10);
    const hashedEmail = await bcrypt.hash(req.body.email, 10);
    const hashedPassword = await bcrypt.hash(req.body.username, 10);
    try {
      //---------------- udskift med database entry istede ---------------------
      // add database logic here to add user to database
      users.push({
        id: Date.now().toString(),
        name: hashedUsername,
        email: hashedEmail,
        password: hashedPassword
      })
    } catch (error) {
      res.redirect("/registrer")
    }
    console.log(users);
  })

  // Other routes...

  return router;
};
