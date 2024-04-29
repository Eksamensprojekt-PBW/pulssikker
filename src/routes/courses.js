const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

module.exports = (db) => {
  // Route for viewing a single course
  router.get('/courses/:id', async (req, res) => {
    try {
      const course = await db.collection('courses').findOne({ _id: ObjectId(req.params.id) });
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Route for adding a course
  router.get('/add-course', (req, res) => {4
    console.log("Adding a course"); 
    res.render('courseEdit', { title: 'tilføj kursus' });
  });

   // Route for editing a course (GET request)
router.get('/edit-course', async (req, res) => {
  try {
    console.log("Editing a course");
    const courseId = req.params.id;
    console.log("Course ID:", courseId);
    const course = await db.collection('courses').findOne({ _id: ObjectId(courseId) });

    // Check if course exists
    if (!course) {
      return res.status(404).send('Course not found');
    }

    res.render('courseEdit', { title: 'rediger kursus', course: course });
  } catch (error) {
    console.error("Error editing course:", error);
    res.status(500).send('Internal Server Error');
  }
});

  return router;
};

