/**
 * MENU API ROUTES
 * 
 * GET: Get all menu items
 * POST: Add a new menu item (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

/**
 * GET ALL MENU ITEMS
 * 
 * Returns all available menu items.
 * Anyone can access this (public endpoint).
 */
export async function GET() {
  try {
    await connectDB();

    // Auto-restore unavailable items at 9 AM (server time) every day
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if it's after 9:00 AM (9:00 = hour 9, minute 0)
    if (currentHour > 9 || (currentHour === 9 && currentMinute >= 0)) {
      // Get today's date at 9:00 AM
      const todayAt9AM = new Date(now);
      todayAt9AM.setHours(9, 0, 0, 0);

      // Update all unavailable items to available if they were marked unavailable before today's 9 AM
      // This ensures items are restored once per day at 9 AM
      const result = await MenuItem.updateMany(
        {
          isAvailable: false,
          updatedAt: { $lt: todayAt9AM }, // Items updated before today's 9 AM
        },
        {
          isAvailable: true,
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`Auto-restored ${result.modifiedCount} items at 9 AM`);
      }
    }

    // Get all menu items (both available and unavailable), sorted by creation date
    // Users need to see unavailable items (but disabled) for better UX
    const menuItems = await MenuItem.find().sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      items: menuItems,
    });
  } catch (error) {
    console.error("Get menu items error:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

/**
 * ADD MENU ITEM (ADMIN ONLY)
 * 
 * Creates a new menu item.
 * Only admins can do this.
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get auth token from headers
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - no token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token and check if user is admin
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - admin access required" },
        { status: 403 }
      );
    }

    // Get menu item data
    const { name, price, image, description, rating } = await request.json();

    if (!name || !price || !image) {
      return NextResponse.json(
        { error: "Name, price, and image are required" },
        { status: 400 }
      );
    }

    // Create new menu item
    const menuItem = new MenuItem({
      name,
      price: parseFloat(price),
      image,
      description: description || "",
      rating: rating || 0,
      isAvailable: true,
    });

    await menuItem.save();

    return NextResponse.json({
      success: true,
      item: menuItem,
    });
  } catch (error) {
    console.error("Add menu item error:", error);
    return NextResponse.json(
      { error: "Failed to add menu item" },
      { status: 500 }
    );
  }
}
