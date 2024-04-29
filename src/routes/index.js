const express = require("express");
// import middleware
const middlewares = require("../middleware");
// import bcrypt
const bcrypt = require("bcrypt");
const passport = require("passport");
const { ObjectId } = require('mongodb');
const Swal = require('sweetalert2');


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
    // Route for adding a course
    router.get('/add-course', (req, res) => {
      console.log("Adding a course"); // Add this line
      res.render('courseEdit', { title: 'tilføj kursus' });
    });
  
    router.get('/edit-course/:id', async (req, res) => {
      try {
        console.log("Editing a course");
        const courseId = req.params.id;
        const objectId = new ObjectId(courseId);
        console.log("Course ID:", objectId);
    
        // Query the businessCourses collection
        const businessCourse = await businessCoursesCollection.findOne({ _id: objectId });
        if (businessCourse) {
          // If the course is found in the businessCourses collection, render the courseEdit template
          return res.render('courseEdit', { title: 'rediger kursus', course: businessCourse });
        }
    
        // If the course is not found in the businessCourses collection, query the privateCourses collection
        const privateCourse = await privateCoursesCollection.findOne({ _id: objectId });
        if (privateCourse) {
          // If the course is found in the privateCourses collection, render the courseEdit template
          return res.render('courseEdit', { title: 'rediger kursus', course: privateCourse });
        }
    
        // If the course is not found in either collection, return a 404 error
        res.status(404).send('Course not found');
      } catch (error) {
        console.error("Error editing course:", error);
        res.status(500).send('Internal Server Error');
      }
    });
    // Route for adding a course
router.post('/add-course', async (req, res) => {
  try {
    console.log("Adding a course");
    // Extract course data from the request body
    const { title, duration, price, description } = req.body;
    let type;
    // Check if erhvervType or privatType exists in req.body
    if ('erhvervType' in req.body) {
        type = req.body.erhvervType;
    } else if ('privatType' in req.body) {
        type = req.body.privatType;
    } else {
        // If neither property exists, handle the case as needed
        type = 'Unknown'; // or provide a default value
    }

    // Determine which collection to use based on the course type
    const collection = req.body.erhvervType ? businessCoursesCollection : privateCoursesCollection;

    // Insert the course data into the appropriate collection
    await collection.insertOne({ title, duration, price, currency: "DKK", description, target: req.body.erhvervType ? "Business" : "Private" });
    console.log("Course successfully added.")


  // Redirect based on Swal result (optional)
  res.redirect('/dashboard');
  
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).send('Internal Server Error');
  }
});
    // Route for editing a course (POST request)
    router.post('/edit-course/:id', async (req, res) => {
      try {
        console.log("Editing a course");
        const courseId = req.params.id;
        const objectId = new ObjectId(courseId);
        // Extract updated course data from the request body
        const { title, type, duration, price, description } = req.body;

        // Determine which collection to use based on the course type
        const collection = type === 'business' ? businessCoursesCollection : privateCoursesCollection;

        // Update the course data in the appropriate collection
        await collection.updateOne(
          { _id: objectId },
          { $set: { title, type, duration, price, description } }
        );

        // Redirect to a success page or the dashboard
        res.redirect('/dashboard');
      } catch (error) {
        console.error("Error editing course:", error);
        res.status(500).send('Internal Server Error');
      }
    });


router.get('/delete-course/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const objectId = new ObjectId(courseId);

    // Determine from which collection to delete the course based on its type
    const businessCourse = await businessCoursesCollection.findOne({ _id: objectId });
    const privateCourse = await privateCoursesCollection.findOne({ _id: objectId });

    if (businessCourse) {
      // Delete the course from the business courses collection
      await businessCoursesCollection.deleteOne({ _id: objectId });
    } else if (privateCourse) {
      // Delete the course from the private courses collection
      await privateCoursesCollection.deleteOne({ _id: objectId });
    } else {
      // If the course is not found, send a 404 error
      return res.status(404).send('Course not found');
    }

    // Redirect to the dashboard or any other appropriate page after deletion
    console.log("Course successfully deleted.");
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).send('Internal Server Error');
  }
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

  return router;
};
