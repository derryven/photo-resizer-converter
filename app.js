const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000; // You can change this to any other port if needed.

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Configure Multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Endpoint to handle image processing
app.post("/resize", upload.single("photo"), async (req, res) => {
  const { width, height, format } = req.body;
  const filePath = req.file.path;

  try {
    const outputFileName = `resized-${Date.now()}.${format || "jpeg"}`;
    const outputPath = path.join(__dirname, "uploads", outputFileName);

    await sharp(filePath)
      .resize(parseInt(width), parseInt(height))
      .toFormat(format || "jpeg")
      .toFile(outputPath);

    fs.unlinkSync(filePath); // Remove original uploaded file
    res.download(outputPath, () => {
      fs.unlinkSync(outputPath); // Remove processed file after download
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing image.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
