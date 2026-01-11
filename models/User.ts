/**
 * USER MODEL
 * 
 * This defines the structure of user data in the database.
 * A model is like a blueprint for what user data looks like.
 * 
 * USER FIELDS:
 * - username: unique username for login
 * - password: hashed password (never store plain passwords!)
 * - email: user's email address
 * - phone: user's phone number
 * - address: user's delivery address
 * - role: "user" or "admin" (determines what they can access)
 * - createdAt: when the account was created
 */

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Export the model
// If model already exists, use it; otherwise create a new one
export default mongoose.models.User || mongoose.model("User", UserSchema);
