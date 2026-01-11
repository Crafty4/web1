/**
 * NOTIFICATION MODEL
 * 
 * This defines the structure of notification data in the database.
 * Notifications are created when order status changes.
 * 
 * NOTIFICATION FIELDS:
 * - user: reference to the user who should receive the notification
 * - orderId: reference to the order this notification is about
 * - message: the notification message
 * - type: type of notification (order_placed, order_accepted, order_rejected, order_completed, order_cancelled)
 * - read: whether the user has read the notification
 */

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order_placed", "order_accepted", "order_rejected", "order_completed", "order_cancelled"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
