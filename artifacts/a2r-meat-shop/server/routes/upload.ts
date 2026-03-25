import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage location: frontend's public/uploads
// api-server runs from its package root in development
const uploadDir = path.resolve(process.cwd(), "../a2r-meat-shop/public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed!"));
  }
});

const router = Router();

// Endpoint for uploading images
router.post("/upload", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const message = err instanceof multer.MulterError ? `Upload error: ${err.message}` : err.message;
      res.status(400).json({ message });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });
});

export default router;
