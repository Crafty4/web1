/**
 * UPDATE ORDER STATUS API ROUTE (ADMIN ONLY)
 * 
 * Updates the status of an order (accept, reject, complete).
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { createNotification } from "@/lib/notifications";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401, decoded: null as any };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") {
      return { error: "Unauthorized - admin access required", status: 403, decoded: null as any };
    }
    return { error: null, status: 200, decoded };
  } catch (error) {
    return { error: "Invalid token", status: 401, decoded: null as any };
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Get new status from request
    const { status: newStatus } = await request.json();

    if (
      !newStatus ||
      !["pending", "accepted", "rejected", "completed", "cancelled"].includes(newStatus)
    ) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status: newStatus },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Create notification for the user based on status change
    // Get user ID from order (user field is ObjectId, convert to string)
    const userId = order.user.toString();
    const orderId = order._id.toString();
    const orderShortId = orderId.slice(-6).toUpperCase();

    let notificationMessage = "";
    let notificationType: "order_accepted" | "order_rejected" | "order_completed" | "order_cancelled" = "order_accepted";

    switch (newStatus) {
      case "accepted":
        notificationMessage = `Your order #${orderShortId} has been accepted.`;
        notificationType = "order_accepted";
        break;
      case "rejected":
        notificationMessage = `Your order #${orderShortId} has been rejected.`;
        notificationType = "order_rejected";
        break;
      case "completed":
        notificationMessage = `Your order #${orderShortId} has been completed.`;
        notificationType = "order_completed";
        break;
      case "cancelled":
        notificationMessage = `Your order #${orderShortId} has been cancelled.`;
        notificationType = "order_cancelled";
        break;
    }

    if (notificationMessage) {
      await createNotification(userId, orderId, notificationMessage, notificationType);
    }

    console.log(`Order ${order._id} status updated to: ${newStatus}`);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

/**
 * USER CANCEL ORDER (USER ONLY)
 * 
 * Allows users to cancel their own orders within 5 minutes of creation.
 * Works even if admin has accepted the order.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get order from database
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user owns this order
    if (order.user.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Unauthorized - you can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if order is already rejected (don't allow cancellation)
    if (order.status === "rejected") {
      return NextResponse.json(
        { error: "Cannot cancel a rejected order" },
        { status: 400 }
      );
    }

    // Check if order is already cancelled
    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Check 5-minute buffer time (backend enforcement)
    const BUFFER_TIME_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
    const orderCreatedAt = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const timeElapsed = currentTime - orderCreatedAt;

    if (timeElapsed > BUFFER_TIME_MS) {
      return NextResponse.json(
        { error: "Cancellation window has expired. Orders can only be cancelled within 5 minutes of placement." },
        { status: 400 }
      );
    }

    // Cancel the order
    order.status = "cancelled";
    await order.save();

    // Create notification for order cancelled
    await createNotification(
      decoded.userId,
      order._id.toString(),
      `Your order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled.`,
      "order_cancelled"
    );

    console.log(`Order ${order._id} cancelled by user ${decoded.userId} within buffer time`);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { error, status } = await verifyAdmin(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const deleted = await Order.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
