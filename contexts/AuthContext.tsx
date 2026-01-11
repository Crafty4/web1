"use client";

/**
 * AUTH CONTEXT (DATABASE-DRIVEN)
 * 
 * This context manages user authentication using a database.
 * Users log in through API calls, and credentials are verified
 * against the MongoDB database.
 * 
 * CHANGES FROM OLD VERSION:
 * - Uses API calls instead of localStorage for user storage
 * - Supports user roles (user vs admin)
 * - Stores JWT tokens for authentication
 */

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserFromStorage,
  setUserInStorage,
} from "@/lib/auth";

// Type for user information
type User = {
  id: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  role: "user" | "admin";
};

// Type for authentication context
type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  register: (username: string, password: string, email: string, phone: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  /**
   * LOAD AUTHENTICATION STATE ON MOUNT
   * 
   * Check if user was previously logged in (token exists).
   */
  useEffect(() => {
    const token = getAuthToken();
    const savedUser = getUserFromStorage();

    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
    }
  }, []);

  /**
   * REGISTER FUNCTION
   * 
   * Calls the API to create a new user account in the database.
   */
  const register = async (
    username: string,
    password: string,
    email: string,
    phone: string,
    address?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          email,
          phone,
          address: address || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  /**
   * LOGIN FUNCTION
   * 
   * Calls the API to verify credentials and log in.
   * Returns user role to determine where to redirect.
   */
  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      // Save token and user info
      setAuthToken(data.token);
      setUserInStorage(data.user);
      setIsAuthenticated(true);
      setUser(data.user);

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  /**
   * LOGOUT FUNCTION
   * 
   * Clears authentication state and removes token.
   */
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    removeAuthToken();
  };

  /**
   * UPDATE USER FUNCTION
   * 
   * Updates user information in state (e.g., address).
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setUserInStorage(updatedUser);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
