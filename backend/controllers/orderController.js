import Order, { ORDER_STATUS_FLOW } from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem from "../models/MenuItem.js";
import { distanceKm, deliveryFeeForDistance } from "../utils/geo.js";

export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const menuItems = await MenuItem.find({
      _id: { $in: items.map((i) => i.menuItem) },
    });

    let itemsTotal = 0;
    const orderItems = items.map((i) => {
      const menuItem = menuItems.find((m) => String(m._id) === String(i.menuItem));
      if (!menuItem) throw new Error("Invalid menu item in order");
      const lineTotal = menuItem.price * i.quantity;
      itemsTotal += lineTotal;
      return {
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: i.quantity,
      };
    });

    // Distance-based delivery fee when we have coordinates for both ends;
    // otherwise fall back to the restaurant's flat deliveryFee.
    let deliveryFee = restaurant.deliveryFee;
    let deliveryDistanceKm;
    if (
      deliveryAddress?.lat != null &&
      deliveryAddress?.lng != null &&
      restaurant.address?.lat != null &&
      restaurant.address?.lng != null
    ) {
      deliveryDistanceKm = distanceKm(
        restaurant.address.lat,
        restaurant.address.lng,
        deliveryAddress.lat,
        deliveryAddress.lng
      );
      deliveryFee = deliveryFeeForDistance(deliveryDistanceKm);
    }

    const total = itemsTotal + deliveryFee;

    const order = await Order.create({
      customer: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,
      itemsTotal,
      deliveryFee,
      deliveryDistanceKm,
      total,
      deliveryAddress,
      statusHistory: [{ status: "placed" }],
    });

    req.io.to(`restaurant:${restaurant._id}`).emit("new_order", order);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("restaurant", "name image address")
    .populate("customer", "name phone");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const myOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate("restaurant", "name image")
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const restaurantOrders = async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });
  if (!restaurant) return res.status(404).json({ message: "No restaurant" });
  const orders = await Order.find({ restaurant: restaurant._id })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });
  res.json(orders);
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUS_FLOW.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const restaurant = await Restaurant.findById(order.restaurant);
  const isOwner = String(restaurant.owner) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  const isDelivery = req.user.role === "delivery";
  if (!isOwner && !isAdmin && !isDelivery) {
    return res.status(403).json({ message: "Not allowed to update this order" });
  }

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  req.io.to(`order:${order._id}`).emit("order_status", {
    orderId: order._id,
    status,
    statusHistory: order.statusHistory,
  });

  res.json(order);
};

export const updateDeliveryLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.deliveryLocation = { lat, lng };
  await order.save();

  req.io.to(`order:${order._id}`).emit("delivery_location", { orderId: order._id, lat, lng });
  res.json({ message: "Location updated" });
};