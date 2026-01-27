const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const uploadDir = "./public/temp";
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Prefix with timestamp to avoid name collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
    // Accept any audio files
    if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
    } else {
        cb(new Error("Only audio files are allowed!"), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // Limit to 500MB
    }
});

module.exports = { upload };
