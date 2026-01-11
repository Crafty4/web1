"use client";

/**
 * CART CONTEXT
 * 
 * WHAT IS CONTEXT?
 * React Context is like a global storage box that any component in your app
 * can access. Instead of passing data from parent to child to grandchild
 * (called "prop drilling"), we create a Context that wraps the entire app.
 * 
 * WHY DO WE NEED IT?
 * In the old HTML/JS version, the cart was managed by directly manipulating
 * the DOM (document.querySelector). In React, we use state instead.
 * We need the cart data to be accessible from:
 * - The menu page (to add items)
 * - The cart sidebar (to display items)
 * - The navbar (to show cart count)
 * 
 * HOW IT WORKS:
 * 1. We create a Context that holds the cart state
 * 2. We create a Provider component that wraps our app
 * 3. Any component can "use" the context to read or update the cart
 */

import React, { createContext, useState, useContext, ReactNode } from "react";
import { MenuItem } from "@/data/menuItems";

/**
 * CART ITEM TYPE
 * 
 * A cart item is a menu item plus a quantity.
 * We store this separately because the user might add
 * the same item multiple times.
 */
type CartItem = {
  item: MenuItem; // The menu item details (name, price, etc.)
  quantity: number; // How many of this item in the cart
};

/**
 * CART CONTEXT TYPE
 * 
 * This defines what functions and data the context provides.
 * Carts are now cafe-specific - each cafe has its own independent cart.
 * 
 * Any component using this context will have access to:
 * - cartItems: array of items currently in the cart for the active cafe
 * - addToCart: function to add an item to the cart (requires cafe slug)
 * - removeFromCart: function to remove an item from the cart (requires cafe slug)
 * - updateQuantity: function to change the quantity of an item (requires cafe slug)
 * - clearCart: function to empty the cart (requires cafe slug)
 * - totalItems: total number of items in the current cafe's cart
 * - setActiveCafe: function to switch to a different cafe's cart
 */
type CartContextType = {
  cartItems: CartItem[];
  activeCafeSlug: string | null;
  addToCart: (item: MenuItem, cafeSlug: string) => void;
  removeFromCart: (itemId: string, cafeSlug: string) => void;
  updateQuantity: (itemId: string, quantity: number, cafeSlug: string) => void;
  clearCart: (cafeSlug: string) => void;
  setActiveCafe: (cafeSlug: string) => void;
  totalItems: number;
};

/**
 * CREATE THE CONTEXT
 * 
 * createContext creates an empty context with undefined as default.
 * We'll provide the actual values through the Provider component.
 */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CART PROVIDER COMPONENT
 * 
 * This component wraps your app and provides the cart state to all children.
 * It uses React's useState hook to manage the cart items.
 * 
 * STATE IN REACT:
 * - useState is a React hook that lets you store data that can change
 * - When state changes, React automatically re-renders components that use it
 * - This is different from variables - variables don't trigger re-renders
 */
