/**
 * ORDERS API ROUTES
 * 
 * GET: Get orders (admin gets all, user gets their own)
 * POST: Create a new order
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { createNotification } from "@/lib/notifications";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const AUTO_CANCEL_MINUTES = 2; // Pending orders older than this will be cancelled automatically

/**
 * GET ORDERS
 * 
 * Admin: Gets all orders
 * User: Gets only their own orders
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

    // Auto-cancel pending orders older than threshold
    const cancelBefore = new Date(Date.now() - AUTO_CANCEL_MINUTES * 60 * 1000);
    await Order.updateMany(
      { status: "pending", createdAt: { $lt: cancelBefore } },
      { status: "cancelled" }
    );

    // If admin, get all orders; if user, get only their orders
    // Always fetch fresh from database - no caching
    let orders;
    if (decoded.role === "admin") {
      orders = await Order.find()
        .populate("user", "username email")
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance
    } else {
      // User: get ONLY orders that belong to this user (by userId)
      orders = await Order.find({ user: decoded.userId })
        .sort({ createdAt: -1 })
        .lean(); // Use lean() for better performance
    }

    // Convert _id to string for JSON serialization
    orders = orders.map((order: any) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user ? {
        _id: order.user._id?.toString(),
        username: order.user.username,
        email: order.user.email,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * CREATE ORDER
 * 
 * Creates a new order from cart items.
 */
export async function POST(request: NextRequest) {
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

    // Get order data
    const { items, customerName, customerPhone, customerAddress } =
      await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: "Customer information is required" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create order with user reference
    // The user field links this order to the logged-in user
    const order = new Order({
      user: decoded.userId, // Link order to user ID from JWT token
      items,
      totalAmount,
      status: "pending",
      customerName,
      customerPhone,
      customerAddress,
    });

    // Save order to database (permanent storage)
    await order.save();

    // Create notification for order placed
    await createNotification(
      decoded.userId,
      order._id.toString(),
      `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed successfully.`,
      "order_placed"
    );

    // Log order creation for debugging
    console.log(`Order created: ${order._id} for user: ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
