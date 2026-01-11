/**
 * RATING MODEL
 *
 * Stores individual user ratings for menu items.
 * - Each user can have at most one rating per menu item (unique compound index).
 */

import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per user per menu item
RatingSchema.index({ user: 1, menuItem: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
