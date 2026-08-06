import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", protect, authorize("restaurant"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image uploaded" });
  res.status(201).json({ url: req.file.path });
});

export default router;