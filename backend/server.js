import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { registerSocketHandlers } from "./socket.js";

import authRoutes from "./routes/authRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*" },
});
registerSocketHandlers(io);

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

// Stripe webhook needs the raw body, so it's registered before express.json()
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  req.io = io;
  stripeWebhook(req, res, next);
});

app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Uploaded restaurant/menu images are served from here, e.g. /uploads/169...-photo.jpg
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
