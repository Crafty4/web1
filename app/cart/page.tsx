"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderModal from "@/components/OrderModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import styles from "./page.module.css";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, updateQuantity, totalItems, setActiveCafe, activeCafeSlug } = useCart();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "user") {
      setActiveCafe("aroma");
    }
  }, [isAuthenticated, user, setActiveCafe]);

  const handleOrderNow = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }
    setIsOrderModalOpen(true);
  };

  if (!isAuthenticated || user?.role !== "user") {
    return null;
  }

  return (
    <div>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Your Cart</h1>
          <div className={styles.subtitle}>Cafe Aroma</div>
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Your cart is empty.</p>
            <Link href="/menu" className={styles.linkButton}>Browse Menu</Link>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            <div className={styles.itemsPanel}>
              {cartItems.map((cartItem) => (
                <div key={cartItem.item.id} className={styles.cartItem}>
                  <div>
                    <p className={styles.itemName}>{cartItem.item.name}</p>
                    <p className={styles.itemPrice}>${cartItem.item.price.toFixed(2)}</p>
                  </div>
                  <div className={styles.controls}>
                    <button
                      onClick={() => {
                        if (activeCafeSlug) {
                          updateQuantity(cartItem.item.id, cartItem.quantity - 1, activeCafeSlug);
                        }
                      }}
                    >
                      -
                    </button>
                    <span>{cartItem.quantity}</span>
                    <button
                      onClick={() => {
                        if (activeCafeSlug) {
                          updateQuantity(cartItem.item.id, cartItem.quantity + 1, activeCafeSlug);
                        }
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryPanel}>
              <h3>Summary</h3>
              <p className={styles.summaryLine}>
                Items: <span>{totalItems}</span>
              </p>
              <p className={styles.summaryLine}>
                Total: <span className={styles.totalAmount}>${cartItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0).toFixed(2)}</span>
              </p>
              <button className={styles.orderButton} onClick={handleOrderNow}>
                Place Order
              </button>
              <Link href="/menu" className={styles.linkButtonSecondary}>Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <OrderModal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} />
    </div>
  );
}
