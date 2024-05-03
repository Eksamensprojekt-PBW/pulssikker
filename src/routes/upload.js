const express = require("express");
const router = express.Router();
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const sharp = require("sharp");

// Create mongo connection
const conn = mongoose.createConnection(process.env.MONGO_URI, {});

// Init gfs
let gfs;
conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log("GridFS Bucket connected successfully");
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          console.error("Error generating file name:", err);
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        console.log("File info:", fileInfo);
        resolve(fileInfo);
      });
    });
  },
  options: { useNewUrlParser: true }, // Removed useUnifiedTopology since it's deprecated

  transformFile: (req, file, cb) => {
    const transformer = sharp()
      .webp({ quality: 50 }) // Adjust quality from 0-100
      .on("error", function (err) {
        console.error("Error during image transformation:", err);
        cb(err);
      });

    console.log("Transforming file:", file.originalname);
    cb(null, transformer);
  },
});

const upload = multer({ storage });

// Upload route
router.post("/image", upload.single("image"), (req, res) => {
  console.log(
    "Handling upload for:",
    req.file ? req.file.originalname : "No file"
  );
  if (req.fileValidationError) {
    console.error("File validation error:", req.fileValidationError);
    return res.status(400).json({ message: req.fileValidationError });
  }
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).json({ message: "Please upload a file!" });
  }
  console.log("Uploaded file:", req.file);
  res.status(201).json({ file: req.file });
});

// Enhanced Route to list all files with management options in GridFS
router.get("/image/:filename", async (req, res) => {
  try {
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file[0] || file.length === 0) {
      return res.status(404).send("No file found");
    }
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get image route for viewing/downloading by filename
router.get("/download/:filename", async (req, res) => {
  try {
    console.log("Downloading file:", req.params.filename);
    const file = await gfs.find({ filename: req.params.filename }).toArray();
    if (!file[0] || file.length === 0) {
      console.error("File not found:", req.params.filename);
      return res.status(404).json({ err: "No file exists" });
    }
    res.set("Content-Type", file[0].contentType);
    res.set(
      "Content-Disposition",
      `attachment; filename="${file[0].filename}"`
    );
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete image route by file ID
router.delete("/delete/:fileId", async (req, res) => {
  try {
    console.log("Deleting file:", req.params.fileId);
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    await gfs.delete(fileId);
    console.log("File deleted:", req.params.fileId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(404).json({ err: err.message });
  }
});

module.exports = upload;
