const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, callBack) {
        callBack(null, '../uploads/');
    },
    filename: function(req, file, cb) {
        callBack(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
