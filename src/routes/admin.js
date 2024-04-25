// GET request to fetch course details
router.get('/courses/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const course = await db.collection('courses').findOne({ _id: MongoClient.ObjectId(id) });
      res.json(course);
    } catch (error) {
      res.status(500).send('Error fetching course');
    }
  });
  
  // POST request to update course details
  router.post('/courses/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; // Ensure this includes fields like title, duration, price, description, etc.
    try {
      await db.collection('courses').updateOne({ _id: MongoClient.ObjectId(id) }, { $set: updateData });
      res.send('Course updated successfully');
    } catch (error) {
      res.status(500).send('Error updating course');
    }
  });

  