"use client";

/**
 * REGISTRATION PAGE
 * 
 * This page allows users to create a new account.
 * After successful registration, user is redirected to login page.
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import styles from "./page.module.css";

export default function RegisterPage() {
  // Router for navigation
  const router = useRouter();
  const { isAuthenticated, register } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/menu");
    }
  }, [isAuthenticated, router]);

  // Form state - stores user input
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Error message state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * HANDLE INPUT CHANGE
   * Updates form state when user types in input fields
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    setError("");
  };

  /**
   * HANDLE FORM SUBMISSION
   * Validates input and registers the user
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation checks
    if (!formData.username || !formData.password || !formData.email || !formData.phone) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      // Try to register the user
      const result = await register(
        formData.username,
        formData.password,
        formData.email,
        formData.phone
      );

      if (result.success) {
        // Registration successful - redirect to login
        router.push("/login?registered=true");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if already logged in
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.page}>
      {/* Header section */}
      <section className={styles.header}>
        <h1 className={styles.headerTitle}>Create Account</h1>
      </section>

      {/* Form section */}
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Join White Chillies</h2>
            <p className={styles.formSubtitle}>Create your account to get started</p>
          </div>

          {/* Error message display */}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                className={styles.input}
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                className={styles.input}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password (min 4 characters)"
                className={styles.input}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                className={styles.input}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className={styles.loginSection}>
              <p className={styles.loginText}>Already have an account?</p>
              <Link href="/login" className={styles.loginLink}>
                Login here
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
