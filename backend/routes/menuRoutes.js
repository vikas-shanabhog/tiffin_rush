import express from "express";
import {
  getMenuItem,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../controllers/menuController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.get("/:id", getMenuItem);
router.post("/", protect, authorize("restaurant"), addMenuItem);
router.put("/:id", protect, authorize("restaurant"), updateMenuItem);
router.delete("/:id", protect, authorize("restaurant"), deleteMenuItem);

export default router;
