const express = require("express");
const router = express.Router();
const uploadMiddleware = require("../utils/uploadMiddleware");

router.post("/image", uploadMiddleware.single("image"), (req, res) => {
  try {
    // File is now saved in the 'public/img' directory
    console.log(req.file); // Log the file information
    res
      .status(200)
      .json({ message: "Image uploaded successfully", file: req.file });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error uploading image", error: error.message });
  }
});

module.exports = router;
