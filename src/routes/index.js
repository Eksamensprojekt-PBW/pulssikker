// routes/index.js
const express = require("express");
// import middleware
const middlewares = require("../middleware");
// import bcrypt
const bcrypt = require("bcrypt");
const passport = require("passport");

//---------------- udskift med database istede ---------------------
const { users } = require('../app');


// We export a function that will accept the database client
module.exports = (client) => {
  const router = express.Router();

  // Access the database collections
  const db = client.db("FirstAidCourses");
  const privateCoursesCollection = db.collection("privateCourses");
  const businessCoursesCollection = db.collection("businessCourses");

  // Define routes here using the passed-in collections
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/erhverv", async (req, res) => {
    try {
      const courses = await businessCoursesCollection.find({}).toArray();
      res.json(courses);
      res.render("erhverv");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/privat", async (req, res) => {
    try {
      const courses = await privateCoursesCollection.find({}).toArray();
      res.json(courses);
      res.render("privat");
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/kontakt", (req, res) => {
    res.render("kontakt");
  });

  router.get("/om", (req, res) => {
    res.render("om");
  });

  router.get("/login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true
  }));

  router.get("/registrer", (req, res) => {
    res.render("registrer");
  });

  router.post("/registrer", async (req, res) => {
    try {
      //---------------- udskift med database entry istede ---------------------
      // add database logic here to add user to database

      users.push({
        id: Date.now().toString(),
        name: hashedUsername = await bcrypt.hash(req.body.password, 10),
        email: hashedEmail = await bcrypt.hash(req.body.email, 10),
        password: hashedPassword = await bcrypt.hash(req.body.username, 10)
      })
    } catch (error) {
      res.redirect("/registrer")
    }
    console.log(users);
  })

  // Other routes...

  return router;
};
