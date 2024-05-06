const express = require("express");

//const userController = require("../controllers/usercontroller");
const { ObjectId } = require("mongodb");
// Initialize SweetAlert2
const Swal = require("sweetalert2");
Swal.fire();

/*
 Authentication middleware
    User everywhere authentication is needed
    
    example:
    app.get('/dashboard', isAuthenticated, (req, res) => {
      res.render('dashboard');
    });
*/
function isAuthenticated(req, res, next) {
  if (req.session.user) {
      next();
  } else {
      res.redirect('/login');
  }
}


module.exports = (client) => {
  const router = express.Router();
  const dbCourses = client.db("FirstAidCourses");
  const dbInstructors = client.db("Instructors");
  const privateCoursesCollection = dbCourses.collection("privateCourses");
  const businessCoursesCollection = dbCourses.collection("businessCourses");
  const instructorsCollection = dbInstructors.collection("instructors");

  // Serve initial pages
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/upload", (req, res) => {
    res.render("upload");
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

  router.get("/om", async (req, res) => {
    try {
      const instructors = await instructorsCollection.find({}).toArray();
      res.render("om", { instructors });
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      res.status(500).render("error", { error: "Internal Server Error" });
    }
  });
  router.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
      const businessCourses = await businessCoursesCollection
        .find({})
        .toArray();
      const privateCourses = await privateCoursesCollection.find({}).toArray();
      const courses = [...businessCourses, ...privateCourses];
      const instructors = await instructorsCollection.find({}).toArray();
      res.render("dashboard", { courses, instructors });
    } catch (error) {
      console.error("Failed to fetch courses: ", error);
      res.status(500).render("error", { error: "Internal Server Error" });
    }
  });
  // Route for adding a course
  router.get("/add-course", (req, res) => {
    console.log("Adding a course"); // Add this line
    res.render("courseEdit", { title: "tilføj kursus" });
  });

  router.get("/edit-course/:id", async (req, res) => {
    try {
      console.log("Editing a course");
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);
      console.log("Course ID:", objectId);

      // Query the businessCourses collection
      const businessCourse = await businessCoursesCollection.findOne({
        _id: objectId,
      });
      if (businessCourse) {
        console.log(businessCourse);
        // If the course is found in the businessCourses collection, render the courseEdit template
        return res.render("courseEdit", {
          title: "rediger kursus",
          course: businessCourse,
        });
      }

      // If the course is not found in the businessCourses collection, query the privateCourses collection
      const privateCourse = await privateCoursesCollection.findOne({
        _id: objectId,
      });
      if (privateCourse) {
        console.log(privateCourse);

        // If the course is found in the privateCourses collection, render the courseEdit template
        return res.render("courseEdit", {
          title: "rediger kursus",
          course: privateCourse,
        });
      }

      // If the course is not found in either collection, return a 404 error
      res.status(404).send("Course not found");
    } catch (error) {
      console.error("Error editing course:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  // Route for adding a course
  router.post("/add-course", async (req, res) => {
    try {
      console.log("Adding a course");
      // Extract course data from the request body
      const { title, courseType, duration, price, description } = req.body;

      // Determine which collection to use based on the course type
      const collection =
        courseType === "Business"
          ? businessCoursesCollection
          : privateCoursesCollection;

      // Insert the course data into the appropriate collection
      await collection.insertOne({
        title,
        duration,
        price,
        currency: "DKK",
        description,
        target: courseType,
      });

      console.log("Course added.");
      setTimeout(() => {
        res.redirect("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error adding course:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  // Route for editing a course (POST request)
  router.post("/edit-course/:id", async (req, res) => {
    try {
      console.log("Editing a course");
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);
      // Extract updated course data from the request body
      const { title, courseOrigin, courseType, duration, price, description } =
        req.body;
      console.log(req.body);

      //Checking it the course type
      if (courseOrigin == courseType) {
        //If the course type hhasn't changed
        // Determine which collection to use based on the course type
        const collection =
          courseType === "Business"
            ? businessCoursesCollection
            : privateCoursesCollection;
        // Update the course data in the appropriate collection
        await collection.updateOne(
          { _id: objectId },
          { $set: { title, duration, price, description, target: courseType } }
        );
      } else if (courseOrigin !== courseType) {
        // If the course type has changed, move the course to the appropriate collection
        const collectionOrigin =
          courseOrigin === "Business"
            ? businessCoursesCollection
            : privateCoursesCollection;
        const collectionDestination =
          courseOrigin === "Business"
            ? privateCoursesCollection
            : businessCoursesCollection;

          // Find the course in the original collection
          await collectionOrigin.updateOne(
            { _id: objectId },
            { $set: { title, duration, price, description, target: courseType } }
          );
          const originalCourse = await collectionOrigin.findOne({ _id: objectId });
          
          // Insert the course into the destination collection
          await collectionDestination.insertOne(originalCourse);

        // Delete the original course from the original collection
        await collectionOrigin.deleteOne({ _id: objectId });
      }

      console.log("Course updated.");

      setTimeout(() => {
        res.redirect("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error editing course:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.get("/delete-course/:id", async (req, res) => {
    try {
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);

      // Determine from which collection to delete the course based on its type
      const businessCourse = await businessCoursesCollection.findOne({
        _id: objectId,
      });
      const privateCourse = await privateCoursesCollection.findOne({
        _id: objectId,
      });

      if (businessCourse) {
        // Delete the course from the business courses collection
        await businessCoursesCollection.deleteOne({ _id: objectId });
      } else if (privateCourse) {
        // Delete the course from the private courses collection
        await privateCoursesCollection.deleteOne({ _id: objectId });
      } else {
        // If the course is not found, send a 404 error
        return res.status(404).send("Course not found");
      }

      // Redirect to the dashboard or any other appropriate page after deletion
      console.log("Course successfully deleted.");
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for adding an instructor-------------------------------
  router.get("/add-instructor", (req, res) => {
    console.log("Adding an instructor"); // Add this line
    res.render("instructorEdit", { title: "tilføj instruktør" });
  });

  router.get("/edit-instructor/:id", async (req, res) => {
    try {
      console.log("Editing an instructor");
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);
      console.log("Course ID:", objectId);

      const instructor = await instructorsCollection.findOne({ _id: objectId });
      if (instructor) {
        return res.render("instructorEdit", {
          title: "rediger instruktør",
          instructor: instructor,
        });
      }
      res.status(404).send("Instructor not found");
    } catch (error) {
      console.error("Error editing instructor:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  // Route for adding an instructor
  router.post("/add-instructor", async (req, res) => {
    try {
      console.log("Adding an instructor");

      const { name, description } = req.body;
      await instructorsCollection.insertOne({ name, description });

      console.log("Instructor added.");
      setTimeout(() => {
        res.redirect("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error adding course:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Route for editing an instructor
  router.post("/edit-instructor/:id", async (req, res) => {
    try {
      console.log("Editing an instructor");
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);
      const { name, description } = req.body;

      await instructorsCollection.updateOne(
        { _id: objectId },
        { $set: { name, description } }
      );

      setTimeout(() => {
        res.redirect("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error editing instructor:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  router.get("/delete-instructor/:id", async (req, res) => {
    try {
      const courseId = req.params.id;
      const objectId = new ObjectId(courseId);

      const instructor = await instructorsCollection.findOne({ _id: objectId });

      if (instructor) {
        await instructorsCollection.deleteOne({ _id: objectId });
      } else {
        return res.status(404).send("Instructor not found");
      }

      console.log("Instructor successfully deleted.");
      res.redirect("/dashboard");
    } catch (error) {
      console.error("Error deleting instructor:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
