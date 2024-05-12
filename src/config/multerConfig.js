const multer = require('multer');
const path = require('path');

// Correcting the storage path using path.resolve to ensure the correct absolute path
const storage = multer.diskStorage({
    destination: function(req, file, callBack) {
        // Ensuring the directory exists
        const uploadDir = path.resolve(__dirname, '../uploads'); // Adjust the path as necessary
        callBack(null, uploadDir);
    },
    filename: function(req, file, callBack) {
        // Generates a unique filename with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + path.extname(file.originalname);
        callBack(null, filename);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
