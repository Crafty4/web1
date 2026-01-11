/**
 * NOTIFICATION HELPER FUNCTIONS
 * 
 * Helper functions to create notifications when order events occur.
 */

import connectDB from "./mongodb";
import Notification from "@/models/Notification";

/**
 * CREATE NOTIFICATION
 * 
 * Creates a notification for a user about an order status change.
 */
export async function createNotification(
  userId: string,
  orderId: string,
  message: string,
  type: "order_placed" | "order_accepted" | "order_rejected" | "order_completed" | "order_cancelled"
) {
  try {
    await connectDB();

    const notification = new Notification({
      user: userId,
      orderId,
      message,
      type,
      read: false,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications are non-critical
    return null;
  }
}
