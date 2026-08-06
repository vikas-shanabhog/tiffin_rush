import mongoose from "mongoose";

// A single review row rates either a restaurant OR a menu item — never both.
// One review per customer per target: submitting again updates the existing one.
const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index(
  { customer: 1, restaurant: 1 },
  { unique: true, partialFilterExpression: { restaurant: { $type: "objectId" } } }
);
reviewSchema.index(
  { customer: 1, menuItem: 1 },
  { unique: true, partialFilterExpression: { menuItem: { $type: "objectId" } } }
);

export default mongoose.model("Review", reviewSchema);
