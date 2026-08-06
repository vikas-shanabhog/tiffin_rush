import MenuItem from "../models/MenuItem.js";
import Restaurant from "../models/Restaurant.js";

const ensureOwnership = async (restaurantId, userId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) return null;
  if (String(restaurant.owner) !== String(userId)) return false;
  return restaurant;
};

export const getMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate("restaurant", "name");
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
};

export const addMenuItem = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) return res.status(400).json({ message: "Create a restaurant first" });
  const item = await MenuItem.create({ ...req.body, restaurant: restaurant._id });
  res.status(201).json(item);
};

export const updateMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  const restaurant = await Restaurant.findById(item.restaurant);
  if (String(restaurant.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your menu item" });
  }
  Object.assign(item, req.body);
  await item.save();
  res.json(item);
};

export const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  const restaurant = await Restaurant.findById(item.restaurant);
  if (String(restaurant.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your menu item" });
  }
  await item.deleteOne();
  res.json({ message: "Deleted" });
};
