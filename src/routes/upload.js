// Import Sharp for image processing
const sharp = require("sharp");

// Function to resize image
const resizeImage = (inputPath, outputPath, width, height) => {
  sharp(inputPath)
    .resize(width, height)
    .toFile(outputPath, (err, resizeImage) => {
      if (err) {
        console.error("Error resizing image:", err);
      }
      console.log("Image resized successfully");
    });
};

module.exports = {
  resizeImage,
};
