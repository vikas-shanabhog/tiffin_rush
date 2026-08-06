import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    cuisine: [String],
    description: String,
    image: String,
    address: { line1: String, city: String, lat: Number, lng: Number },
    isOpen: { type: Boolean, default: true },
    rating: { type: Number, default: 4.5 },
    numReviews: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 30 },
    minOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
