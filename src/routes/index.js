const express = require("express");
// import middleware
const middlewares = require("../middleware");
// import bcrypt
const bcrypt = require("bcrypt");
const passport = require("passport");
// Import collection
const collection = require("../config");
const bodyParser = require('body-parser');

const userController = require("../controllers/usercontroller");

module.exports = (client) => {
  const router = express.Router();
  const dbAccounts = client.db("Accounts");
  const dbCourses = client.db("FirstAidCourses");
  const privateCoursesCollection = dbCourses.collection("privateCourses");
  const businessCoursesCollection = dbCourses.collection("businessCourses");
  const accountsCollection = dbAccounts.collection("users");
  
  // Serve initial pages
  router.get("/", (req, res) => {
    res.render("index");
  });

  // Fetch and render business courses data directly
  router.get("/erhverv", async (req, res) => {
    try {
      const courses = await businessCoursesCollection.find({}).toArray();
      res.render("erhverv", { courses }); 
    } catch (error) {
      console.error("Failed to fetch business courses:", error);
      res.status(500).render("error", { error: "Internal Server Error" }); // You can have a generic error.ejs template
    }
  });

  // Fetch and render private courses data directly
  router.get("/privat", async (req, res) => {
    try {
      const courses = await privateCoursesCollection.find({}).toArray();
      res.render("privat", { courses });
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
  router.get("/dashboard", async (req, res) => {
    try {
    const businessCourses = await businessCoursesCollection.find({}).toArray();
    const privateCourses = await privateCoursesCollection.find({}).toArray();
    const courses = [...businessCourses, ...privateCourses];
      res.render("dashboard", {courses});
    } catch (error){
      console.error("Failed to fetch courses: ", error);
      res.status(500).render("error", { error: "Internal Server Error" });
    }
      
  });

  /*
  router.get("/login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true
  }));
  */

  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.get("/registrer", (req, res) => {
    res.render("registrer");
  });


  router.post("/registrer", userController.createUser);

  /*
  // Register user
  router.post("/registrer", async (req, res) => {
    const data = {
      email: req.body.email,
      name: req.body.username,
      password: req.body.password
    }

    const userdata = await collection.insertMany(data);
    console.log(userdata);
    
  });

  */

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