export function CartProvider({ children }: { children: ReactNode }) {
  /**
   * CAFE-SPECIFIC CART STATE
   * 
   * Instead of a single global cart, we store multiple carts - one per cafe.
   * The key is the cafe slug (e.g., "aroma", "delight"), and the value is an array of cart items.
   * 
   * Example structure:
   * {
   *   "aroma": [{ item: {...}, quantity: 2 }, { item: {...}, quantity: 1 }],
   *   "delight": [{ item: {...}, quantity: 1 }]
   * }
   */
  const [cafeCarts, setCafeCarts] = useState<Record<string, CartItem[]>>({});
  
  /**
   * ACTIVE CAFE STATE
   * 
   * Tracks which cafe's cart we're currently viewing/editing.
   * When user navigates to a cafe page, we set this to that cafe's slug.
   */
  const [activeCafeSlug, setActiveCafeSlug] = useState<string | null>(null);

  /**
   * GET CURRENT CART ITEMS
   * 
   * Returns the cart items for the currently active cafe.
   * If no cafe is active, returns empty array.
   */
  const cartItems = activeCafeSlug ? (cafeCarts[activeCafeSlug] || []) : [];

  /**
   * ADD TO CART FUNCTION
   * 
   * Adds an item to a specific cafe's cart.
   * Each cafe maintains its own independent cart.
   * 
   * @param item - The menu item to add
   * @param cafeSlug - The slug of the cafe (e.g., "aroma", "delight")
   */
  const addToCart = (item: MenuItem, cafeSlug: string) => {
    setCafeCarts((prevCarts) => {
      // Get the current cart for this cafe (or empty array if it doesn't exist)
      const currentCart = prevCarts[cafeSlug] || [];
      
      // Check if item already exists in this cafe's cart
      const existingItem = currentCart.find((ci) => ci.item.id === item.id);

      let updatedCart: CartItem[];
      if (existingItem) {
        // Item exists: increase quantity by 1
        updatedCart = currentCart.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      } else {
        // Item doesn't exist: add new item with quantity 1
        updatedCart = [...currentCart, { item, quantity: 1 }];
      }

      // Update the cart for this specific cafe
      return {
        ...prevCarts,
        [cafeSlug]: updatedCart,
      };
    });
  };

  /**
   * REMOVE FROM CART FUNCTION
   * 
   * Completely removes an item from a specific cafe's cart.
   * 
   * @param itemId - The ID of the item to remove
   * @param cafeSlug - The slug of the cafe
   */
  const removeFromCart = (itemId: string, cafeSlug: string) => {
    setCafeCarts((prevCarts) => {
      const currentCart = prevCarts[cafeSlug] || [];
      const updatedCart = currentCart.filter((ci) => ci.item.id !== itemId);
      
      return {
        ...prevCarts,
        [cafeSlug]: updatedCart,
      };
    });
  };

  /**
   * UPDATE QUANTITY FUNCTION
   * 
   * Changes the quantity of an item in a specific cafe's cart.
   * If quantity becomes 0 or less, removes the item instead.
   * 
   * @param itemId - The ID of the item
   * @param quantity - The new quantity
   * @param cafeSlug - The slug of the cafe
   */
  const updateQuantity = (itemId: string, quantity: number, cafeSlug: string) => {
    if (quantity <= 0) {
      // If quantity is 0 or negative, remove item
      removeFromCart(itemId, cafeSlug);
    } else {
      // Otherwise, update the quantity
      setCafeCarts((prevCarts) => {
        const currentCart = prevCarts[cafeSlug] || [];
        const updatedCart = currentCart.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity } : ci
        );
        
        return {
          ...prevCarts,
          [cafeSlug]: updatedCart,
        };
      });
    }
  };

  /**
   * CLEAR CART FUNCTION
   * 
   * Empties a specific cafe's cart.
   * 
   * @param cafeSlug - The slug of the cafe whose cart to clear
   */
  const clearCart = (cafeSlug: string) => {
    setCafeCarts((prevCarts) => ({
      ...prevCarts,
      [cafeSlug]: [],
    }));
  };

  /**
   * SET ACTIVE CAFE FUNCTION
   * 
   * Switches to a different cafe's cart.
   * This is called when user navigates to a cafe page.
   * 
   * @param cafeSlug - The slug of the cafe to switch to
   */
  const setActiveCafe = (cafeSlug: string) => {
    setActiveCafeSlug(cafeSlug);
    // Initialize empty cart for this cafe if it doesn't exist
    setCafeCarts((prevCarts) => {
      if (!prevCarts[cafeSlug]) {
        return {
          ...prevCarts,
          [cafeSlug]: [],
        };
      }
      return prevCarts;
    });
  };

  /**
   * TOTAL ITEMS CALCULATION
   * 
   * Calculates the total number of items in the cart.
   * For example: 2 sandwiches + 3 pastas = 5 total items
   * 
   * We calculate this from the current cartItems state.
   */
  const totalItems = cartItems.reduce((sum, cartItem) => {
    return sum + cartItem.quantity;
  }, 0);

  /**
   * CONTEXT VALUE
   * 
   * This object is what we provide to all components that use the context.
   * It includes all the state and functions for managing cafe-specific carts.
   */
  const value: CartContextType = {
    cartItems,
    activeCafeSlug,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setActiveCafe,
    totalItems,
  };

  // Return the Provider component with the value
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * USE CART HOOK
 * 
 * This is a custom hook that components use to access the cart context.
 * It checks if the context exists and throws an error if used outside the Provider.
 * 
 * USAGE IN COMPONENTS:
 *   const { cartItems, addToCart } = useCart();
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
