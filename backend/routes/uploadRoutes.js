import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Restaurant owners upload a restaurant/menu-item photo, get back a URL
// to save on the Restaurant.image or MenuItem.image field.
router.post("/", protect, authorize("restaurant"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
