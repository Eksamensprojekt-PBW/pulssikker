const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    console.log("Processing file:", file.originalname);
    return {
      bucketName: "courseImages",
      filename: `${Date.now()}-course-${file.originalname}`,
    };
  },
});

// Export the multer instance configured with GridFsStorage
const upload = multer({ storage: storage });

module.exports = upload;
