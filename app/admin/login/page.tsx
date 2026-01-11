"use client";

/**
 * ADMIN LOGIN PAGE
 * 
 * Separate login page for administrators.
 * After successful login, admins are redirected to the admin dashboard.
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/menu");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    const result = await login(formData.username, formData.password);
    setLoading(false);

    if (result.success && result.user) {
      // Verify admin role
      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        setError("Access denied. Admin credentials required. Redirecting...");
        // Redirect non-admin users to regular menu
        setTimeout(() => {
          router.push("/menu");
        }, 2000);
      }
    } else {
      setError(result.error || "Invalid username or password");
    }
  };

  if (isAuthenticated && user?.role === "admin") {
    return null;
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.headerTitle}>Admin Login</h1>
        <p className={styles.headerSubtitle}>Administrator access only</p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Admin Dashboard</h2>
            <p className={styles.formSubtitle}>Sign in to manage the cafe</p>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter admin username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
                autoFocus
                disabled={loading}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter admin password"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login as Admin"}
            </button>

            <div className={styles.userSection}>
              <p className={styles.userText}>Regular user?</p>
              <Link href="/login" className={styles.userLink}>
                User Login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
