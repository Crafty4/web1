/**
 * MENU ITEMS DATA FILE
 * 
 * This file contains all the menu items that are available across all cafes.
 * Instead of hardcoding menu items in each HTML page, we store them here
 * in one central location. This makes it easy to add, remove, or modify items.
 * 
 * Each menu item has:
 * - id: unique identifier (used by React to track items)
 * - name: the name of the dish
 * - price: cost in dollars
 * - rating: customer rating
 * - image: path to the image file
 */

// Define what a menu item looks like (TypeScript type)
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  rating: number;
  ratingCount?: number;
  image: string;
};

// All available menu items
export const allMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Melting Sandwich",
    price: 10.0,
    rating: 3.3,
    image: "/img12.jpg",
  },
  {
    id: "2",
    name: "Alfredo Pasta",
    price: 12.0,
    rating: 3.3,
    image: "/img9.jpg",
  },
  {
    id: "3",
    name: "Volcano Sandwich",
    price: 9.0,
    rating: 3.3,
    image: "/img6.jpg",
  },
  {
    id: "4",
    name: "Special Burger",
    price: 18.0,
    rating: 3.3,
    image: "/Burger.jpg",
  },
  {
    id: "5",
    name: "Pink Panther Sandwich",
    price: 7.0,
    rating: 3.3,
    image: "/img5.jpg",
  },
  {
    id: "6",
    name: "Cheese Chilly Grill Sandwich",
    price: 15.0,
    rating: 3.3,
    image: "/img4.jpg",
  },
  {
    id: "7",
    name: "Spaghetti and Balls",
    price: 20.0,
    rating: 3.3,
    image: "/Spaghetti.jpg",
  },
  {
    id: "8",
    name: "Masala Grill Sandwich",
    price: 11.0,
    rating: 3.3,
    image: "/img10.jpg",
  },
];

/**
 * CAFE CONFIGURATION
 * 
 * Each cafe can have a different order of menu items.
 * Instead of creating separate HTML files for each cafe,
 * we define which items each cafe shows and in what order.
 * 
 * The "slug" is the URL-friendly version of the cafe name:
 * - "aroma" maps to /cafe/aroma
 * - "delight" maps to /cafe/delight
 * etc.
 */

export type CafeConfig = {
  name: string; // Display name
  slug: string; // URL path (e.g., "aroma" for /cafe/aroma)
  menuItemIds: string[]; // Which menu items this cafe offers, and in what order
};

export const cafes: CafeConfig[] = [
  {
    name: "Cafe Aroma",
    slug: "aroma",
    // Cafe Aroma shows all 8 items in a specific order
    menuItemIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
  },
  {
    name: "Cafe Delight",
    slug: "delight",
    // Cafe Delight shows the same items but in different order
    menuItemIds: ["8", "3", "4", "5", "2", "6", "7", "1"],
  },
  {
    name: "Cafe Bliss",
    slug: "bliss",
    // Cafe Bliss has a different arrangement
    menuItemIds: ["5", "1", "2", "6", "7", "8", "4", "3"],
  },
  {
    name: "Cafe Suprime",
    slug: "suprime",
    // Cafe Suprime shows 7 items (no item #1 in this example, but we'll include it)
    menuItemIds: ["3", "7", "4", "2", "5", "6", "8", "1"],
  },
];

/**
 * Helper function to get menu items for a specific cafe
 * This function takes a cafe slug and returns the menu items
 * that cafe should display, in the correct order.
 */
export function getMenuItemsForCafe(slug: string): MenuItem[] {
  // Find the cafe configuration
  const cafe = cafes.find((c) => c.slug === slug);
  
  // If cafe not found, return empty array
  if (!cafe) {
    return [];
  }
  
  // Map the menu item IDs to actual menu item objects
  // This ensures items appear in the order specified by the cafe
  return cafe.menuItemIds
    .map((id) => allMenuItems.find((item) => item.id === id))
    .filter((item): item is MenuItem => item !== undefined); // Remove any undefined items
}

/**
 * Helper function to get cafe info by slug
 */
export function getCafeBySlug(slug: string): CafeConfig | undefined {
  return cafes.find((c) => c.slug === slug);
}
