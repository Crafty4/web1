"use client";

/**
 * NOTIFICATIONS PAGE
 * 
 * Displays user notifications with order status updates.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

type Notification = {
  _id: string;
  orderId: string;
  message: string;
  type: "order_placed" | "order_accepted" | "order_rejected" | "order_completed" | "order_cancelled";
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

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
   * FETCH NOTIFICATIONS
   */
  const fetchNotifications = async () => {
    if (!isAuthenticated || user?.role !== "user") {
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * MARK NOTIFICATION AS READ
   */
  const markAsRead = async (notificationId: string) => {
    try {
      const token = getToken();
      if (!token) {
        return;
      }

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  /**
   * FORMAT DATE
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * GET NOTIFICATION TYPE CLASS
   * Returns CSS class based on notification type for color coding
   */
  const getNotificationTypeClass = (type: string) => {
    switch (type) {
      case "order_placed":
        return styles.typePlaced;
      case "order_accepted":
        return styles.typeAccepted;
      case "order_rejected":
        return styles.typeRejected;
      case "order_cancelled":
        return styles.typeCancelled;
      case "order_completed":
        return styles.typeCompleted;
      default:
        return "";
    }
  };

  // Fetch notifications when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === "user") {
      fetchNotifications();
    }
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated || user?.role === "admin") {
    return null;
  }

  return (
    <div>
      <Navbar />

      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <button 
            onClick={fetchNotifications} 
            className={styles.refreshButton}
            disabled={loading}
            title="Refresh notifications"
          >
            <i className="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You have no notifications yet.</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ""} ${getNotificationTypeClass(notification.type)}`}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div className={styles.notificationContent}>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <p className={styles.notificationDate}>
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.read && (
                  <span className={styles.unreadBadge}>New</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
