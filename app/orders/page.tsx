"use client";

/**
 * ORDER HISTORY PAGE
 * 
 * Displays user's past orders with status information.
 * Only accessible to regular users (not admins).
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

type Order = {
  _id: string;
  items: Array<{
    itemId?: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingInputs, setRatingInputs] = useState<Record<string, number>>({});
  const [reorderLoading, setReorderLoading] = useState<string | null>(null);

  // Redirect if not authenticated or if admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    }
  }, [isAuthenticated, user, router]);

  /**
   * GET AUTH TOKEN
   */
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  /**
   * FETCH USER ORDERS FROM DATABASE
   * 
   * ALWAYS fetches fresh data from the database.
   * Never uses cached or local state.
   * This ensures orders persist across logins.
   */
  const fetchOrders = async () => {
    if (!isAuthenticated || user?.role !== "user") {
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        console.error("No authentication token found");
        setLoading(false);
        return;
      }

      // Fetch orders from API (always fresh from database)
      const response = await fetch("/api/orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
        cache: "no-store", // Ensure no caching
      });

      const data = await response.json();
      
      if (data.success && data.orders) {
        // Always replace orders with fresh data from database
        setOrders(data.orders);
      } else {
        console.error("Failed to fetch orders:", data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when component mounts or when authentication state changes
  // This ensures orders are ALWAYS fetched fresh from database on login
  useEffect(() => {
    if (isAuthenticated && user?.role === "user") {
      fetchOrders();
    } else {
      // Clear orders if not authenticated
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]); // Only depend on user ID, not entire user object

  // Refetch orders when page becomes visible (user navigates back)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "user") {
      return;
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refetch when page becomes visible (user switched back to this tab)
        fetchOrders();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  /**
   * FORMAT DATE
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * GET STATUS COLOR
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return styles.pending;
      case "accepted":
        return styles.accepted;
      case "rejected":
        return styles.rejected;
      case "completed":
        return styles.completed;
      case "cancelled":
        return styles.cancelled;
      default:
        return "";
    }
  };

  /**
   * SUBMIT RATING FOR AN ITEM THE USER ORDERED
   */
  const handleRateItem = async (menuItemId?: string) => {
    if (!menuItemId) return;
    const rating = ratingInputs[menuItemId];
    if (!rating) {
      alert("Select a rating first.");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemId, rating }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Rating saved!");
        setRatingInputs((prev) => ({ ...prev, [menuItemId]: rating }));
      } else {
        alert(data.error || "Failed to save rating");
      }
    } catch (error) {
      alert("Failed to save rating");
    }
  };

  /**
   * REORDER PREVIOUS ORDER
   */
  const handleReorder = async (order: Order) => {
    const hasAllIds = order.items.every((item) => item.itemId);
    if (!hasAllIds) {
      alert("Cannot reorder because one of the items is missing an ID.");
      return;
    }
    try {
      setReorderLoading(order._id);
      const token = getToken();
      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: order.items.map((item) => ({
            itemId: item.itemId as string,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerAddress: order.customerAddress,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Order placed again!");
        fetchOrders();
      } else {
        alert(data.error || "Failed to reorder");
      }
    } catch (error) {
      alert("Failed to reorder");
    } finally {
      setReorderLoading(null);
    }
  };

  /**
   * CANCEL ORDER (USER CANCELLATION WITHIN 5 MINUTES)
   */
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const handleCancelOrder = async (order: Order) => {
    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setCancelLoading(order._id);
      const token = getToken();
      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert("Order cancelled successfully!");
        fetchOrders();
      } else {
        alert(data.error || "Failed to cancel order");
      }
    } catch (error) {
      alert("Failed to cancel order");
    } finally {
      setCancelLoading(null);
    }
  };

  /**
   * CHECK IF ORDER IS WITHIN 5-MINUTE CANCELLATION BUFFER
   */
  const canCancelOrder = (order: Order): boolean => {
    // Cannot cancel if already rejected or cancelled
    if (order.status === "rejected" || order.status === "cancelled") {
      return false;
    }

    // Check if within 5-minute buffer
    const BUFFER_TIME_MS = 5 * 60 * 1000; // 5 minutes
    const orderCreatedAt = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const timeElapsed = currentTime - orderCreatedAt;

    return timeElapsed <= BUFFER_TIME_MS;
  };

  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }

  return (
    <div>
      <Navbar />

      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>My Orders</h1>
          <button 
            onClick={fetchOrders} 
            className={styles.refreshButton}
            disabled={loading}
            title="Refresh orders"
          >
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't placed any orders yet.</p>
            <a href="/menu" className={styles.menuLink}>Browse Menu</a>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <h3 className={styles.orderTitle}>
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`${styles.statusBadge} ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </div>
                  <div className={styles.orderActions}>
                    {canCancelOrder(order) && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancelOrder(order)}
                        disabled={cancelLoading === order._id}
                      >
                        {cancelLoading === order._id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}
                    <button
                      className={styles.reorderButton}
                      onClick={() => handleReorder(order)}
                      disabled={reorderLoading === order._id}
                    >
                      {reorderLoading === order._id ? "Reordering..." : "Reorder"}
                    </button>
                  </div>
                </div>

                <div className={styles.orderDetails}>
                  <div className={styles.orderItems}>
                    <h4>Items Ordered:</h4>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQuantity}>x {item.quantity}</span>
                          <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                          {item.itemId && (
                            <span className={styles.ratingControls}>
                              <select
                                value={ratingInputs[item.itemId] || ""}
                                onChange={(e) =>
                                  setRatingInputs((prev) => ({
                                    ...prev,
                                    [item.itemId as string]: Number(e.target.value),
                                  }))
                                }
                              >
                                <option value="">Rate</option>
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <option key={num} value={num}>
                                    {num}
                                  </option>
                                ))}
                              </select>
                              <button onClick={() => handleRateItem(item.itemId)}>Save</button>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                      <span>Total Amount:</span>
                      <span className={styles.totalAmount}>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
