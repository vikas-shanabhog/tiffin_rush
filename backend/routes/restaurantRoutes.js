import express from "express";
import {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  myRestaurant,
} from "../controllers/restaurantController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.get("/", listRestaurants);
router.get("/mine", protect, authorize("restaurant"), myRestaurant);
router.get("/:id", getRestaurant);
router.post("/", protect, authorize("restaurant"), createRestaurant);
router.put("/:id", protect, authorize("restaurant", "admin"), updateRestaurant);

export default router;
