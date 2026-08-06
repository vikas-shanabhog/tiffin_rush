import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import Order from "../models/Order.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Creates a hosted Stripe Checkout Session for an existing order.
// Frontend redirects the browser to the returned url.
export const createCheckoutSession = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your order" });
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery fee" },
        unit_amount: Math.round(order.deliveryFee * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/orders/${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
      metadata: { orderId: String(order._id) },
    });

    order.paymentIntentId = session.id;
    await order.save();

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Stripe webhook - marks the order paid once Checkout completes
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order = await Order.findOne({ paymentIntentId: session.id });
    if (order) {
      order.paymentStatus = "paid";
      order.status = "confirmed";
      order.statusHistory.push({ status: "confirmed" });
      await order.save();
      req.io.to(`restaurant:${order.restaurant}`).emit("order_paid", order);
      req.io.to(`order:${order._id}`).emit("order_status", {
        orderId: order._id,
        status: "confirmed",
        statusHistory: order.statusHistory,
      });
    }
  }

  res.json({ received: true });
};