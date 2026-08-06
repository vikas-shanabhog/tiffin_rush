import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import User from "../models/User.js";

export const listRestaurants = async (req, res) => {
  const { city, search } = req.query;
  const filter = {};
  if (city) filter["address.city"] = new RegExp(city, "i");
  if (search) filter.name = new RegExp(search, "i");
  const restaurants = await Restaurant.find(filter).sort({ rating: -1 });
  res.json(restaurants);
};

export const getRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  const menu = await MenuItem.find({ restaurant: restaurant._id });
  res.json({ restaurant, menu });
};

export const createRestaurant = async (req, res) => {
  const restaurant = await Restaurant.create({ ...req.body, owner: req.user._id });
  await User.findByIdAndUpdate(req.user._id, { restaurant: restaurant._id });
  res.status(201).json(restaurant);
};

export const updateRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
  if (String(restaurant.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not your restaurant" });
  }
  Object.assign(restaurant, req.body);
  await restaurant.save();
  res.json(restaurant);
};

export const myRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) return res.status(404).json({ message: "No restaurant yet" });
  const menu = await MenuItem.find({ restaurant: restaurant._id });
  res.json({ restaurant, menu });
};
