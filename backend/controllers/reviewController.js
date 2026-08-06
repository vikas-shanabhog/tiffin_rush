import mongoose from "mongoose";
import Review from "../models/Review.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";

const round1 = (n) => Math.round(n * 10) / 10;

const recomputeRestaurantRating = async (restaurantId) => {
  const [stats] = await Review.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(restaurantId) } },
    { $group: { _id: "$restaurant", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: stats ? round1(stats.avg) : 4.5,
    numReviews: stats?.count || 0,
  });
};

const recomputeMenuItemRating = async (menuItemId) => {
  const [stats] = await Review.aggregate([
    { $match: { menuItem: new mongoose.Types.ObjectId(menuItemId) } },
    { $group: { _id: "$menuItem", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await MenuItem.findByIdAndUpdate(menuItemId, {
    rating: stats ? round1(stats.avg) : 0,
    numReviews: stats?.count || 0,
  });
};

// A customer can rate a restaurant once they have a delivered order from it.
const findDeliveredOrderForRestaurant = (customerId, restaurantId) =>
  Order.findOne({ customer: customerId, restaurant: restaurantId, status: "delivered" }).sort({
    createdAt: -1,
  });

// A customer can rate a specific dish once they've had it delivered in an order.
const findDeliveredOrderForMenuItem = (customerId, restaurantId, menuItemId) =>
  Order.findOne({
    customer: customerId,
    restaurant: restaurantId,
    status: "delivered",
    "items.menuItem": menuItemId,
  }).sort({ createdAt: -1 });

export const getRestaurantReviews = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  const reviews = await Review.find({ restaurant: restaurant._id })
    .populate("customer", "name")
    .sort({ createdAt: -1 });
  res.json({ reviews, average: restaurant.rating, count: restaurant.numReviews });
};

export const getMyRestaurantReview = async (req, res) => {
  const review = await Review.findOne({ customer: req.user._id, restaurant: req.params.id });
  if (review) return res.json({ eligible: true, review });
  const order = await findDeliveredOrderForRestaurant(req.user._id, req.params.id);
  res.json({ eligible: !!order, review: null });
};

export const upsertRestaurantReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

  const existing = await Review.findOne({ customer: req.user._id, restaurant: restaurant._id });
  const order = existing || (await findDeliveredOrderForRestaurant(req.user._id, restaurant._id));
  if (!order) {
    return res
      .status(403)
      .json({ message: "You can rate a restaurant once an order from it has been delivered" });
  }

  const review = await Review.findOneAndUpdate(
    { customer: req.user._id, restaurant: restaurant._id },
    { rating, comment, order: existing ? existing.order : order._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await recomputeRestaurantRating(restaurant._id);
  res.status(201).json(review);
};

export const getMenuItemReviews = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  const reviews = await Review.find({ menuItem: item._id })
    .populate("customer", "name")
    .sort({ createdAt: -1 });
  res.json({ reviews, average: item.rating, count: item.numReviews });
};

export const getMyMenuItemReview = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  const review = await Review.findOne({ customer: req.user._id, menuItem: item._id });
  if (review) return res.json({ eligible: true, review });
  const order = await findDeliveredOrderForMenuItem(req.user._id, item.restaurant, item._id);
  res.json({ eligible: !!order, review: null });
};

export const upsertMenuItemReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const existing = await Review.findOne({ customer: req.user._id, menuItem: item._id });
  const order =
    existing || (await findDeliveredOrderForMenuItem(req.user._id, item.restaurant, item._id));
  if (!order) {
    return res
      .status(403)
      .json({ message: "You can rate a dish once an order containing it has been delivered" });
  }

  const review = await Review.findOneAndUpdate(
    { customer: req.user._id, menuItem: item._id },
    { rating, comment, order: existing ? existing.order : order._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await recomputeMenuItemRating(item._id);
  res.status(201).json(review);
};
