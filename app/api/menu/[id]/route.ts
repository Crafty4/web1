/**
 * DELETE MENU ITEM API ROUTE (ADMIN ONLY)
 * 
 * Deletes a menu item from the database.
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
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

    const { name, price, image, description, rating, ratingCount, isAvailable } = await request.json();

    const updateData: Record<string, any> = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json({ error: "Name must be a non-empty string" }, { status: 400 });
      }
      updateData.name = name;
    }
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json({ error: "Price must be a valid positive number" }, { status: 400 });
      }
      updateData.price = priceNum;
    }
    if (image !== undefined) {
      if (typeof image !== "string" || image.trim() === "") {
        return NextResponse.json({ error: "Image must be a non-empty string" }, { status: 400 });
      }
      updateData.image = image;
    }
    if (description !== undefined) updateData.description = description;
    if (rating !== undefined) updateData.rating = Number(rating);
    if (ratingCount !== undefined) updateData.ratingCount = Number(ratingCount);
    
    // Check if item is being marked as unavailable
    const wasAvailable = await MenuItem.findById(params.id).then((item: any) => item?.isAvailable !== false);
    const isBeingMarkedUnavailable = isAvailable !== undefined && isAvailable === false && wasAvailable;

    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Auto-cancel active orders containing this item if it's being marked unavailable
    if (isBeingMarkedUnavailable) {
      try {
        // Find all active orders (pending or accepted) that contain this item
        // itemId in orders is stored as string, so we compare with params.id as string
        const activeOrders = await Order.find({
          status: { $in: ["pending", "accepted"] },
          "items.itemId": params.id.toString(),
        }).populate("user");

        // Cancel each order and send notification
        for (const order of activeOrders) {
          // Update order status to cancelled
          order.status = "cancelled";
          await order.save();

          // Get item name for notification message
          const itemInOrder = order.items.find((item: any) => item.itemId === params.id);
          const itemName = itemInOrder?.name || updatedItem.name;
          const orderShortId = order._id.toString().slice(-6).toUpperCase();

          // Create notification for the user
          const userId = (order as any).user._id.toString();
          await createNotification(
            userId,
            order._id.toString(),
            `Your order #${orderShortId} has been cancelled because the item "${itemName}" is no longer available.`,
            "order_cancelled"
          );

          console.log(`Auto-cancelled order ${order._id} due to item ${params.id} being marked unavailable`);
        }

        if (activeOrders.length > 0) {
          console.log(`Auto-cancelled ${activeOrders.length} order(s) due to item being marked unavailable`);
        }
      } catch (error) {
        console.error("Error auto-cancelling orders:", error);
        // Don't fail the request if auto-cancellation fails
      }
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    return NextResponse.json(
      { error: "Failed to update menu item" },
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

    const deletedItem = await MenuItem.findByIdAndDelete(params.id);

    if (!deletedItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
