"use client";

/**
 * MENU PAGE (CAFE AROMA)
 * 
 * This is the main menu page for Cafe Aroma.
 * Users are redirected here after login.
 * Menu items are fetched from the database.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import MenuCard from "@/components/MenuCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import styles from "./page.module.css";

type MenuItem = {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  isAvailable?: boolean;
};

export default function MenuPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { setActiveCafe } = useCart();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or if admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  // Set active cafe and fetch menu items
  useEffect(() => {
    if (isAuthenticated && user?.role === "user") {
      setActiveCafe("aroma"); // Single cafe: Cafe Aroma
      fetchMenuItems();
    }
  }, [isAuthenticated, user, setActiveCafe]);

  /**
   * FETCH MENU ITEMS FROM DATABASE
   * 
   * Gets all menu items from the API.
   */
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/menu");
      const data = await response.json();

      if (data.success) {
        setMenuItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }

  return (
    <div>
      <Navbar />

      {/* Header section with cafe name */}
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Cafe Aroma Menu</h1>
          <Link href="/cart" className={styles.cartLink}>
            <i className="fa-solid fa-cart-shopping"></i> View Cart
          </Link>
        </div>
      </section>

      {/* Menu items section */}
      <section className={styles.menuSection}>
        {loading ? (
          <div className={styles.loading}>Loading menu...</div>
        ) : (
          <div className={styles.menuGrid}>
            {menuItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No menu items available at the moment.</p>
              </div>
            ) : (
              menuItems.map((item) => (
                <MenuCard 
                  key={item._id} 
                  item={{
                    id: item._id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    rating: item.rating || 0,
                    ratingCount: item.ratingCount || 0,
                    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
                  }} 
                  cafeSlug="aroma" 
                />
              ))
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
