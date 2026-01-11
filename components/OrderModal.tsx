"use client";

/**
 * ORDER MODAL COMPONENT
 * 
 * This component shows a modal (popup) form when user clicks "Order Now".
 * It collects:
 * - Customer name
 * - Phone number
 * - Address
 * 
 * After submission, it shows a confirmation and clears the cart.
 * 
 * NOTE: This is a simple example - in a real app, you would send
 * this data to a backend server.
 */

import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import styles from "./OrderModal.module.css";

type OrderModalProps = {
  isOpen: boolean; // Whether modal should be visible
  onClose: () => void; // Function to close the modal
};

export default function OrderModal({ isOpen, onClose }: OrderModalProps) {
  // Router for navigation
  const router = useRouter();
  const { user, updateUser } = useAuth();

  // Get cart functions from context
  const { cartItems, totalItems, clearCart, activeCafeSlug } = useCart();

  // Form state - React state to store form input values
  const [name, setName] = useState(user?.username || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * HANDLE FORM SUBMISSION
   * 
   * Saves order to database via API.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if all fields are filled
    if (!name || !phone || !address) {
      setError("Please fill in all fields");
      return;
    }

    // Check if cart has items
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    // Get auth token
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      setError("You must be logged in to place an order");
      return;
    }

    try {
      setLoading(true);

      // Prepare order items
      const orderItems = cartItems.map((cartItem) => ({
        itemId: cartItem.item.id,
        name: cartItem.item.name,
        price: cartItem.item.price,
        quantity: cartItem.quantity,
      }));

      // Send order to API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to place order");
        setLoading(false);
        return;
      }

      // Update user info if changed
      if (user) {
        updateUser({
          phone,
          address,
        });
      }

      // Clear the cart
      if (activeCafeSlug) {
        clearCart(activeCafeSlug);
      }

      // Close modal
      onClose();

      // Show success message
      alert("Your order has been placed successfully!");

      // Redirect to order history
      router.push("/orders");
    } catch (error) {
      console.error("Order error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  /**
   * HANDLE CLOSE
   * 
   * Closes the modal and resets the form fields.
   */
  const handleClose = () => {
    setName("");
    setPhone("");
    setAddress("");
    onClose();
  };

  // Don't render if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Complete Your Order</h1>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* Name input */}
          <p className={styles.label}>Name:</p>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Phone input */}
          <p className={styles.label}>Phone Number:</p>
          <input
            type="tel"
            className={styles.input}
            placeholder="Enter your number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Address input */}
          <p className={styles.label}>Address:</p>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {/* Total items display */}
          <span className={styles.totalItems}>
            Total items - <span className={styles.totalNumber}>{totalItems}</span>
          </span>

          {/* Submit button */}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Placing Order..." : "Complete Order"}
          </button>

          {/* Close button */}
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
          >
            Close
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * KEY CONCEPTS:
 * 
 * 1. Controlled Inputs: value={name} onChange={(e) => setName(e.target.value)}
 *    React controls the input value through state
 * 
 * 2. Form Handling: onSubmit prevents default page reload
 * 
 * 3. Event Propagation: onClick={(e) => e.stopPropagation()}
 *    Prevents clicking inside modal from closing it
 * 
 * 4. useRouter: Next.js hook for programmatic navigation
 */
