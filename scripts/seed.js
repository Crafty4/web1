/**
 * DATABASE SEED SCRIPT
 * 
 * This script:
 * 1. Deletes ALL users from the database
 * 2. Creates ONLY the default admin user
 * 
 * WARNING: This will delete all existing users!
 * Run this to reset the database to only have the admin user.
 * 
 * Usage: node scripts/seed.js
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

// User schema (matches the model)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/cafe-app";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    // Delete ALL users from the database
    const deleteResult = await User.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} user(s) from database`);

    // Create ONLY the admin user
    const hashedPassword = await bcrypt.hash("pa123", 10);
    
    const adminUser = new User({
      username: "parth",
      password: hashedPassword,
      email: "parth@cafe.com",
      phone: "1234567890",
      address: "",
      role: "admin",
    });

    await adminUser.save();
    console.log("✓ Admin user 'parth' created successfully");
    console.log("  Username: parth");
    console.log("  Password: pa123");
    console.log("  Role: admin");

    // Verify only admin user exists
    const userCount = await User.countDocuments({});
    console.log(`\n✓ Database now contains ${userCount} user(s) (admin only)`);

    // Close connection
    await mongoose.connection.close();
    console.log("✓ Database connection closed");
    console.log("\n✓ Seeding completed successfully!");
    console.log("\nDatabase reset complete - only admin user exists.");
    console.log("\nYou can now login with:");
    console.log("  Username: parth");
    console.log("  Password: pa123");
    
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
