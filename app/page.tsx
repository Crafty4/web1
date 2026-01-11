/**
 * HOME PAGE
 * 
 * This is the main landing page (/) of the website.
 * In Next.js App Router, page.tsx in the app folder is the home page.
 * 
 * This page shows:
 * - Welcome message
 * - Links to different cafes
 * - Information about the cafes
 * 
 * In the old HTML version, this was index.html.
 */

"use client";

/**
 * ROOT PAGE
 * 
 * This is the landing page.
 * Redirects users based on authentication status:
 * - Not logged in → /login
 * - User → /menu
 * - Admin → /admin
 */

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/menu");
    }
  }, [isAuthenticated, user, router]);

  // Show loading while redirecting
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh",
      fontFamily: "Arial, Helvetica, sans-serif"
    }}>
      <p>Loading...</p>
    </div>
  );
}

/**
 * NOTE: This is a simplified home page.
 * In a real app, you might want to:
 * - Fetch cafe data from the data file
 * - Create a reusable CafeCard component
 * - Add more interactive features
 */
