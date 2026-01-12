/**
 * GALLERY API
 *
 * GET: List all gallery photos (public)
 * POST: Add a gallery photo (admin only)
 *  - Supports JSON body with { url, title }
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function GET() {
  try {
    await connectDB();
    const photos = await GalleryPhoto.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, photos });
  } catch (error) {
    console.error("Gallery GET error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { url, title } = body || {};
    
    if (!url || typeof url !== "string" || url.trim() === "") {
      return NextResponse.json({ error: "url is required and must be a non-empty string" }, { status: 400 });
    }

    const photo = await GalleryPhoto.create({ url: url.trim(), title: title ? String(title).trim() : "" });
    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Gallery POST error:", error);
    return NextResponse.json({ error: "Failed to add photo" }, { status: 500 });
  }
}
