import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const STATUS_FLOW = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items: [orderItemSchema],
    itemsTotal: Number,
    deliveryFee: Number,
    deliveryDistanceKm: Number,
    total: Number,
    status: { type: String, enum: STATUS_FLOW, default: "placed" },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
      },
    ],
    deliveryAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
      lat: Number,
      lng: Number,
    },
    deliveryLocation: { lat: Number, lng: Number },
    paymentIntentId: String,
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export const ORDER_STATUS_FLOW = STATUS_FLOW;
export default mongoose.model("Order", orderSchema);