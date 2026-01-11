/**
 * GALLERY PHOTO MODEL
 *
 * Stores gallery photos managed by the admin.
 * - url: public path or external URL for the image
 * - title: optional title/caption
 */

import mongoose from "mongoose";

const GalleryPhotoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.GalleryPhoto ||
  mongoose.model("GalleryPhoto", GalleryPhotoSchema);
