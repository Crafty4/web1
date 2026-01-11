/**
 * GALLERY UPLOAD (ADMIN)
 *
 * Accepts multipart/form-data with "file" and optional "title".
 * Saves the file under /public/gallery and creates a DB record.
 */

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import GalleryPhoto from "@/models/GalleryPhoto";
import jwt from "jsonwebtoken";
import path from "path";
import { promises as fs } from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

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

    const form = await request.formData();
    const file = form.get("file") as File | null;
    const title = (form.get("title") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // Ensure target directory exists
    const uploadDir = path.join(process.cwd(), "public", "gallery");
    await fs.mkdir(uploadDir, { recursive: true });

    // Create unique filename
    const ext = path.extname(file.name || "") || ".jpg";
    const base = path.basename(file.name || "upload", ext).replace(/\s+/g, "-");
    const unique = `${base}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, unique);

    // Save file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Public URL path
    const publicUrl = `/gallery/${unique}`;

    // Save to DB
    const photo = await GalleryPhoto.create({ url: publicUrl, title });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Gallery UPLOAD error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
