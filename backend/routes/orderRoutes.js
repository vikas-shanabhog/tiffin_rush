import express from "express";
import {
  placeOrder,
  getOrder,
  myOrders,
  restaurantOrders,
  updateOrderStatus,
  updateDeliveryLocation,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
router.post("/", protect, authorize("customer"), placeOrder);
router.get("/mine", protect, myOrders);
router.get("/restaurant", protect, authorize("restaurant"), restaurantOrders);
router.get("/:id", protect, getOrder);
router.patch("/:id/status", protect, authorize("restaurant", "delivery", "admin"), updateOrderStatus);
router.patch("/:id/location", protect, authorize("delivery"), updateDeliveryLocation);

export default router;
