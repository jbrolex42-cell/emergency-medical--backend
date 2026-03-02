const multer = require("multer");
const storage = multer.memoryStorage();
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg"
];

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },

  fileFilter: (req, file, cb) => {

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, and WebP images are allowed")
      );
    }

    cb(null, true);
  }
});

module.exports = upload;