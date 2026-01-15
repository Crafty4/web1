/**
 * UPDATE USER CREDENTIALS API ROUTE
 * 
 * Allows authenticated users (both regular users and admins) to update their own username and/or password.
 * 
 * POST /api/auth/update-credentials
 * Body: { username?: string, password?: string }
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

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

    // Get update data
    const { username, password } = await request.json();

    // Validate that at least one field is provided
    if (!username && !password) {
      return NextResponse.json(
        { error: "At least one field (username or password) must be provided" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update username if provided
    if (username !== undefined) {
      // Validate username
      if (typeof username !== "string" || username.trim() === "") {
        return NextResponse.json(
          { error: "Username must be a non-empty string" },
          { status: 400 }
        );
      }

      const trimmedUsername = username.trim();

      // Check if username is already taken by another user
      const existingUser = await User.findOne({
        username: trimmedUsername,
        _id: { $ne: decoded.userId }, // Exclude current user
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }

      user.username = trimmedUsername;
    }

    // Update password if provided
    if (password !== undefined) {
      // Validate password
      if (typeof password !== "string" || password.trim() === "") {
        return NextResponse.json(
          { error: "Password must be a non-empty string" },
          { status: 400 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      user.password = hashedPassword;
    }

    // Save updated user
    await user.save();

    // Return updated user data (without password)
    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Update credentials error:", error);

    // Handle duplicate username error (MongoDB unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update credentials" },
      { status: 500 }
    );
  }
}
