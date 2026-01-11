/**
 * ORDER MODEL
 * 
 * This defines the structure of order data in the database.
 * Orders are created when users place orders from the cart.
 * 
 * ORDER FIELDS:
 * - user: reference to the user who placed the order
 * - items: array of items in the order (name, price, quantity)
 * - totalAmount: total cost of the order
 * - status: order status (pending, accepted, rejected, completed)
 * - customerName: name of the customer
 * - customerPhone: phone number
 * - customerAddress: delivery address
 */

import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
