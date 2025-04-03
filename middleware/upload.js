const multer = require("multer");
const path = require("path");

// Allowed file types (Only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Configure Storage for Uploaded Files
const storage = multer.diskStorage({
    destination: "uploads/", // Folder where files will be stored
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

module.exports = upload;
