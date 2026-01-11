"use client";

/**
 * MENU CARD COMPONENT
 * 
 * WHAT IS A COMPONENT?
 * A component is a reusable piece of UI. Instead of writing the same HTML
 * for each menu item, we create one MenuCard component and reuse it.
 * 
 * PROPS:
 * Props are like function parameters - they let you pass data into a component.
 * This MenuCard receives a menu item and displays it.
 * 
 * In the old HTML version, each menu item was hardcoded like:
 *   <div class="card">
 *     <div class="img1"></div>
 *     <p>Melting Sandwich</p>
 *     ...
 *   </div>
 * 
 * Now we create it once and reuse it with different data.
 */

import React from "react";
import Image from "next/image";
import { MenuItem } from "@/data/menuItems";
import { useCart } from "@/contexts/CartContext";
import styles from "./MenuCard.module.css";

type MenuCardProps = {
  item: MenuItem & { isAvailable?: boolean }; // The menu item to display (with optional isAvailable)
  cafeSlug: string; // The slug of the cafe this item belongs to
};

export default function MenuCard({ item, cafeSlug }: MenuCardProps) {
  // Get the addToCart function from CartContext
  // This allows us to add items to the cart when user clicks "Add to cart"
  const { addToCart } = useCart();
  
  // Check if item is available (default to true if not specified)
  const isAvailable = item.isAvailable !== undefined ? item.isAvailable : true;

  /**
   * HANDLE ADD TO CART CLICK
   * 
   * When user clicks the "Add to cart" button, we call addToCart
   * with the current menu item. The CartContext handles updating
   * the cart state automatically.
   * 
   * In the old JS version, this was:
   *   button.addEventListener('click', () => {
   *     // Update DOM directly
   *   })
   * 
   * In React, we just call a function and React updates the UI.
   */
  const handleAddToCart = () => {
    // Prevent adding unavailable items to cart
    if (!isAvailable) {
      return;
    }
    // Add item to the specific cafe's cart
    addToCart(item, cafeSlug);
  };

  /**
   * NORMALIZE IMAGE PATH
   * 
   * Ensures the image path starts with "/" for Next.js Image component.
   * Returns null if no valid image path exists (prevents 404 errors).
   */
  const normalizeImagePath = (imagePath: string | undefined): string | null => {
    if (!imagePath || imagePath.trim() === "") {
      return null; // No image path - don't render image
    }
    
    // If it's already an absolute URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    
    // If it doesn't start with "/", add it
    if (!imagePath.startsWith("/")) {
      return "/" + imagePath;
    }
    
    return imagePath;
  };

  const imagePath = normalizeImagePath(item.image);
  const hasValidImage = imagePath !== null;

  return (
    <div className={`${styles.card} ${!isAvailable ? styles.unavailable : ""}`}>
      {/* 
        IMAGE DISPLAY
        Only render Image component if valid path exists.
        Otherwise show UI placeholder (no network request).
      */}
      {!isAvailable && (
        <div className={styles.unavailableOverlay}>
          <span>Unavailable</span>
        </div>
      )}
      <div className={styles.imageContainer}>
        {hasValidImage ? (
          <Image
            src={imagePath}
            alt={item.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <i className="fa-solid fa-image"></i>
            <span>No Image</span>
          </div>
        )}
      </div>

      {/* Item name */}
      <p className={styles.name}>{item.name}</p>

      {/* Item price - formatted to 2 decimal places */}
      <p className={styles.price}>${item.price.toFixed(2)}</p>

      {/* Item rating */}
      <p className={styles.rating}>
        Rating: {item.rating?.toFixed(1) ?? "0.0"}
        {item.ratingCount !== undefined && (
          <span className={styles.ratingCount}> ({item.ratingCount})</span>
        )}
      </p>

      {/* 
        ADD TO CART BUTTON
        onClick is React's way of handling button clicks.
        It's similar to addEventListener but simpler.
      */}
      <button 
        className={`${styles.addButton} ${!isAvailable ? styles.disabled : ""}`}
        onClick={handleAddToCart}
        disabled={!isAvailable}
      >
        {isAvailable ? "Add to cart" : "Unavailable"}
      </button>
    </div>
  );
}

/**
 * HOW THIS COMPONENT IS USED:
 * 
 * In the cafe page, we would use it like this:
 * 
 *   <MenuCard item={menuItem} />
 * 
 * React will render this component for each menu item,
 * automatically updating the display when the data changes.
 */
