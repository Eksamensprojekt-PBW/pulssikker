const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');


module.exports = (db) => {
  router.get('/courses/:id', async (req, res) => {
    try {
      const course = await db.collection('courses').findOne({ _id: ObjectId(req.params.id) });
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  return router;
};
