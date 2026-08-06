import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();
router.post("/", protect, authorize("restaurant"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  res.status(201).json({ url: `${baseUrl}/uploads/${req.file.filename}` });
});

export default router;