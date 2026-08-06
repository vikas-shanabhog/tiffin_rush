import express from "express";
import {
  getRestaurantReviews,
  getMyRestaurantReview,
  upsertRestaurantReview,
  getMenuItemReviews,
  getMyMenuItemReview,
  upsertMenuItemReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/restaurant/:id", getRestaurantReviews);
router.get("/restaurant/:id/mine", protect, getMyRestaurantReview);
router.post("/restaurant/:id", protect, authorize("customer"), upsertRestaurantReview);

router.get("/menu/:id", getMenuItemReviews);
router.get("/menu/:id/mine", protect, getMyMenuItemReview);
router.post("/menu/:id", protect, authorize("customer"), upsertMenuItemReview);

export default router;
