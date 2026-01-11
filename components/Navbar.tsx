"use client";

/**
 * NAVBAR COMPONENT (SIMPLIFIED)
 * 
 * Clean navbar with only:
 * - Gallery link
 * - Cart button (only on cafe/menu page)
 * - Name & Address menu (user profile dropdown)
 * - Logout button
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Navigate after logout state update completes
    // Using requestAnimationFrame ensures the navigation happens after React finishes updating
    requestAnimationFrame(() => {
      router.push("/login");
    });
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* Brand/Logo */}
        <Link href={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/menu") : "/login"} className={styles.brand}>
          White Chillies
        </Link>

        {/* Navigation items */}
        <div className={styles.navItems}>
          {/* Gallery link */}
          {isAuthenticated && (
            <Link 
              href="/gallery" 
              className={`${styles.navLink} ${pathname === "/gallery" ? styles.active : ""}`}
            >
              Gallery
            </Link>
          )}

          {/* Notifications link (users only) */}
          {isAuthenticated && user?.role === "user" && (
            <Link 
              href="/notifications" 
              className={`${styles.navLink} ${pathname === "/notifications" ? styles.active : ""}`}
            >
              <i className="fa-solid fa-bell"></i> Notifications
            </Link>
          )}

          {/* Cart button */}
          {isAuthenticated && user?.role === "user" && (
            <Link 
              href="/cart" 
              className={`${styles.cartButton} ${pathname === "/cart" ? styles.active : ""}`}
            >
              <i className="fa-solid fa-cart-shopping"></i>
              {totalItems > 0 && (
                <span className={styles.cartBadge}>{totalItems}</span>
              )}
            </Link>
          )}

          {/* User profile dropdown */}
          {isAuthenticated && (
            <div className={styles.profileSection}>
              <button 
                className={styles.profileButton}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <i className="fa-solid fa-user"></i>
                <span>{user?.username}</span>
                <i className={`fa-solid fa-angle-${isProfileOpen ? "up" : "down"}`}></i>
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <div className={styles.profileInfo}>
                    <p className={styles.profileName}>{user?.username}</p>
                    <p className={styles.profileEmail}>{user?.email}</p>
                    <p className={styles.profilePhone}>{user?.phone}</p>
                    {user?.address && (
                      <p className={styles.profileAddress}>{user?.address}</p>
                    )}
                  </div>
                  {user?.role === "user" && (
                    <Link 
                      href="/orders" 
                      className={styles.profileLink}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <i className="fa-solid fa-clock-rotational-left"></i> Order History
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Logout button */}
          {isAuthenticated && (
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Overlay to close profile dropdown when clicking outside */}
      {isProfileOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
}

/**
 * EXPLANATION:
 * 
 * 1. useState: Manages whether the cart is open or closed
 * 2. useCart: Gets cart data from context (totalItems count)
 * 3. Conditional rendering: {totalItems > 0 && ...} only shows badge if items exist
 * 4. Props: CartSidebar receives isOpen and onClose props to control its visibility
 */
