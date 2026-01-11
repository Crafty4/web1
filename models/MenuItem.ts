/**
 * MENU ITEM MODEL
 * 
 * This defines the structure of menu item data in the database.
 * Menu items can be added/removed by admins.
 * 
 * MENU ITEM FIELDS:
 * - name: name of the dish
 * - price: cost in dollars
 * - image: path to the image file
 * - description: optional description of the item
 * - rating: customer rating (optional)
 * - isAvailable: whether item is currently available
 */

import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    // Average rating (kept as "rating" for backwards compatibility)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // Number of submitted ratings (used to compute the average)
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);
