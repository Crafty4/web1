/**
 * ROOT LAYOUT
 * 
 * The layout.tsx file wraps all pages in your Next.js app.
 * This is where you put things that should appear on EVERY page:
 * - HTML structure (<html>, <body>)
 * - Font Awesome icons (used in navbar)
 * - CartProvider (so cart context is available everywhere)
 * 
 * In Next.js App Router, the layout wraps all pages automatically.
 */

import type { Metadata } from "next";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Chillies Cafés",
  description: "Experience a world of flavors across our unique café locations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome icons - used in navbar */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        {/* 
          AUTH PROVIDER & CART PROVIDER
          AuthProvider manages authentication state (login/logout)
          CartProvider manages shopping cart state
          Both wrap the entire app so all components can use them
        */}
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

/**
 * EXPLANATION:
 * 
 * 1. Root Layout: Wraps all pages automatically
 * 
 * 2. Metadata: Defines page title and description (used in browser tab)
 * 
 * 3. CartProvider: Makes cart state available to all components
 * 
 * 4. children: This is where page content gets inserted
 */
