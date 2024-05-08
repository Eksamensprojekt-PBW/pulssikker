require("dotenv").config();
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    const filename = encodeURIComponent(
      `${Date.now()}-course-${file.originalname}`
    );
    console.log("Processing file:", filename);
    return {
      bucketName: "courseImages",
      filename: filename,
    };
  },
});

const upload = multer({ storage });

module.exports = upload;
