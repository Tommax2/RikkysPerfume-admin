const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const verifyToken = require("../middleware/auth");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Keep file in memory — upload directly to Cloudinary, nothing saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "rikkys-perfume/products", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  try {
    const result = await uploadBuffer(req.file.buffer);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    res.status(500).json({ error: "Image upload failed" });
  }
});

module.exports = router;
