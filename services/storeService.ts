
import { Product, CartItem, Category, Order } from '../types';
import { INITIAL_PRODUCTS } from '../constants';
import { notificationService } from './notificationService';

// In-memory "Database"
let products: Product[] = [...INITIAL_PRODUCTS];
let cart: CartItem[] = [];
let categories: string[] = Object.values(Category);

// Initialize orders from localStorage
const STORAGE_KEY_ORDERS = 'shopperz_orders';
let orders: Order[] = [];

// Initialize wishlist from localStorage
const STORAGE_KEY_WISHLIST = 'shopperz_wishlist';
let wishlist: string[] = [];

try {
  const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (savedOrders) {
    orders = JSON.parse(savedOrders);
  }
  
  const savedWishlist = localStorage.getItem(STORAGE_KEY_WISHLIST);
  if (savedWishlist) {
    wishlist = JSON.parse(savedWishlist);
  }
} catch (e) {
  console.error("Failed to load data from local storage", e);
}

// Subscribers for simple reactivity
const listeners: Set<() => void> = new Set();

const notify = () => {
  listeners.forEach(l => l());
};

const saveOrders = () => {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save orders to local storage", e);
  }
};

const saveWishlist = () => {
  try {
    localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
  } catch (e) {
    console.error("Failed to save wishlist to local storage", e);
  }
};

export const storeService = {
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getProducts: () => [...products],
  
  getCart: () => [...cart],

  getCategories: () => [...categories],

  getOrders: () => [...orders],

  getWishlist: () => [...wishlist],

  addCategory: (newCategory: string) => {
    if (!categories.includes(newCategory) && newCategory.trim() !== "") {
      categories = [...categories, newCategory];
      notify();
    }
  },

  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews'>) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      rating: 0,
      reviews: 0
    };
    products = [newProduct, ...products];
    notify();
  },

  updateProduct: (updatedProduct: Product) => {
    products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    
    // Also update this item in the cart if it exists, to reflect price/name/image changes immediately
    cart = cart.map(item => 
      item.id === updatedProduct.id 
        ? { ...item, ...updatedProduct, quantity: item.quantity } 
        : item
    );
    
    notify();
  },

  deleteProduct: (id: string) => {
    products = products.filter(p => p.id !== id);
    // Remove from cart if product is deleted
    cart = cart.filter(item => item.id !== id);
    notify();
  },

  addToCart: (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      cart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      cart = [...cart, { ...product, quantity: 1 }];
    }
    notify();
    notificationService.notify(`Added ${product.name} to cart`);
  },

  removeFromCart: (id: string) => {
    cart = cart.filter(item => item.id !== id);
    notify();
  },

  updateCartQuantity: (id: string, delta: number) => {
    cart = cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    notify();
  },

  clearCart: () => {
    cart = [];
    notify();
  },

  getTotalPrice: () => {
    return cart.reduce((total, item) => {
      const price = item.isOnSale && item.salePrice ? item.salePrice : item.price;
      return total + (price * item.quantity);
    }, 0);
  },

  addOrder: (order: Order) => {
    orders = [order, ...orders];
    saveOrders();
    notify();
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    let customerName = '';
    orders = orders.map(o => {
      if (o.id === orderId) {
        customerName = o.customerName;
        const history = o.statusHistory || [];
        
        let note = 'Status updated.';
        if (status === 'Shipped') note = 'Package has been shipped.';
        else if (status === 'Out for Delivery') note = 'Your package is out for delivery.';
        else if (status === 'Delivered') note = 'Package delivered.';
        else if (status === 'Cancelled') note = 'Order cancelled by customer.';

        const newEntry = {
          status: status,
          date: new Date().toISOString(),
          note: note
        };
        
        return { 
          ...o, 
          status, 
          statusHistory: [...history, newEntry]
        };
      }
      return o;
    });
    saveOrders();
    notify();
    
    // Trigger notification
    notificationService.notify(`Order #${orderId} is now ${status}`);
  },

  updateOrderTracking: (orderId: string, trackingId: string, trackingUrl?: string) => {
    orders = orders.map(o => o.id === orderId ? { ...o, trackingId, trackingUrl } : o);
    saveOrders();
    notify();
    notificationService.notify(`Tracking updated for Order #${orderId}`);
  },

  toggleWishlist: (productId: string) => {
    const exists = wishlist.includes(productId);
    if (exists) {
      wishlist = wishlist.filter(id => id !== productId);
      notificationService.notify('Removed from Wishlist');
    } else {
      wishlist = [...wishlist, productId];
      notificationService.notify('Added to Wishlist');
    }
    saveWishlist();
    notify();
  }
};
