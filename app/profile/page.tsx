"use client";

/**
 * USER PROFILE / ACCOUNT SETTINGS PAGE
 * 
 * Allows users to update their username and password.
 */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, updateUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Redirect if not authenticated or if admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "admin") {
      router.push("/admin");
    } else if (user) {
      setUsername(user.username);
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
   * UPDATE CREDENTIALS
   */
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate password if provided
    if (password) {
      if (password.length < 6) {
        setMessage({ type: "error", text: "Password must be at least 6 characters long" });
        return;
      }
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Passwords do not match" });
        return;
      }
    }

    // Validate username if changed
    if (username !== user?.username) {
      if (username.trim() === "") {
        setMessage({ type: "error", text: "Username cannot be empty" });
        return;
      }
    }

    // If nothing changed
    if (username === user?.username && !password) {
      setMessage({ type: "error", text: "No changes to save" });
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated" });
        return;
      }

      const response = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: username !== user?.username ? username.trim() : undefined,
          password: password ? password : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update user in context
        if (data.user) {
          updateUser(data.user);
        }

        setMessage({ type: "success", text: "Credentials updated successfully!" });
        setPassword("");
        setConfirmPassword("");

        // If username changed, update local state
        if (data.user?.username) {
          setUsername(data.user.username);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update credentials" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
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

      <div className={styles.pageContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Account Settings</h1>
          <p className={styles.pageSubtitle}>Update your username and password</p>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleUpdateCredentials} className={styles.form}>
            {/* Username Field */}
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                className={styles.input}
              />
              <small className={styles.helpText}>
                {username === user?.username ? "No change" : "Username will be updated"}
              </small>
            </div>

            {/* Password Field */}
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password (optional)</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (leave empty to keep current)"
                className={styles.input}
              />
              <small className={styles.helpText}>
                Leave empty if you don't want to change your password
              </small>
            </div>

            {/* Confirm Password Field */}
            {password && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={styles.input}
                />
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={message.type === "success" ? styles.successMessage : styles.errorMessage}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Updating..." : "Update Credentials"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
