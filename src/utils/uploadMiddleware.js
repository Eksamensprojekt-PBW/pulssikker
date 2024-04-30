const multer = require("multer");
const path = require("path");

// Set up multer to store images in the public/img directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Correct the path to move up one level from 'src/utils' to the root, then into 'public/img'
    cb(null, path.join(__dirname, "../../public/img"));
  },
  filename: function (req, file, cb) {
    // Use Date.now() to prefix the file name and prevent overwriting
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Only allow image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
