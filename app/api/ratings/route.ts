/**
 * RATINGS API
 *
 * POST: Create/update a user rating for a menu item (users only).
 * - Validates the user has ordered the item before allowing rating.
 * - Recomputes average rating + count on the menu item.
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Rating from "@/models/Rating";
import MenuItem from "@/models/MenuItem";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const RATING_MIN = 1;
const RATING_MAX = 5;

/**
 * Verify JWT and return decoded payload
 */
function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401, decoded: null as any };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { error: null, status: 200, decoded };
  } catch (error) {
    return { error: "Invalid token", status: 401, decoded: null as any };
  }
}

/**
 * Recalculate average rating and count for a menu item and persist
 */
async function updateMenuItemAverages(menuItemId: string) {
  const aggregates = await Rating.aggregate([
    { $match: { menuItem: new mongoose.Types.ObjectId(menuItemId) } },
    {
      $group: {
        _id: "$menuItem",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const agg = aggregates[0];
  const rating = agg ? Number(agg.avg.toFixed(2)) : 0;
  const ratingCount = agg ? agg.count : 0;

  await MenuItem.findByIdAndUpdate(
    menuItemId,
    { rating, ratingCount },
    { new: true }
  );

  return { rating, ratingCount };
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Auth check
    const { error, status, decoded } = verifyToken(request);
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    if (decoded.role !== "user") {
      return NextResponse.json(
        { error: "Only users can rate items" },
        { status: 403 }
      );
    }

    const { menuItemId, rating } = await request.json();

    if (!menuItemId || rating === undefined) {
      return NextResponse.json(
        { error: "menuItemId and rating are required" },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < RATING_MIN || numericRating > RATING_MAX) {
      return NextResponse.json(
        { error: `Rating must be between ${RATING_MIN} and ${RATING_MAX}` },
        { status: 400 }
      );
    }

    // Ensure menu item exists
    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Verify user has ordered this item before allowing rating
    const hasOrdered = await Order.exists({
      user: decoded.userId,
      "items.itemId": menuItemId,
    });

    if (!hasOrdered) {
      return NextResponse.json(
        { error: "You can only rate items you have ordered" },
        { status: 403 }
      );
    }

    // Upsert rating
    await Rating.findOneAndUpdate(
      { user: decoded.userId, menuItem: menuItemId },
      { rating: numericRating },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recompute averages
    const { rating: avg, ratingCount } = await updateMenuItemAverages(menuItemId);

    return NextResponse.json({
      success: true,
      rating: avg,
      ratingCount,
    });
  } catch (err) {
    console.error("Ratings POST error:", err);
    return NextResponse.json(
      { error: "Failed to save rating" },
      { status: 500 }
    );
  }
}
