"use client";

/**
 * ADMIN DASHBOARD
 * 
 * Dashboard for administrators to:
 * - Manage menu items (add/remove)
 * - View and manage orders (accept/reject/complete)
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  user?: {
    username: string;
    email: string;
  };
};

type GalleryPhoto = {
  _id: string;
  url: string;
  title?: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "gallery">("orders");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    rating: "",
  });

  // New menu item form state
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user?.role !== "admin") {
      router.push("/menu");
    }
  }, [isAuthenticated, user, router]);

  // Fetch data when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchMenuItems();
      fetchOrders();
      fetchGalleryPhotos();
    }
  }, [isAuthenticated, user]);

  /**
   * GET AUTH TOKEN
   * Helper to get token for API calls
   */
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  };

  /**
   * FETCH GALLERY PHOTOS
   */
  const fetchGalleryPhotos = async () => {
    try {
      setGalleryLoading(true);
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) {
        setGalleryPhotos(data.photos);
      }
    } catch (e) {
      console.error("Failed to fetch gallery photos:", e);
    } finally {
      setGalleryLoading(false);
    }
  };

  /**
   * ADD PHOTO BY URL
   */
  const handleAddPhotoByUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) {
      alert("Please enter an image URL or upload a file.");
      return;
    }
    try {
      const token = getToken();
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: newPhotoUrl.trim(), title: newPhotoTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setNewPhotoUrl("");
        setNewPhotoTitle("");
        fetchGalleryPhotos();
        alert("Photo added to gallery");
      } else {
        alert(data.error || "Failed to add photo");
      }
    } catch (error) {
      alert("Failed to add photo");
    }
  };

  /**
   * UPLOAD PHOTO FILE
   */
  const handleUploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) {
      alert("Choose a file to upload");
      return;
    }
    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);
    if (newPhotoTitle) formData.append("title", newPhotoTitle);
    try {
      const token = getToken();
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        input.value = "";
        setNewPhotoTitle("");
        fetchGalleryPhotos();
        alert("Photo uploaded");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      alert("Failed to upload photo");
    }
  };

  /**
   * DELETE GALLERY PHOTO
   */
  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Delete this photo from gallery?")) return;
    try {
      const token = getToken();
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchGalleryPhotos();
      } else {
        alert(data.error || "Failed to delete photo");
      }
    } catch (error) {
      alert("Failed to delete photo");
    }
  };

  /**
   * FETCH MENU ITEMS
   */
  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.items);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  /**
   * FETCH ORDERS
   */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ADD MENU ITEM
   */
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.image) {
      alert("Please fill in all required fields");
      return;
    }

    // Normalize image path - ensure it starts with "/"
    let imagePath = newItem.image.trim();
    if (imagePath && !imagePath.startsWith("/") && !imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
      imagePath = "/" + imagePath;
    }

    try {
      const token = getToken();
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newItem,
          image: imagePath,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewItem({ name: "", price: "", image: "", description: "" });
        fetchMenuItems(); // Refresh menu
        alert("Menu item added successfully!");
      } else {
        alert(data.error || "Failed to add item");
      }
    } catch (error) {
      alert("Failed to add menu item");
    }
  };

  /**
   * DELETE MENU ITEM
   */
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchMenuItems(); // Refresh menu
        alert("Menu item deleted successfully!");
      } else {
        alert(data.error || "Failed to delete item");
      }
    } catch (error) {
      alert("Failed to delete menu item");
    }
  };

  /**
   * ENTER EDIT MODE
   */
  const startEditing = (item: MenuItem) => {
    setEditingItemId(item._id);
    setEditForm({
      name: item.name,
      price: item.price.toString(),
      image: item.image,
      description: item.description || "",
      rating: item.rating?.toString() || "",
    });
  };

  /**
   * SAVE EDITED MENU ITEM
   */
  const handleSaveEdit = async (id: string) => {
    if (!editForm.name || !editForm.price) {
      alert("Name and price are required");
      return;
    }

    let imagePath = editForm.image.trim();
    if (imagePath && !imagePath.startsWith("/") && !imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
      imagePath = "/" + imagePath;
    }

    try {
      const token = getToken();
      const response = await fetch(`/api/menu/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          price: editForm.price,
          image: imagePath,
          description: editForm.description,
          rating: editForm.rating ? parseFloat(editForm.rating) : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingItemId(null);
        fetchMenuItems();
        alert("Menu item updated");
      } else {
        alert(data.error || "Failed to update item");
      }
    } catch (error) {
      alert("Failed to update menu item");
    }
  };

  /**
   * CANCEL EDIT MODE
   */
  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  /**
   * UPDATE ORDER STATUS
   */
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        fetchOrders(); // Refresh orders
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch (error) {
      alert("Failed to update order");
    }
  };

  /**
   * DELETE ORDER (ADMIN)
   */
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Delete this order permanently?")) return;
    try {
      const token = getToken();
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error || "Failed to delete order");
      }
    } catch (error) {
      alert("Failed to delete order");
    }
  };

  /**
   * MARK ITEM AS UNAVAILABLE
   */
  const handleMarkItemUnavailable = async (itemId: string) => {
    if (!itemId) {
      alert("Item ID not found");
      return;
    }

    if (!confirm("Mark this item as unavailable?")) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/menu/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: false }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Item marked as unavailable");
        fetchMenuItems();
      } else {
        alert(data.error || "Failed to mark item as unavailable");
      }
    } catch (error) {
      alert("Failed to mark item as unavailable");
    }
  };

  /**
   * MARK ITEM AS AVAILABLE
   */
  const handleMarkItemAvailable = async (itemId: string) => {
    if (!confirm("Add this item back to the menu?")) return;

    try {
      const token = getToken();
      const response = await fetch(`/api/menu/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAvailable: true }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Item added back to menu");
        fetchMenuItems();
      } else {
        alert(data.error || "Failed to mark item as available");
      }
    } catch (error) {
      alert("Failed to mark item as available");
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div>
      <Navbar />

      <div className={styles.dashboard}>
        <h1 className={styles.dashboardTitle}>Admin Dashboard</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "orders" ? styles.active : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={`${styles.tab} ${activeTab === "menu" ? styles.active : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            Menu Management
          </button>
          <button
            className={`${styles.tab} ${activeTab === "gallery" ? styles.active : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Order Management</h2>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className={styles.emptyState}>No orders yet</p>
            ) : (
              <div className={styles.ordersColumns}>
                <div className={styles.ordersColumn}>
                  <h3>Pending / Accepted</h3>
                  {orders
                    .filter((order) => order.status === "pending" || order.status === "accepted")
                    .map((order) => (
                      <div key={order._id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <h3 className={styles.orderCustomer}>{order.customerName}</h3>
                            <p className={styles.orderInfo}>
                              Phone: {order.customerPhone} | Address: {order.customerAddress}
                            </p>
                            {order.user && (
                              <p className={styles.orderUser}>User: {order.user.username} ({order.user.email})</p>
                            )}
                          </div>
                          <div className={styles.orderStatus}>
                            <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.orderItems}>
                          <h4>Items:</h4>
                          <ul>
                            {order.items.map((item, index) => (
                              <li key={index} className={styles.orderItemRow}>
                                {item.itemId && (
                                  <button
                                    className={styles.markUnavailableButton}
                                    onClick={() => handleMarkItemUnavailable(item.itemId!)}
                                    title="Mark as unavailable"
                                  >
                                    Mark as Unavailable
                                  </button>
                                )}
                                <span>{item.name} - ${item.price} x {item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <p className={styles.orderTotal}>Total: ${order.totalAmount.toFixed(2)}</p>
                        </div>

                        <div className={styles.orderActions}>
                          {order.status === "pending" && (
                            <>
                              <button
                                className={styles.acceptButton}
                                onClick={() => handleUpdateOrderStatus(order._id, "accepted")}
                              >
                                Accept
                              </button>
                              <button
                                className={styles.rejectButton}
                                onClick={() => handleUpdateOrderStatus(order._id, "rejected")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === "accepted" && (
                            <>
                              <button
                                className={styles.completeButton}
                                onClick={() => handleUpdateOrderStatus(order._id, "completed")}
                              >
                                Mark Completed
                              </button>
                              <button
                                className={styles.rejectButton}
                                onClick={() => handleUpdateOrderStatus(order._id, "rejected")}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            className={styles.deleteOrderButton}
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className={styles.ordersColumn}>
                  <h3>Completed Orders</h3>
                  {orders
                    .filter((order) => order.status === "completed")
                    .map((order) => (
                      <div key={order._id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <h3 className={styles.orderCustomer}>{order.customerName}</h3>
                            <p className={styles.orderInfo}>
                              Phone: {order.customerPhone} | Address: {order.customerAddress}
                            </p>
                            {order.user && (
                              <p className={styles.orderUser}>User: {order.user.username} ({order.user.email})</p>
                            )}
                          </div>
                          <div className={styles.orderStatus}>
                            <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.orderItems}>
                          <h4>Items:</h4>
                          <ul>
                            {order.items.map((item, index) => (
                              <li key={index}>
                                <span>{item.name} - ${item.price} x {item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <p className={styles.orderTotal}>Total: ${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className={styles.orderActions}>
                          <button
                            className={styles.deleteOrderButton}
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                <div className={styles.ordersColumn}>
                  <h3>Rejected / Cancelled</h3>
                  {orders
                    .filter((order) => order.status === "rejected" || order.status === "cancelled")
                    .map((order) => (
                      <div key={order._id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <h3 className={styles.orderCustomer}>{order.customerName}</h3>
                            <p className={styles.orderInfo}>
                              Phone: {order.customerPhone} | Address: {order.customerAddress}
                            </p>
                            {order.user && (
                              <p className={styles.orderUser}>User: {order.user.username} ({order.user.email})</p>
                            )}
                          </div>
                          <div className={styles.orderStatus}>
                            <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className={styles.orderItems}>
                          <h4>Items:</h4>
                          <ul>
                            {order.items.map((item, index) => (
                              <li key={index}>
                                <span>{item.name} - ${item.price} x {item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                          <p className={styles.orderTotal}>Total: ${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className={styles.orderActions}>
                          <button
                            className={styles.deleteOrderButton}
                            onClick={() => handleDeleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Management Tab */}
        {activeTab === "menu" && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Menu Management</h2>

            {/* Unavailable Items Section */}
            <div className={styles.unavailableSection}>
              <h3>Unavailable Items</h3>
              {menuItems.filter((item) => item.isAvailable === false).length === 0 ? (
                <p className={styles.emptyState}>No unavailable items</p>
              ) : (
                <div className={styles.itemsGrid}>
                  {menuItems
                    .filter((item) => item.isAvailable === false)
                    .map((item) => {
                      const normalizeImagePath = (imagePath: string | undefined): string | null => {
                        if (!imagePath || imagePath.trim() === "") {
                          return null;
                        }
                        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                          return imagePath;
                        }
                        if (!imagePath.startsWith("/")) {
                          return "/" + imagePath;
                        }
                        return imagePath;
                      };
                      const imagePath = normalizeImagePath(item.image);
                      const hasValidImage = imagePath !== null;

                      return (
                        <div key={item._id} className={styles.menuItemCard}>
                          <div className={styles.itemImage}>
                            {hasValidImage ? (
                              <img src={imagePath} alt={item.name} />
                            ) : (
                              <div className={styles.imagePlaceholder}>
                                <i className="fa-solid fa-image"></i>
                                <span>No Image</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.itemInfo}>
                            <h4>{item.name}</h4>
                            <p>${item.price.toFixed(2)}</p>
                          </div>
                          <div className={styles.itemActions}>
                            <button
                              className={styles.addBackButton}
                              onClick={() => handleMarkItemAvailable(item._id)}
                            >
                              Add back to Menu
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Add New Item Form */}
            <div className={styles.addItemForm}>
              <h3>Add New Menu Item</h3>
              <form onSubmit={handleAddItem}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Item Name *</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Image URL *</label>
                  <input
                    type="text"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    placeholder="/image.jpg"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <button type="submit" className={styles.addButton}>
                  Add Item
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className={styles.menuItemsList}>
              <h3>Current Menu Items</h3>
              {menuItems.length === 0 ? (
                <p className={styles.emptyState}>No menu items yet</p>
              ) : (
                <div className={styles.itemsGrid}>
                  {menuItems.map((item) => {
                    // Normalize image path - ensure it starts with "/"
                    // Returns null if no valid path (prevents 404 errors)
                    const normalizeImagePath = (imagePath: string | undefined): string | null => {
                      if (!imagePath || imagePath.trim() === "") {
                        return null; // No image path - don't render image
                      }
                      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                        return imagePath;
                      }
                      if (!imagePath.startsWith("/")) {
                        return "/" + imagePath;
                      }
                      return imagePath;
                    };
                    const imagePath = normalizeImagePath(item.image);
                    const hasValidImage = imagePath !== null;
                    const isEditing = editingItemId === item._id;

                    return (
                    <div key={item._id} className={styles.menuItemCard}>
                      <div className={styles.itemImage}>
                        {hasValidImage ? (
                          <img src={imagePath} alt={item.name} />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <i className="fa-solid fa-image"></i>
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            />
                            <input
                              type="text"
                              value={editForm.image}
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                              placeholder="/image.jpg"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={editForm.rating}
                              onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                              placeholder="Rating"
                            />
                          </>
                        ) : (
                          <>
                            <h4>{item.name}</h4>
                            <p>${item.price.toFixed(2)}</p>
                            <p className={styles.ratingLine}>
                              Rating: {item.rating?.toFixed(1) ?? "0.0"} ({item.ratingCount ?? 0})
                            </p>
                          </>
                        )}
                      </div>
                      <div className={styles.itemActions}>
                        {isEditing ? (
                          <>
                            <button
                              className={styles.saveButton}
                              onClick={() => handleSaveEdit(item._id)}
                            >
                              Save
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            {item.isAvailable !== false && (
                              <button
                                className={styles.markUnavailableButton}
                                onClick={() => handleMarkItemUnavailable(item._id)}
                                title="Mark as unavailable"
                              >
                                Mark as Unavailable
                              </button>
                            )}
                            <button
                              className={styles.editButton}
                              onClick={() => startEditing(item)}
                            >
                              Edit
                            </button>
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDeleteItem(item._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Gallery Tab */}
        {activeTab === "gallery" && (
          <div className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>Gallery Management</h2>

            <div className={styles.galleryControls}>
              <div className={styles.galleryFormCard}>
                <h3>Add by URL</h3>
                <form onSubmit={handleAddPhotoByUrl}>
                  <div className={styles.formGroup}>
                    <label>Title (optional)</label>
                    <input
                      type="text"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      placeholder="e.g., Cafe Interior"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="/gallery/my-photo.jpg or https://..."
                    />
                  </div>
                  <div className={styles.galleryFormActions}>
                    <button type="submit" className={styles.addButton}>Add Photo</button>
                  </div>
                </form>
              </div>

              <div className={styles.galleryFormCard}>
                <h3>Upload Photo</h3>
                <form onSubmit={handleUploadPhoto}>
                  <div className={styles.formGroup}>
                    <label>Choose File</label>
                    <input type="file" accept="image/*" />
                  </div>
                  <div className={styles.galleryFormActions}>
                    <button type="submit" className={styles.addButton}>Upload</button>
                  </div>
                </form>
              </div>
            </div>

            <div className={styles.galleryList}>
              <h3>Current Photos</h3>
              {galleryLoading ? (
                <p>Loading photos...</p>
              ) : galleryPhotos.length === 0 ? (
                <p className={styles.emptyState}>No photos yet</p>
              ) : (
                <div className={styles.photoGrid}>
                  {galleryPhotos.map((photo) => (
                    <div key={photo._id} className={styles.photoCard}>
                      <div className={styles.photoImage}>
                        <img src={photo.url} alt={photo.title || "Gallery Photo"} />
                      </div>
                      <div className={styles.photoMeta}>
                        <p className={styles.photoTitle}>{photo.title || "Untitled"}</p>
                        <button
                          className={styles.photoDeleteButton}
                          onClick={() => handleDeletePhoto(photo._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
