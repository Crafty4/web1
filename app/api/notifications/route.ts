/**
 * NOTIFICATIONS API ROUTES
 * 
 * GET: Get notifications for the authenticated user
 * POST: Create a notification (internal use, called by order APIs)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * GET NOTIFICATIONS
 * 
 * Returns all notifications for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get auth token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get all notifications for this user, sorted by newest first
    const notifications = await Notification.find({ user: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Convert _id to string for JSON serialization
    const formattedNotifications = notifications.map((notification: any) => ({
      ...notification,
      _id: notification._id.toString(),
      user: notification.user?.toString(),
      orderId: notification.orderId?.toString(),
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * CREATE NOTIFICATION (INTERNAL USE)
 * 
 * Creates a notification for a user.
 * This is typically called by order API routes.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get auth token (optional for internal calls)
    const authHeader = request.headers.get("authorization");
    let decoded: any = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (error) {
        // Continue without auth for internal calls
      }
    }

    const { userId, orderId, message, type } = await request.json();

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      return NextResponse.json(
        { error: "userId is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (!orderId || typeof orderId !== "string" || orderId.trim() === "") {
      return NextResponse.json(
        { error: "orderId is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "message is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    if (!type || typeof type !== "string" || type.trim() === "") {
      return NextResponse.json(
        { error: "type is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Create notification
    const notification = new Notification({
      user: userId,
      orderId,
      message,
      type,
      read: false,
    });

    await notification.save();

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
