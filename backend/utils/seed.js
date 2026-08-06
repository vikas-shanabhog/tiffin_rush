// Quick demo-data seeder: node utils/seed.js
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Restaurant.deleteMany({}), MenuItem.deleteMany({})]);

  const owner = await User.create({
    name: "Ravi Kumar",
    email: "owner@example.com",
    password: "password123",
    role: "restaurant",
  });

  const restaurant = await Restaurant.create({
    owner: owner._id,
    name: "Malgudi Tiffins",
    cuisine: ["South Indian", "Breakfast"],
    description: "Crisp dosas and filter coffee since 1998.",
    address: { line1: "MG Road", city: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    deliveryFee: 25,
    minOrder: 100,
  });

  await User.findByIdAndUpdate(owner._id, { restaurant: restaurant._id });

  await MenuItem.insertMany([
    { restaurant: restaurant._id, name: "Masala Dosa", price: 90, category: "Tiffins", isVeg: true },
    { restaurant: restaurant._id, name: "Idli Vada Combo", price: 80, category: "Tiffins", isVeg: true },
    { restaurant: restaurant._id, name: "Filter Coffee", price: 40, category: "Beverages", isVeg: true },
  ]);

  await User.create({
    name: "Test Customer",
    email: "customer@example.com",
    password: "password123",
    role: "customer",
  });

  console.log("Seed complete. Login with owner@example.com / customer@example.com, password: password123");
  await mongoose.disconnect();
};

run();
