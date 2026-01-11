"use client";

/**
 * USER LOGIN PAGE
 * 
 * Login page for regular users.
 * After successful login, users are redirected to the menu page.
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "./page.module.css";

export default function UserLoginPage() {
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

    if (result.success) {
      // Redirect based on role
      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/menu");
      }
    } else {
      setError(result.error || "Login failed");
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.headerTitle}>User Login</h1>
        <p className={styles.headerSubtitle}>Sign in to order from Cafe Aroma</p>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>Sign in to your account</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
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
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className={styles.registerSection}>
              <p className={styles.registerText}>Don't have an account?</p>
              <Link href="/register" className={styles.registerLink}>
                Create account here
              </Link>
            </div>

            <div className={styles.adminSection}>
              <p className={styles.adminText}>Are you an admin?</p>
              <Link href="/admin/login" className={styles.adminLink}>
                Admin Login
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
