/**
 * MONGODB CONNECTION
 * 
 * This file handles connecting to MongoDB database.
 * MongoDB is a database that stores data (users, menu items, orders).
 * 
 * HOW IT WORKS:
 * - We connect to MongoDB once when the app starts
 * - We reuse the same connection for all database operations
 * - This is more efficient than connecting/disconnecting every time
 */

import mongoose from "mongoose";

// MongoDB connection string
// In production, this would come from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/cafe-app";

// Cache the connection to avoid reconnecting on every request
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

/**
 * CONNECT TO DATABASE
 * 
 * This function connects to MongoDB if not already connected.
 * It returns the same connection if it already exists.
 */
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
